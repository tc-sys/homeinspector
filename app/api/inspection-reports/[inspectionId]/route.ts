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
  template_id: z.string().uuid(),
  status: z.enum(['draft', 'finalized']).default('draft'),
  answers: z.array(reportSectionSchema).max(100),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ inspectionId: string }> }
) {
  const { inspectionId } = await params
  const parsed = payloadSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid inspection report payload' }, { status: 400 })
  }

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: inspection } = await supabase
    .from('inspections')
    .select('id')
    .eq('id', inspectionId)
    .eq('user_id', user.id)
    .single()

  if (!inspection) {
    return NextResponse.json({ error: 'Inspection not found' }, { status: 404 })
  }

  const payload = parsed.data
  const now = new Date().toISOString()
  const { error } = await supabase
    .from('inspection_reports')
    .upsert({
      inspection_id: inspectionId,
      template_id: payload.template_id,
      status: payload.status,
      answers: payload.answers,
      updated_at: now,
      finalized_at: payload.status === 'finalized' ? now : null,
    }, { onConflict: 'inspection_id' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
