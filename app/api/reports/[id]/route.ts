import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const reportItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(200),
  condition: z.enum(['good', 'fair', 'poor', 'not_inspected']).nullable(),
  comment: z.string().max(4000).nullable(),
  recommendation: z.enum(['none', 'monitor', 'repair', 'replace', 'safety_hazard']).nullable(),
  photo_urls: z.array(z.string()).max(20),
})

const reportSectionSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(200),
  items: z.array(reportItemSchema).max(500),
})

const payloadSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  sections: z.array(reportSectionSchema).max(100),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const parsed = payloadSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid report template payload' }, { status: 400 })
  }

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('report_templates')
    .update({
      ...parsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
