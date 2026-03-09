import { notFound } from 'next/navigation'
import { isDemoMode, DEMO_REPORT_TEMPLATES } from '@/lib/demo'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Inspection, ReportTemplate, UserProfile } from '@/types'
import { TemplateEditor } from './template-editor'

export const dynamic = 'force-dynamic'

export default async function ReportTemplatePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ inspection?: string }>
}) {
  const { id } = await params
  const { inspection: inspectionId } = await searchParams
  let template: ReportTemplate | null = null
  let inspectionContext: Inspection | null = null
  let profileContext: Partial<UserProfile> | null = null

  if (isDemoMode()) {
    template = DEMO_REPORT_TEMPLATES.find(t => t.id === id) ?? null
    if (!template) notFound()
    profileContext = {
      company_name: 'Professional Home Inspections LLC',
      full_name: 'KC Bartley',
      phone: '(423) 306-0508',
      email: 'kc@prohitn.com',
      website: 'https://www.prohitn.com',
      logo_url: null,
      inspector_photo_url: null,
      default_cover_photo_url: null,
    }
  } else {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    const [{ data }, inspectionResult, profileResult] = await Promise.all([
      supabase
      .from('report_templates')
      .select('*')
      .eq('id', id)
      .eq('user_id', user!.id)
      .single(),
      inspectionId
        ? supabase
          .from('inspections')
          .select('*, client:clients(*)')
          .eq('id', inspectionId)
          .eq('user_id', user!.id)
          .single()
        : Promise.resolve({ data: null }),
      supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user!.id)
        .single(),
    ])
    if (!data) notFound()
    template = data as ReportTemplate
    inspectionContext = inspectionResult.data as Inspection | null
    profileContext = profileResult.data as Partial<UserProfile> | null
  }

  return (
    <TemplateEditor
      template={template!}
      inspectionContext={inspectionContext}
      profileContext={profileContext}
    />
  )
}
