import { notFound } from 'next/navigation'
import { isDemoMode, DEMO_REPORT_TEMPLATES } from '@/lib/demo'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { ReportTemplate } from '@/types'
import { TemplateEditor } from './template-editor'

export const dynamic = 'force-dynamic'

export default async function ReportTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let template: ReportTemplate | null = null

  if (isDemoMode()) {
    template = DEMO_REPORT_TEMPLATES.find(t => t.id === id) ?? null
    if (!template) notFound()
  } else {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('report_templates')
      .select('*')
      .eq('id', id)
      .eq('user_id', user!.id)
      .single()
    if (!data) notFound()
    template = data as ReportTemplate
  }

  return (
    <TemplateEditor
      template={template!}
      mode="template"
    />
  )
}
