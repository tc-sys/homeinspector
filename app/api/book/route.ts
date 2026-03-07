import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase-server'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { combineLocalDateTime, rangesOverlap, toISODateLocal } from '@/lib/utils'
import { getRequestIp, isRateLimited } from '@/lib/rate-limit'

const bookSchema = z.object({
  booking_slug: z.string().trim().min(3).max(64),
  first_name: z.string().trim().min(1).max(100),
  last_name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  address: z.string().trim().min(1).max(255),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(2).max(2),
  zip: z.string().trim().min(3).max(12),
  preferred_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  preferred_time: z.string().regex(/^\d{2}:\d{2}/),
  service_id: z.string().uuid().optional().or(z.literal('')),
  square_footage: z.string().optional().or(z.literal('')),
  notes: z.string().max(4000).optional().or(z.literal('')),
})

export async function POST(request: Request) {
  const ip = getRequestIp(request)
  if (isRateLimited(`public-book:${ip}`, 15, 15 * 60_000)) {
    return NextResponse.json({ error: 'Too many booking attempts. Please try again later.' }, { status: 429 })
  }

  const raw = await request.json()
  const parsed = bookSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 })
  }

  const data = parsed.data
  const preferredDate = data.preferred_date
  if (preferredDate < toISODateLocal()) {
    return NextResponse.json({ error: 'Preferred date must be in the future' }, { status: 400 })
  }

  const supabase = await createServiceRoleClient()
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('booking_slug', data.booking_slug)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Inspector not found' }, { status: 404 })
  }

  // Get service price if selected
  let price = 0
  let duration = 180
  if (data.service_id) {
    const { data: service } = await supabase
      .from('services')
      .select('base_price, duration_minutes')
      .eq('id', data.service_id)
      .eq('user_id', profile.id)
      .eq('active', true)
      .single()
    if (service) {
      price = service.base_price
      duration = service.duration_minutes
    }
  }

  const proposedStart = combineLocalDateTime(preferredDate, data.preferred_time)
  const proposedEnd = new Date(proposedStart.getTime() + duration * 60_000)

  const { data: existingInspections } = await supabase
    .from('inspections')
    .select('scheduled_time, duration_minutes')
    .eq('user_id', profile.id)
    .eq('scheduled_date', preferredDate)
    .neq('status', 'cancelled')
  const { data: blockedEvents } = await supabase
    .from('calendar_events')
    .select('start_time, end_time')
    .eq('user_id', profile.id)
    .eq('is_available', false)
    .gte('start_time', `${preferredDate}T00:00:00`)
    .lt('start_time', `${preferredDate}T23:59:59`)

  const conflicting = (existingInspections ?? []).some(item => {
    const existingStart = combineLocalDateTime(preferredDate, item.scheduled_time.slice(0, 5))
    const existingEnd = new Date(existingStart.getTime() + item.duration_minutes * 60_000)
    return rangesOverlap(proposedStart, proposedEnd, existingStart, existingEnd)
  })
  const blocked = (blockedEvents ?? []).some(item => {
    const start = new Date(item.start_time)
    const end = new Date(item.end_time)
    return rangesOverlap(proposedStart, proposedEnd, start, end)
  })

  if (conflicting || blocked) {
    return NextResponse.json({ error: 'Selected time is no longer available.' }, { status: 409 })
  }

  // Create or find client
  let clientId: string | null = null
  const { data: existingClient } = await supabase
    .from('clients')
    .select('id')
    .eq('email', data.email)
    .eq('user_id', profile.id)
    .single()

  if (existingClient) {
    clientId = existingClient.id
  } else {
    const { data: newClient } = await supabase
      .from('clients')
      .insert({
        user_id: profile.id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone || null,
        tags: [],
      })
      .select()
      .single()
    if (newClient) clientId = newClient.id
  }

  // Create inspection
  const { data: inspection, error } = await supabase
    .from('inspections')
    .insert({
      user_id: profile.id,
      client_id: clientId,
      service_id: data.service_id || null,
      address: data.address,
      city: data.city,
      state: data.state.toUpperCase(),
      zip: data.zip,
      scheduled_date: preferredDate,
      scheduled_time: data.preferred_time,
      duration_minutes: duration,
      inspection_type: 'General Home Inspection',
      price,
      square_footage: data.square_footage ? parseInt(data.square_footage, 10) : null,
      notes: data.notes || null,
      status: 'scheduled',
      report_locked: true,
      client_portal_token: randomUUID(),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Auto-create invoice
  if (price > 0) {
    await supabase.from('invoices').insert({
      user_id: profile.id,
      inspection_id: inspection.id,
      client_id: clientId,
      amount: price,
      tax_amount: 0,
      total_amount: price,
      status: 'pending',
      pass_card_fee: false,
    })
  }

  return NextResponse.json({
    ok: true,
    inspectionId: inspection.id,
    manageUrl: `/booking/manage/${inspection.client_portal_token}`,
  })
}
