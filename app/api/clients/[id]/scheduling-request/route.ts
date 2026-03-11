import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { isDemoMode } from '@/lib/demo'
import {
  getDemoOverrideBundleFromCookieHeader,
  getMergedDemoData,
  upsertById,
  writeDemoOverrides,
} from '@/lib/demo-state'
import { toISODateLocal } from '@/lib/utils'

const availabilityOptionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
})

const payloadSchema = z.object({
  lead_street: z.string().trim().min(1).max(200),
  lead_city: z.string().trim().min(1).max(120),
  lead_state: z.string().trim().min(2).max(2),
  lead_zip: z.string().trim().min(5).max(10),
  lead_availability: z.array(availabilityOptionSchema).min(2).max(5),
  lead_notes: z.string().max(4000).optional().nullable(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const parsed = payloadSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid scheduling request payload' }, { status: 400 })
  }

  const payload = parsed.data
  const today = toISODateLocal()
  const seen = new Set<string>()

  for (const option of payload.lead_availability) {
    if (option.date < today) {
      return NextResponse.json({ error: 'Availability dates must be today or later' }, { status: 400 })
    }
    const key = `${option.date}-${option.time}`
    if (seen.has(key)) {
      return NextResponse.json({ error: 'Duplicate availability options are not allowed' }, { status: 400 })
    }
    seen.add(key)
  }

  if (isDemoMode()) {
    const existingOverrides = getDemoOverrideBundleFromCookieHeader(request.headers.get('cookie'))
    const currentClient = getMergedDemoData(existingOverrides).clients.find(client => client.id === id)
    if (!currentClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const response = NextResponse.json({ ok: true })
    const nextClient = {
      ...currentClient,
      pipeline_stage: 'schedule' as const,
      lead_street: payload.lead_street,
      lead_city: payload.lead_city,
      lead_state: payload.lead_state.toUpperCase(),
      lead_zip: payload.lead_zip,
      lead_availability: payload.lead_availability,
      lead_notes: payload.lead_notes?.trim() || null,
      sent_to_schedule_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    writeDemoOverrides(response, {
      clients: upsertById(existingOverrides.clients, nextClient),
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
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  const { error } = await supabase
    .from('clients')
    .update({
      pipeline_stage: 'schedule',
      lead_street: payload.lead_street,
      lead_city: payload.lead_city,
      lead_state: payload.lead_state.toUpperCase(),
      lead_zip: payload.lead_zip,
      lead_availability: payload.lead_availability,
      lead_notes: payload.lead_notes?.trim() || null,
      sent_to_schedule_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
