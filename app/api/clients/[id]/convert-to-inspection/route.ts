import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { isDemoMode, DEMO_INSPECTIONS, DEMO_USER_ID } from '@/lib/demo'
import {
  getDemoOverrideBundleFromCookieHeader,
  getMergedDemoData,
  upsertById,
  writeDemoOverrides,
} from '@/lib/demo-state'
import type { Client, Inspection, Invoice } from '@/types'
import { combineLocalDateTime, rangesOverlap, toISODateLocal } from '@/lib/utils'

const payloadSchema = z.object({
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  scheduled_time: z.string().regex(/^\d{2}:\d{2}$/),
  duration_minutes: z.number().int().min(30).max(480).default(180),
  notes: z.string().max(4000).optional().nullable(),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const parsed = payloadSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid inspection conversion payload' }, { status: 400 })
  }

  const payload = parsed.data
  if (payload.scheduled_date < toISODateLocal()) {
    return NextResponse.json({ error: 'Scheduled date must be today or later' }, { status: 400 })
  }

  if (isDemoMode()) {
    const overrideBundle = getDemoOverrideBundleFromCookieHeader(request.headers.get('cookie'))
    const demoData = getMergedDemoData(overrideBundle)
    const client = demoData.clients.find(entry => entry.id === id)

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    if (!client.lead_street || !client.lead_city || !client.lead_state || !client.lead_zip) {
      return NextResponse.json({ error: 'Lead is missing a property address' }, { status: 400 })
    }

    if (client.converted_inspection_id) {
      return NextResponse.json({ ok: true, inspectionId: client.converted_inspection_id })
    }

    const proposedStart = combineLocalDateTime(payload.scheduled_date, payload.scheduled_time)
    const proposedEnd = new Date(proposedStart.getTime() + payload.duration_minutes * 60_000)
    const overlapCount = demoData.inspections.filter(item => {
      if (item.status === 'cancelled' || item.scheduled_date !== payload.scheduled_date) return false
      const existingStart = combineLocalDateTime(payload.scheduled_date, item.scheduled_time.slice(0, 5))
      const existingEnd = new Date(existingStart.getTime() + item.duration_minutes * 60_000)
      return rangesOverlap(proposedStart, proposedEnd, existingStart, existingEnd)
    }).length

    if (overlapCount > 0) {
      return NextResponse.json({ error: `This time overlaps ${overlapCount} existing inspection(s).` }, { status: 409 })
    }

    const newInspection = buildDemoInspection(client, payload)
    const newInvoice = buildDemoInvoice(client, newInspection)
    const nextClient: Client = {
      ...client,
      pipeline_stage: 'converted',
      converted_inspection_id: newInspection.id,
      updated_at: new Date().toISOString(),
    }

    const response = NextResponse.json({ ok: true, inspectionId: newInspection.id })
    writeDemoOverrides(response, {
      clients: upsertById(overrideBundle.clients, nextClient),
      inspections: upsertById(overrideBundle.inspections, newInspection),
      invoices: upsertById(overrideBundle.invoices, newInvoice),
    })

    return response
  }

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  if (client.converted_inspection_id) {
    return NextResponse.json({ ok: true, inspectionId: client.converted_inspection_id })
  }

  if (!client.lead_street || !client.lead_city || !client.lead_state || !client.lead_zip) {
    return NextResponse.json({ error: 'Lead is missing a property address' }, { status: 400 })
  }

  const { data: conflicts } = await supabase
    .from('inspections')
    .select('id, scheduled_time, duration_minutes')
    .eq('user_id', user.id)
    .eq('scheduled_date', payload.scheduled_date)
    .neq('status', 'cancelled')

  const proposedStart = combineLocalDateTime(payload.scheduled_date, payload.scheduled_time)
  const proposedEnd = new Date(proposedStart.getTime() + payload.duration_minutes * 60_000)
  const overlapCount = (conflicts ?? []).filter((item: { scheduled_time: string; duration_minutes: number }) => {
    const existingStart = combineLocalDateTime(payload.scheduled_date, item.scheduled_time.slice(0, 5))
    const existingEnd = new Date(existingStart.getTime() + item.duration_minutes * 60_000)
    return rangesOverlap(proposedStart, proposedEnd, existingStart, existingEnd)
  }).length

  if (overlapCount > 0) {
    return NextResponse.json({ error: `This time overlaps ${overlapCount} existing inspection(s).` }, { status: 409 })
  }

  const combinedNotes = [client.lead_notes, payload.notes?.trim() || null]
    .filter(Boolean)
    .join('\n\n')

  const { data: inspection, error: inspectionError } = await supabase
    .from('inspections')
    .insert({
      user_id: user.id,
      client_id: client.id,
      address: client.lead_street,
      city: client.lead_city,
      state: client.lead_state,
      zip: client.lead_zip,
      scheduled_date: payload.scheduled_date,
      scheduled_time: payload.scheduled_time,
      duration_minutes: payload.duration_minutes,
      inspection_type: 'General Home Inspection',
      notes: combinedNotes || null,
      price: 0,
      status: 'scheduled',
      report_locked: false,
      client_portal_token: crypto.randomUUID(),
    })
    .select()
    .single()

  if (inspectionError || !inspection) {
    return NextResponse.json({ error: inspectionError?.message ?? 'Failed to create inspection' }, { status: 500 })
  }

  const { error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      user_id: user.id,
      inspection_id: inspection.id,
      client_id: client.id,
      amount: 0,
      tax_amount: 0,
      total_amount: 0,
      status: 'pending',
      pass_card_fee: false,
      notes: 'Created from lead scheduling request.',
    })

  if (invoiceError) {
    return NextResponse.json({ error: invoiceError.message }, { status: 500 })
  }

  const { error: clientError } = await supabase
    .from('clients')
    .update({
      pipeline_stage: 'converted',
      converted_inspection_id: inspection.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', client.id)
    .eq('user_id', user.id)

  if (clientError) {
    return NextResponse.json({ error: clientError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, inspectionId: inspection.id })
}

function buildDemoInspection(
  client: Client,
  payload: z.infer<typeof payloadSchema>
): Inspection {
  const nextIndex = DEMO_INSPECTIONS.length + 1
  const combinedNotes = [client.lead_notes, payload.notes?.trim() || null]
    .filter(Boolean)
    .join('\n\n')

  return {
    id: `inspection-demo-${crypto.randomUUID()}`,
    user_id: DEMO_USER_ID,
    client_id: client.id,
    agent_id: null,
    service_id: null,
    template_id: null,
    address: client.lead_street ?? client.address ?? 'Address pending',
    city: client.lead_city ?? '',
    state: client.lead_state ?? '',
    zip: client.lead_zip ?? '',
    scheduled_date: payload.scheduled_date,
    scheduled_time: payload.scheduled_time,
    duration_minutes: payload.duration_minutes,
    status: 'scheduled',
    inspection_type: 'General Home Inspection',
    notes: combinedNotes || null,
    square_footage: null,
    year_built: null,
    price: 0,
    report_locked: false,
    cover_photo_url: null,
    client_portal_token: `demo-portal-${nextIndex}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    client,
  }
}

function buildDemoInvoice(client: Client, inspection: Inspection): Invoice {
  return {
    id: `invoice-demo-${crypto.randomUUID()}`,
    user_id: DEMO_USER_ID,
    inspection_id: inspection.id,
    client_id: client.id,
    amount: 0,
    tax_amount: 0,
    total_amount: 0,
    status: 'pending',
    due_date: inspection.scheduled_date,
    paid_date: null,
    stripe_payment_intent_id: null,
    stripe_payment_link: null,
    pass_card_fee: false,
    notes: 'Created from demo scheduling request.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    client,
    inspection,
  }
}
