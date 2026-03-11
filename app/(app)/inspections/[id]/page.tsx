import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, formatTime, statusColor } from '@/lib/utils'
import { ArrowLeft, MapPin, Calendar, Clock, User, UserCheck, DollarSign, Lock } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { InspectionActions } from './inspection-actions'
import type { Inspection, Invoice } from '@/types'
import { isDemoMode, DEMO_REPORT_TEMPLATES, DEMO_INSPECTION_REPORTS } from '@/lib/demo'
import { getServerDemoData } from '@/lib/demo-state-server'
import { WorkflowLifecycle } from '@/components/workflow-lifecycle'

export const dynamic = 'force-dynamic'

export default async function InspectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let inspection: Inspection | null = null
  let invoice: Invoice | null = null
  let reportTemplateId: string | null = null
  let reportStatus: 'draft' | 'finalized' | null = null

  if (isDemoMode()) {
    const demoData = await getServerDemoData()
    inspection = demoData.inspections.find(i => i.id === id) ?? null
    if (!inspection) notFound()
    invoice = demoData.invoices.find(inv => inv.inspection_id === id) ?? null
    reportTemplateId = inspection.template_id ?? DEMO_REPORT_TEMPLATES[0]?.id ?? null
    reportStatus = DEMO_INSPECTION_REPORTS.find(r => r.inspection_id === id)?.status ?? null
  } else {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    const [{ data }, { data: firstTemplate }, { data: existingReport }] = await Promise.all([
      supabase
        .from('inspections')
        .select('*, client:clients(*), agent:agents(*), service:services(*), invoice:invoices(*)')
        .eq('id', id)
        .eq('user_id', user!.id)
        .single(),
      supabase
        .from('report_templates')
        .select('id')
        .eq('user_id', user!.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from('inspection_reports')
        .select('status')
        .eq('inspection_id', id)
        .single(),
    ])
    if (!data) notFound()
    inspection = data as Inspection
    invoice = Array.isArray(data.invoice) ? data.invoice[0] : data.invoice
    reportTemplateId = inspection.template_id ?? firstTemplate?.id ?? null
    reportStatus = existingReport?.status ?? null
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/inspections">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inspections
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          {inspection.report_locked && (
            <div className="flex items-center gap-1.5 text-sm text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
              <Lock className="h-4 w-4" />
              Report Locked — Awaiting Payment
            </div>
          )}
          <Badge className={`${statusColor(inspection.status)} text-sm px-3 py-1`}>
            {inspection.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">{inspection.address}</h1>
        <p className="text-gray-500">{inspection.city}, {inspection.state} {inspection.zip}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <WorkflowLifecycle inspection={inspection} invoice={invoice} reportStatus={reportStatus} />

          <Card>
            <CardHeader><CardTitle>Inspection Details</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <dt className="text-xs text-gray-500">Date</dt>
                    <dd className="font-medium">{formatDate(inspection.scheduled_date)}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <dt className="text-xs text-gray-500">Time</dt>
                    <dd className="font-medium">{formatTime(inspection.scheduled_time)} ({inspection.duration_minutes} min)</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <dt className="text-xs text-gray-500">Type</dt>
                    <dd className="font-medium">{inspection.inspection_type}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <dt className="text-xs text-gray-500">Price</dt>
                    <dd className="font-medium">{formatCurrency(inspection.price)}</dd>
                  </div>
                </div>
                {inspection.square_footage && (
                  <div>
                    <dt className="text-xs text-gray-500">Square Footage</dt>
                    <dd className="font-medium">{inspection.square_footage.toLocaleString()} sq ft</dd>
                  </div>
                )}
                {inspection.year_built && (
                  <div>
                    <dt className="text-xs text-gray-500">Year Built</dt>
                    <dd className="font-medium">{inspection.year_built}</dd>
                  </div>
                )}
                {inspection.service && (
                  <div>
                    <dt className="text-xs text-gray-500">Service Package</dt>
                    <dd className="font-medium">{inspection.service.name}</dd>
                  </div>
                )}
              </dl>

              {inspection.notes && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-500 mb-1">Notes</p>
                  <p className="text-sm text-gray-700">{inspection.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {inspection.client && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <CardTitle className="text-base">Client</CardTitle>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/clients/${inspection.client.id}`}>View Profile</Link>
                </Button>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="font-medium">{inspection.client.first_name} {inspection.client.last_name}</p>
                {inspection.client.email && <p className="text-sm text-gray-500">{inspection.client.email}</p>}
                {inspection.client.phone && <p className="text-sm text-gray-500">{inspection.client.phone}</p>}
              </CardContent>
            </Card>
          )}

          {inspection.agent && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-gray-500" />
                  <CardTitle className="text-base">Referring Agent</CardTitle>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/agents/${inspection.agent.id}`}>View Profile</Link>
                </Button>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="font-medium">{inspection.agent.first_name} {inspection.agent.last_name}</p>
                {inspection.agent.brokerage && <p className="text-sm text-gray-500">{inspection.agent.brokerage}</p>}
                {inspection.agent.email && <p className="text-sm text-gray-500">{inspection.agent.email}</p>}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <InspectionActions inspection={inspection} invoice={invoice} />

          {!inspection.report_locked && reportTemplateId && (
            <Button asChild variant="outline" className="w-full border-[#bcae90] text-[#304239] hover:bg-[#f2ebdc]">
              <Link href={`/reports/completed/${inspection.id}`}>
                {reportStatus ? 'Continue Inspection Report' : 'Start Inspection Report'}
              </Link>
            </Button>
          )}

          {invoice && (
            <Card>
              <CardHeader><CardTitle className="text-base">Invoice</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-medium">{formatCurrency(invoice.total_amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status</span>
                    <Badge className={statusColor(invoice.status)}>{invoice.status}</Badge>
                  </div>
                  {invoice.paid_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Paid</span>
                      <span className="font-medium">{formatDate(invoice.paid_date)}</span>
                    </div>
                  )}
                </div>
                <Button asChild variant="outline" size="sm" className="w-full mt-4">
                  <Link href={`/invoices/${invoice.id}`}>View Invoice</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
