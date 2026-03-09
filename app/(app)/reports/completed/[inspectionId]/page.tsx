import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { TemplateEditor } from '../../[id]/template-editor'
import {
  isDemoMode,
  DEMO_INSPECTION_REPORTS,
  DEMO_INSPECTIONS,
  DEMO_REPORT_TEMPLATES,
} from '@/lib/demo'
import type { Inspection, ReportTemplate, UserProfile } from '@/types'

export const dynamic = 'force-dynamic'

export default async function CompletedReportPage({
  params,
}: {
  params: Promise<{ inspectionId: string }>
}) {
  const { inspectionId } = await params
  let inspection: Inspection | null = null
  let template: ReportTemplate | null = null
  let reportAnswers: ReportTemplate['sections'] | null = null
  let reportStatus: 'draft' | 'finalized' = 'draft'
  let profileContext: Partial<UserProfile> | null = null

  if (isDemoMode()) {
    inspection = DEMO_INSPECTIONS.find(i => i.id === inspectionId) ?? null
    if (!inspection) notFound()
    const report = DEMO_INSPECTION_REPORTS.find(r => r.inspection_id === inspectionId) ?? null
    template = DEMO_REPORT_TEMPLATES.find(t => t.id === (inspection!.template_id ?? report?.template_id)) ?? DEMO_REPORT_TEMPLATES[0]
    reportAnswers = report?.answers ?? template.sections
    reportStatus = report?.status ?? 'draft'
    profileContext = {
      company_name: 'Keystone Premier Home Contracting Group',
      full_name: 'Avery Thompson',
      phone: '(267) 555-0184',
      email: 'reports@keystonepremierexample.com',
      website: 'https://keystonepremierexample.com',
      logo_url: null,
      inspector_photo_url: null,
      default_cover_photo_url: null,
    }
  } else {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    const [{ data: inspectionData }, { data: profileData }] = await Promise.all([
      supabase
        .from('inspections')
        .select('*, client:clients(*)')
        .eq('id', inspectionId)
        .eq('user_id', user!.id)
        .single(),
      supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user!.id)
        .single(),
    ])
    if (!inspectionData) notFound()
    inspection = inspectionData as Inspection
    profileContext = profileData as Partial<UserProfile> | null

    const reportPromise = supabase
      .from('inspection_reports')
      .select('*')
      .eq('inspection_id', inspection.id)
      .single()

    const templatePromise = inspection.template_id
      ? supabase
        .from('report_templates')
        .select('*')
        .eq('id', inspection.template_id)
        .eq('user_id', user!.id)
        .single()
      : supabase
        .from('report_templates')
        .select('*')
        .eq('user_id', user!.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

    const [{ data: templateData }, { data: reportData }] = await Promise.all([templatePromise, reportPromise])

    template = (templateData as ReportTemplate | null) ?? null
    if (!template) notFound()
    reportAnswers = (reportData?.answers as ReportTemplate['sections'] | undefined) ?? template.sections
    reportStatus = (reportData?.status as 'draft' | 'finalized' | undefined) ?? 'draft'
  }

  return (
    <TemplateEditor
      template={{ ...template!, sections: reportAnswers ?? template!.sections }}
      inspectionContext={inspection}
      profileContext={profileContext}
      mode="report"
      reportStatus={reportStatus}
    />
  )
}
