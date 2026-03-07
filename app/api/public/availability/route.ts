import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceRoleClient } from '@/lib/supabase-server'
import { combineLocalDateTime, rangesOverlap } from '@/lib/utils'
import { getRequestIp, isRateLimited } from '@/lib/rate-limit'

const querySchema = z.object({
  slug: z.string().trim().min(3).max(64),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  serviceId: z.string().uuid().optional(),
})

function toTimeValue(date: Date): string {
  const h = `${date.getHours()}`.padStart(2, '0')
  const m = `${date.getMinutes()}`.padStart(2, '0')
  return `${h}:${m}`
}

export async function GET(request: Request) {
  const ip = getRequestIp(request)
  if (isRateLimited(`public-availability:${ip}`, 120, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const url = new URL(request.url)
  const parsed = querySchema.safeParse({
    slug: url.searchParams.get('slug') ?? '',
    date: url.searchParams.get('date') ?? '',
    serviceId: url.searchParams.get('serviceId') ?? undefined,
  })
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid availability request' }, { status: 400 })
  }

  const supabase = await createServiceRoleClient()
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('booking_slug', parsed.data.slug)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Inspector not found' }, { status: 404 })
  }

  let durationMinutes = 180
  if (parsed.data.serviceId) {
    const { data: service } = await supabase
      .from('services')
      .select('duration_minutes')
      .eq('id', parsed.data.serviceId)
      .eq('user_id', profile.id)
      .eq('active', true)
      .single()
    if (service?.duration_minutes) durationMinutes = service.duration_minutes
  }

  const [{ data: inspections }, { data: blocked }] = await Promise.all([
    supabase
      .from('inspections')
      .select('scheduled_time, duration_minutes')
      .eq('user_id', profile.id)
      .eq('scheduled_date', parsed.data.date)
      .neq('status', 'cancelled'),
    supabase
      .from('calendar_events')
      .select('start_time, end_time')
      .eq('user_id', profile.id)
      .eq('is_available', false)
      .gte('start_time', `${parsed.data.date}T00:00:00`)
      .lt('start_time', `${parsed.data.date}T23:59:59`),
  ])

  const openings: string[] = []
  for (let hour = 8; hour < 18; hour++) {
    for (const minute of [0, 30]) {
      const start = combineLocalDateTime(parsed.data.date, `${`${hour}`.padStart(2, '0')}:${`${minute}`.padStart(2, '0')}`)
      const end = new Date(start.getTime() + durationMinutes * 60_000)
      if (end.getHours() > 18 || (end.getHours() === 18 && end.getMinutes() > 0)) continue

      const conflictsInspection = (inspections ?? []).some(item => {
        const itemStart = combineLocalDateTime(parsed.data.date, item.scheduled_time.slice(0, 5))
        const itemEnd = new Date(itemStart.getTime() + item.duration_minutes * 60_000)
        return rangesOverlap(start, end, itemStart, itemEnd)
      })
      if (conflictsInspection) continue

      const conflictsBlocked = (blocked ?? []).some(item => {
        const itemStart = new Date(item.start_time)
        const itemEnd = new Date(item.end_time)
        return rangesOverlap(start, end, itemStart, itemEnd)
      })
      if (conflictsBlocked) continue

      openings.push(toTimeValue(start))
    }
  }

  return NextResponse.json({ slots: openings })
}
