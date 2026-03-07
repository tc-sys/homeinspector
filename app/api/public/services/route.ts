import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceRoleClient } from '@/lib/supabase-server'
import type { PublicBookingProfile, Service } from '@/types'
import { getRequestIp, isRateLimited } from '@/lib/rate-limit'

const querySchema = z.object({
  slug: z.string().trim().min(3).max(64),
})

export async function GET(request: Request) {
  const ip = getRequestIp(request)
  if (isRateLimited(`public-services:${ip}`, 120, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const url = new URL(request.url)
  const parsed = querySchema.safeParse({ slug: url.searchParams.get('slug') ?? '' })
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid booking URL' }, { status: 400 })
  }

  const supabase = await createServiceRoleClient()
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id, company_name, full_name, phone, booking_slug')
    .eq('booking_slug', parsed.data.slug)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Inspector not found' }, { status: 404 })
  }

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('user_id', profile.id)
    .eq('active', true)
    .order('base_price')

  return NextResponse.json({
    profile: profile as PublicBookingProfile,
    services: (services ?? []) as Service[],
  })
}
