import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceRoleClient } from '@/lib/supabase-server'
import { combineLocalDateTime, rangesOverlap, toISODateLocal } from '@/lib/utils'
import { getRequestIp, isRateLimited } from '@/lib/rate-limit'

const payloadSchema = z.object({
  token: z.string().uuid(),
  action: z.enum(['cancel', 'reschedule']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  time: z.string().regex(/^\d{2}:\d{2}/).optional(),
})

export async function POST(request: Request) {
  const ip = getRequestIp(request)
  if (isRateLimited(`public-manage:${ip}`, 30, 15 * 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const parsed = payloadSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 })
  }

  const supabase = await createServiceRoleClient()
  const { data: inspection } = await supabase
    .from('inspections')
    .select('id, user_id, scheduled_date, scheduled_time, duration_minutes, status')
    .eq('client_portal_token', parsed.data.token)
    .single()

  if (!inspection) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  if (inspection.status === 'cancelled') {
    return NextResponse.json({ error: 'Booking is already cancelled' }, { status: 409 })
  }

  if (parsed.data.action === 'cancel') {
    await supabase
      .from('inspections')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', inspection.id)
    return NextResponse.json({ ok: true })
  }

  if (!parsed.data.date || !parsed.data.time) {
    return NextResponse.json({ error: 'Date and time are required' }, { status: 400 })
  }
  if (parsed.data.date < toISODateLocal()) {
    return NextResponse.json({ error: 'Date must be in the future' }, { status: 400 })
  }

  const proposedStart = combineLocalDateTime(parsed.data.date, parsed.data.time)
  const proposedEnd = new Date(proposedStart.getTime() + inspection.duration_minutes * 60_000)
  const { data: sameDay } = await supabase
    .from('inspections')
    .select('id, scheduled_time, duration_minutes')
    .eq('user_id', inspection.user_id)
    .eq('scheduled_date', parsed.data.date)
    .neq('status', 'cancelled')
    .neq('id', inspection.id)

  const conflicts = (sameDay ?? []).some(item => {
    const start = combineLocalDateTime(parsed.data.date!, item.scheduled_time.slice(0, 5))
    const end = new Date(start.getTime() + item.duration_minutes * 60_000)
    return rangesOverlap(proposedStart, proposedEnd, start, end)
  })
  if (conflicts) {
    return NextResponse.json({ error: 'Selected time is unavailable' }, { status: 409 })
  }

  await supabase
    .from('inspections')
    .update({
      scheduled_date: parsed.data.date,
      scheduled_time: parsed.data.time,
      updated_at: new Date().toISOString(),
    })
    .eq('id', inspection.id)

  return NextResponse.json({ ok: true })
}
