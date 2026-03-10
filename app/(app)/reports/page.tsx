import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { FileText, ChevronRight, PlusCircle, ClipboardCheck } from 'lucide-react'
import { isDemoMode, DEMO_CLIENTS, DEMO_REPORT_TEMPLATES, DEMO_INSPECTION_REPORTS, DEMO_INSPECTIONS, DEMO_INVOICES } from '@/lib/demo'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Client, ReportTemplate, Inspection, InspectionReport, Invoice } from '@/types'
import { ActionQueueCard, StageHeader } from '@/components/action-system'
import { buildActionStageSnapshot } from '@/lib/action-system'

export const dynamic = 'force-dynamic'

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const activeTab = tab === 'templates' ? 'templates' : 'completed'

  let templates: ReportTemplate[] = []
  let reports: InspectionReport[] = []
  let stageSnapshot: ReturnType<typeof buildActionStageSnapshot>

  if (isDemoMode()) {
    templates = DEMO_REPORT_TEMPLATES
    reports = DEMO_INSPECTION_REPORTS
    stageSnapshot = buildActionStageSnapshot({
      clients: DEMO_CLIENTS,
      inspections: DEMO_INSPECTIONS,
      invoices: DEMO_INVOICES,
      reports: DEMO_INSPECTION_REPORTS,
    })
  } else {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    const [{ data: templateData }, { data: reportData }, { data: clientsData }, { data: inspectionsData }, { data: invoicesData }] = await Promise.all([
      supabase
        .from('report_templates')
        .select('*')
        .eq('user_id', user!.id)
        .order('updated_at', { ascending: false }),
      supabase
        .from('inspection_reports')
        .select('*, inspection:inspections(*, client:clients(*)), template:report_templates(*)')
        .order('updated_at', { ascending: false }),
      supabase
        .from('clients')
        .select('*')
        .eq('user_id', user!.id),
      supabase
        .from('inspections')
        .select('*, client:clients(*), agent:agents(*), service:services(*)')
        .eq('user_id', user!.id),
      supabase
        .from('invoices')
        .select('*, client:clients(*), inspection:inspections(*)')
        .eq('user_id', user!.id),
    ])
    templates = (templateData ?? []) as ReportTemplate[]
    reports = (reportData ?? []) as InspectionReport[]
    stageSnapshot = buildActionStageSnapshot({
      clients: (clientsData ?? []) as Client[],
      inspections: (inspectionsData ?? []) as Inspection[],
      invoices: (invoicesData ?? []) as Invoice[],
      reports: (reportData ?? []) as InspectionReport[],
    })
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <StageHeader
        eyebrow="Deliver"
        title="Deliver Command"
        description="Push reports across the finish line. Finalize drafts, release ready reports, and keep client handoff moving."
      />

      <ActionQueueCard
        title="Delivery Queue"
        description="Reports that are ready for release right now."
        emptyLabel="No finalized reports are waiting for delivery."
        items={stageSnapshot.deliver.slice(0, 8)}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 mt-1">Completed reports and reusable templates</p>
        </div>
        {activeTab === 'templates' && (
          <Link href="/reports/new" className="flex items-center gap-2 px-4 py-2 bg-[#2f5f4c] text-white text-sm font-medium rounded-lg hover:bg-[#234b3c] transition-colors">
            <PlusCircle className="h-4 w-4" />
            New Template
          </Link>
        )}
      </div>

      <div className="flex gap-2">
        <Link
          href="/reports?tab=completed"
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            activeTab === 'completed'
              ? 'bg-[#2f5f4c] text-[#f8f4ea] border-[#2f5f4c]'
              : 'bg-[#fffdf8] text-[#4a5750] border-[#d1c4ab] hover:border-[#2f5f4c]'
          }`}
        >
          Completed Reports
        </Link>
        <Link
          href="/reports?tab=templates"
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            activeTab === 'templates'
              ? 'bg-[#2f5f4c] text-[#f8f4ea] border-[#2f5f4c]'
              : 'bg-[#fffdf8] text-[#4a5750] border-[#d1c4ab] hover:border-[#2f5f4c]'
          }`}
        >
          Templates
        </Link>
      </div>

      {activeTab === 'completed' ? (
        !reports.length ? (
          <Card>
            <CardContent className="py-16 text-center">
              <ClipboardCheck className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No completed reports yet</p>
              <p className="text-gray-400 text-sm mt-1">Start a report from an inspection detail page</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {reports.map(report => (
              <Link key={report.id} href={`/reports/completed/${report.inspection_id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="py-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <ClipboardCheck className="h-5 w-5 text-emerald-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {report.inspection?.address ?? 'Inspection Report'}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {report.template?.name ?? 'Template'} · {report.inspection?.client
                          ? `${report.inspection.client.first_name} ${report.inspection.client.last_name}`
                          : 'No client'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge className={report.status === 'finalized' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                        {report.status}
                      </Badge>
                      <span className="text-xs text-gray-400">{formatDate(report.updated_at)}</span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )
      ) : (
        !templates.length ? (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No report templates yet</p>
              <p className="text-gray-400 text-sm mt-1">Create a template to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {templates.map(template => {
              const totalItems = template.sections.reduce((sum, s) => sum + s.items.length, 0)
              return (
                <Link key={template.id} href={`/reports/${template.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="py-4 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">{template.name}</p>
                        {template.description && (
                          <p className="text-sm text-gray-500 truncate">{template.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <Badge className="bg-gray-100 text-gray-600 border-0">
                          {template.sections.length} sections · {totalItems} items
                        </Badge>
                        <span className="text-xs text-gray-400">{formatDate(template.updated_at)}</span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )
      )}
    </div>
  )
}
