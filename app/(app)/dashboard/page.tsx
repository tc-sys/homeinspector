import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, formatTime, statusColor, toISODateLocal } from '@/lib/utils'
import { Calendar, DollarSign, ClipboardList, AlertCircle, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { Client, Inspection, Invoice, InspectionReport } from '@/types'
import {
  isDemoMode,
  DEMO_ACTIVITY_EVENTS,
  DEMO_INSPECTION_REPORTS,
} from '@/lib/demo'
import { getServerDemoData } from '@/lib/demo-state-server'
import { buildActionStageSnapshot } from '@/lib/action-system'
import { getWorkflowStageAgeDays, getWorkflowSummary } from '@/lib/workflow'
import { WorkflowStageBar } from '@/components/action-system'

export const dynamic = 'force-dynamic'

type DashboardAttentionItem = {
  id: string
  title: string
  stageLabel: string
  note: string
  actionLabel: string
  href: string
  daysInStage: number
  priority: number
}

export default async function DashboardPage() {
  const today = new Date()

  if (isDemoMode()) {
    const demoData = await getServerDemoData()
    const upcomingInspections = demoData.inspections.filter(i => i.status === 'scheduled')
    const revenueThisMonth = demoData.invoices
      .filter(i => i.status === 'paid')
      .reduce((s, i) => s + i.total_amount, 0)
    const pendingCount = demoData.invoices.filter(i => i.status === 'pending').length
    const recentInspections = [...demoData.inspections].reverse().slice(0, 5)
    const completedLast30Days = demoData.inspections.filter(i => {
      if (i.status !== 'completed') return false
      const inspectionDate = new Date(i.scheduled_date + 'T12:00:00Z')
      const diffMs = today.getTime() - inspectionDate.getTime()
      return diffMs >= 0 && diffMs <= 30 * 24 * 60 * 60 * 1000
    }).length
    const overdueCount = demoData.invoices.filter(i => i.status === 'overdue').length
    const invoicesByInspectionId = new Map(demoData.invoices.map(invoice => [invoice.inspection_id, invoice] as const))
    const reportByInspectionId = new Map(DEMO_INSPECTION_REPORTS.map(report => [report.inspection_id, report] as const))
    const actionSnapshot = buildActionStageSnapshot({
      clients: demoData.clients,
      inspections: demoData.inspections,
      invoices: demoData.invoices,
      reports: DEMO_INSPECTION_REPORTS,
    })
    const stageAttention: DashboardAttentionItem[] = [...actionSnapshot.schedule, ...actionSnapshot.lead].map(item => ({
      id: item.id,
      title: item.title,
      stageLabel: item.stage === 'schedule' ? 'Schedule' : 'Lead',
      note: item.note,
      actionLabel: item.actionLabel,
      href: item.href,
      daysInStage: item.ageDays ?? 0,
      priority: item.stage === 'schedule' ? 0 : 1,
    }))
    const inspectionAttention: DashboardAttentionItem[] = demoData.inspections
      .map(inspection => {
        const workflowSummary = getWorkflowSummary({
          inspection,
          invoice: invoicesByInspectionId.get(inspection.id) ?? null,
          reportStatus: reportByInspectionId.get(inspection.id)?.status ?? null,
        })

        return {
        id: inspection.id,
        title: inspection.address,
        stageLabel: workflowSummary.currentStage.label,
        note: workflowSummary.nextAction?.description ?? 'Review job',
        actionLabel: workflowSummary.nextAction?.label ?? 'Open job',
        href: workflowSummary.nextAction?.href ?? `/inspections/${inspection.id}`,
        daysInStage: getWorkflowStageAgeDays({
          inspection,
          invoice: invoicesByInspectionId.get(inspection.id) ?? null,
          reportStatus: reportByInspectionId.get(inspection.id)?.status ?? null,
          reportUpdatedAt: reportByInspectionId.get(inspection.id)?.updated_at ?? null,
        }),
        priority: workflowSummary.currentStage.status === 'blocked' ? 0 : 2,
      }})
      .filter(item => item.actionLabel)
    const attentionJobs = [...stageAttention, ...inspectionAttention]
      .sort((a, b) => a.priority - b.priority || b.daysInStage - a.daysInStage)
      .slice(0, 8)

    return <DashboardUI
      today={today}
      upcomingInspections={upcomingInspections}
      revenueThisMonth={revenueThisMonth}
      pendingCount={pendingCount}
      recentInspections={recentInspections}
      completedLast30Days={completedLast30Days}
      overdueCount={overdueCount}
      recentActivity={DEMO_ACTIVITY_EVENTS}
      attentionJobs={attentionJobs}
    />
  }

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  const [
    { data: upcomingRaw },
    { data: monthInvoices },
    { data: pendingInvoices },
    { data: recentRaw },
    { count: completedLast30Days },
    { count: overdueCount },
    { data: clientsRaw },
    { data: workflowInspectionsRaw },
    { data: workflowInvoicesRaw },
    { data: workflowReportsRaw },
  ] = await Promise.all([
    supabase
      .from('inspections')
      .select('*, client:clients(*), service:services(*)')
      .eq('user_id', user!.id)
      .gte('scheduled_date', toISODateLocal(today))
      .lte('scheduled_date', toISODateLocal(endOfWeek))
      .neq('status', 'cancelled')
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true })
      .limit(5),
    supabase
      .from('invoices')
      .select('total_amount')
      .eq('user_id', user!.id)
      .eq('status', 'paid')
      .gte('paid_date', toISODateLocal(startOfMonth))
      .lte('paid_date', toISODateLocal(endOfMonth)),
    supabase
      .from('invoices')
      .select('id')
      .eq('user_id', user!.id)
      .in('status', ['pending', 'overdue']),
    supabase
      .from('inspections')
      .select('*, client:clients(*)')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('inspections')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user!.id)
      .eq('status', 'completed')
      .gte('scheduled_date', toISODateLocal(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000))),
    supabase
      .from('invoices')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user!.id)
      .eq('status', 'overdue'),
    supabase
      .from('clients')
      .select('*')
      .eq('user_id', user!.id),
    supabase
      .from('inspections')
      .select('id, user_id, client_id, agent_id, service_id, template_id, address, city, state, zip, scheduled_date, scheduled_time, duration_minutes, status, inspection_type, notes, square_footage, year_built, price, report_locked, created_at, updated_at')
      .eq('user_id', user!.id),
    supabase
      .from('invoices')
      .select('id, user_id, inspection_id, client_id, amount, tax_amount, total_amount, status, due_date, paid_date, stripe_payment_intent_id, stripe_payment_link, pass_card_fee, notes, created_at, updated_at')
      .eq('user_id', user!.id),
    supabase
      .from('inspection_reports')
      .select('inspection_id, status, updated_at'),
  ])

  const revenueThisMonth = (monthInvoices ?? []).reduce(
    (sum: number, inv: { total_amount: number }) => sum + inv.total_amount, 0
  )

  const workflowInspections = (workflowInspectionsRaw ?? []) as Inspection[]
  const workflowInvoices = (workflowInvoicesRaw ?? []) as Invoice[]
  const workflowReports = (workflowReportsRaw ?? []) as Pick<InspectionReport, 'inspection_id' | 'status' | 'updated_at'>[]
  const invoicesByInspectionId = new Map(workflowInvoices.map(invoice => [invoice.inspection_id, invoice] as const))
  const reportByInspectionId = new Map(workflowReports.map(report => [report.inspection_id, report] as const))
  const actionSnapshot = buildActionStageSnapshot({
    clients: (clientsRaw ?? []) as Client[],
    inspections: workflowInspections,
    invoices: workflowInvoices,
    reports: workflowReports,
  })
  const stageAttention: DashboardAttentionItem[] = [...actionSnapshot.schedule, ...actionSnapshot.lead].map(item => ({
    id: item.id,
    title: item.title,
    stageLabel: item.stage === 'schedule' ? 'Schedule' : 'Lead',
    note: item.note,
    actionLabel: item.actionLabel,
    href: item.href,
    daysInStage: item.ageDays ?? 0,
    priority: item.stage === 'schedule' ? 0 : 1,
  }))
  const inspectionAttention: DashboardAttentionItem[] = workflowInspections
    .map(inspection => ({
      id: inspection.id,
      title: inspection.address,
      stageLabel: getWorkflowSummary({
        inspection,
        invoice: invoicesByInspectionId.get(inspection.id) ?? null,
        reportStatus: reportByInspectionId.get(inspection.id)?.status ?? null,
      }).currentStage.label,
      note: getWorkflowSummary({
        inspection,
        invoice: invoicesByInspectionId.get(inspection.id) ?? null,
        reportStatus: reportByInspectionId.get(inspection.id)?.status ?? null,
      }).nextAction?.description ?? 'Review job',
      actionLabel: getWorkflowSummary({
        inspection,
        invoice: invoicesByInspectionId.get(inspection.id) ?? null,
        reportStatus: reportByInspectionId.get(inspection.id)?.status ?? null,
      }).nextAction?.label ?? 'Open job',
      href: getWorkflowSummary({
        inspection,
        invoice: invoicesByInspectionId.get(inspection.id) ?? null,
        reportStatus: reportByInspectionId.get(inspection.id)?.status ?? null,
      }).nextAction?.href ?? `/inspections/${inspection.id}`,
      daysInStage: getWorkflowStageAgeDays({
        inspection,
        invoice: invoicesByInspectionId.get(inspection.id) ?? null,
        reportStatus: reportByInspectionId.get(inspection.id)?.status ?? null,
        reportUpdatedAt: reportByInspectionId.get(inspection.id)?.updated_at ?? null,
      }),
      priority: getWorkflowSummary({
        inspection,
        invoice: invoicesByInspectionId.get(inspection.id) ?? null,
        reportStatus: reportByInspectionId.get(inspection.id)?.status ?? null,
      }).currentStage.status === 'blocked' ? 0 : 2,
    }))
    .filter(item => item.actionLabel)
  const attentionJobs = [...stageAttention, ...inspectionAttention]
    .sort((a, b) => a.priority - b.priority || b.daysInStage - a.daysInStage)
    .slice(0, 8)

  return <DashboardUI
    today={today}
    upcomingInspections={(upcomingRaw ?? []) as Inspection[]}
    revenueThisMonth={revenueThisMonth}
    pendingCount={pendingInvoices?.length ?? 0}
    recentInspections={(recentRaw ?? []) as Inspection[]}
    completedLast30Days={completedLast30Days ?? 0}
    overdueCount={overdueCount ?? 0}
    recentActivity={[]}
    attentionJobs={attentionJobs}
  />
}

function DashboardUI({
  today,
  upcomingInspections,
  revenueThisMonth,
  pendingCount,
  recentInspections,
  completedLast30Days,
  overdueCount,
  recentActivity,
  attentionJobs,
}: {
  today: Date
  upcomingInspections: Inspection[]
  revenueThisMonth: number
  pendingCount: number
  recentInspections: Inspection[]
  completedLast30Days: number
  overdueCount: number
  recentActivity: Array<{ id: string; type: string; description: string; created_at: string }>
  attentionJobs: DashboardAttentionItem[]
}) {
  return (
    <div className="p-4 md:p-8 space-y-8 animate-rise-in">
      <div className="rounded-2xl border border-[#cfc5af] bg-[linear-gradient(130deg,#fffdf8_0%,#f3ecde_55%,#efe6d7_100%)] px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#627066]">Operations Briefing</p>
            <h1 className="text-4xl text-[#1e2f27]">Philadelphia Regional Command</h1>
            <p className="text-[#5b665f] mt-1">{today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline" className="border-[#bcae90] bg-white/70 hover:bg-white text-[#263830]">
              <Link href="/clients/new">
                <Plus className="h-4 w-4 mr-2" />
                New Client
              </Link>
            </Button>
            <Button asChild className="bg-[#2f5f4c] hover:bg-[#234b3c] text-[#f8f4ea]">
              <Link href="/inspections/new">
                <Plus className="h-4 w-4 mr-2" />
                New Inspection
              </Link>
            </Button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-[#e8decc] text-[#33453c]">High-volume market</span>
          <span className="px-2.5 py-1 rounded-full bg-[#e8decc] text-[#33453c]">Multi-team dispatch</span>
          <span className="px-2.5 py-1 rounded-full bg-[#e8decc] text-[#33453c]">Active 90-day timeline</span>
        </div>
        <div className="mt-5">
          <WorkflowStageBar currentStage={null} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#5f6c63]">Revenue This Month</p>
                <p className="text-2xl font-bold text-[#1f2f27] mt-1">{formatCurrency(revenueThisMonth)}</p>
              </div>
              <div className="h-12 w-12 bg-[#d6eadf] rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-[#2d7a56]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#5f6c63]">This Week</p>
                <p className="text-2xl font-bold text-[#1f2f27] mt-1">{upcomingInspections.length}</p>
                <p className="text-xs text-[#7b867e]">inspections</p>
              </div>
              <div className="h-12 w-12 bg-[#d7e5e1] rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-[#2f5f4c]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#5f6c63]">Pending Invoices</p>
                <p className="text-2xl font-bold text-[#1f2f27] mt-1">{pendingCount}</p>
                <p className="text-xs text-[#9a4f3d]">{overdueCount} overdue</p>
              </div>
              <div className="h-12 w-12 bg-[#f3e2c9] rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-[#d08a2d]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#5f6c63]">Completed (30d)</p>
                <p className="text-2xl font-bold text-[#1f2f27] mt-1">{completedLast30Days}</p>
              </div>
              <div className="h-12 w-12 bg-[#e1e7d8] rounded-full flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-[#45624f]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <CardTitle>Needs Attention</CardTitle>
            <p className="text-sm text-[#647067]">Jobs that are aging in a stage or waiting on the next operational move.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {!attentionJobs.length ? (
              <p className="text-sm text-[#6d766f]">No active handoffs right now.</p>
            ) : (
              attentionJobs.map(item => (
                <Link
                  key={`${item.stageLabel}-${item.id}`}
                  href={item.href}
                  className="block rounded-2xl border border-[#ddd3c0] bg-[#fffdf8] px-5 py-4 hover:border-[#bcae90] hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-base font-semibold text-[#23352c]">{item.title}</div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full border border-[#d8cfbd] bg-white px-2.5 py-1 text-[#425147]">
                          {item.stageLabel}
                        </span>
                        <span className="rounded-full border border-[#d8cfbd] bg-[#f7f0e2] px-2.5 py-1 text-[#7f5720]">
                          {item.daysInStage} day{item.daysInStage === 1 ? '' : 's'} in stage
                        </span>
                      </div>
                      <div className="mt-3 text-sm text-[#59645c]">{item.actionLabel}</div>
                      <div className="mt-1 text-sm text-[#7a847d]">{item.note}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 flex-shrink-0 text-[#7a847d]" />
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming This Week</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/schedule">View Calendar</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {!upcomingInspections.length ? (
              <div className="text-center py-8 text-gray-400">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No inspections this week</p>
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <Link href="/inspections/new">Book an Inspection</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingInspections.map(inspection => (
                  <Link
                    key={inspection.id}
                    href={`/inspections/${inspection.id}`}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#f2ebde] transition-colors border border-transparent hover:border-[#dccfb8]"
                  >
                    <div className="min-w-[56px] text-center">
                      <p className="text-xs font-medium text-[#6f7a72] uppercase">
                        {new Date(inspection.scheduled_date).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })}
                      </p>
                      <p className="text-lg font-bold text-[#1f2f27] leading-none">
                        {new Date(inspection.scheduled_date + 'T12:00:00Z').getUTCDate()}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#23352c] truncate">{inspection.address}</p>
                      <p className="text-sm text-[#5f6b62]">
                        {formatTime(inspection.scheduled_time)} &middot; {inspection.client ? `${inspection.client.first_name} ${inspection.client.last_name}` : 'No client'}
                      </p>
                    </div>
                    <Badge className={statusColor(inspection.status)}>
                      {inspection.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Inspections</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/inspections">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {!recentInspections.length ? (
              <div className="text-center py-8 text-gray-400">
                <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No inspections yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentInspections.map(inspection => (
                  <Link
                    key={inspection.id}
                    href={`/inspections/${inspection.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#f2ebde] transition-colors border border-transparent hover:border-[#dccfb8]"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#23352c] truncate">{inspection.address}</p>
                      <p className="text-sm text-[#5f6b62]">{formatDate(inspection.scheduled_date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-[#23352c]">{formatCurrency(inspection.price)}</p>
                      <Badge className={statusColor(inspection.status)}>
                        {inspection.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {!recentActivity.length ? (
              <p className="text-sm text-gray-400">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 8).map(event => (
                  <div key={event.id} className="rounded-lg border border-[#ddd2bc] bg-[#fffaf0] p-3">
                    <p className="text-sm text-[#27382f]">{event.description}</p>
                    <p className="text-xs text-[#738178] mt-1">{formatDate(event.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
