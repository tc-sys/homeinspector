import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, formatTime, statusColor, toISODateLocal } from '@/lib/utils'
import { Calendar, DollarSign, ClipboardList, AlertCircle, Plus } from 'lucide-react'
import Link from 'next/link'
import type { Inspection } from '@/types'
import {
  isDemoMode,
  DEMO_INSPECTIONS,
  DEMO_INVOICES,
  DEMO_ACTIVITY_EVENTS,
  DEMO_CLIENTS,
  DEMO_AGENTS,
  DEMO_FIRM_PROFILE,
  getDemoScenario,
  getDemoSource,
} from '@/lib/demo'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const today = new Date()

  if (isDemoMode()) {
    const upcomingInspections = DEMO_INSPECTIONS.filter(i => i.status === 'scheduled')
    const revenueThisMonth = DEMO_INVOICES
      .filter(i => i.status === 'paid')
      .reduce((s, i) => s + i.total_amount, 0)
    const pendingCount = DEMO_INVOICES.filter(i => i.status === 'pending').length
    const recentInspections = [...DEMO_INSPECTIONS].reverse().slice(0, 5)
    const completedLast30Days = DEMO_INSPECTIONS.filter(i => {
      if (i.status !== 'completed') return false
      const inspectionDate = new Date(i.scheduled_date + 'T12:00:00Z')
      const diffMs = today.getTime() - inspectionDate.getTime()
      return diffMs >= 0 && diffMs <= 30 * 24 * 60 * 60 * 1000
    }).length
    const overdueCount = DEMO_INVOICES.filter(i => i.status === 'overdue').length

    return <DashboardUI
      today={today}
      upcomingInspections={upcomingInspections}
      revenueThisMonth={revenueThisMonth}
      pendingCount={pendingCount}
      recentInspections={recentInspections}
      completedLast30Days={completedLast30Days}
      overdueCount={overdueCount}
      clientsCount={DEMO_CLIENTS.length}
      agentsCount={DEMO_AGENTS.length}
      recentActivity={DEMO_ACTIVITY_EVENTS}
      demoMeta={{
        enabled: true,
        scenario: getDemoScenario(),
        source: getDemoSource(),
        firmName: DEMO_FIRM_PROFILE.name,
      }}
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
    { count: clientsCount },
    { count: agentsCount },
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
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user!.id),
    supabase
      .from('agents')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user!.id),
  ])

  const revenueThisMonth = (monthInvoices ?? []).reduce(
    (sum: number, inv: { total_amount: number }) => sum + inv.total_amount, 0
  )

  return <DashboardUI
    today={today}
    upcomingInspections={(upcomingRaw ?? []) as Inspection[]}
    revenueThisMonth={revenueThisMonth}
    pendingCount={pendingInvoices?.length ?? 0}
    recentInspections={(recentRaw ?? []) as Inspection[]}
    completedLast30Days={completedLast30Days ?? 0}
    overdueCount={overdueCount ?? 0}
    clientsCount={clientsCount ?? 0}
    agentsCount={agentsCount ?? 0}
    recentActivity={[]}
    demoMeta={{ enabled: false, scenario: null, source: null, firmName: null }}
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
  clientsCount,
  agentsCount,
  recentActivity,
  demoMeta,
}: {
  today: Date
  upcomingInspections: Inspection[]
  revenueThisMonth: number
  pendingCount: number
  recentInspections: Inspection[]
  completedLast30Days: number
  overdueCount: number
  clientsCount: number
  agentsCount: number
  recentActivity: Array<{ id: string; type: string; description: string; created_at: string }>
  demoMeta: { enabled: boolean; scenario: string | null; source: string | null; firmName: string | null }
}) {
  return (
    <div className="p-8 space-y-8 animate-rise-in">
      {demoMeta.enabled && (
        <Card className="glass-card border-[#c7bea9] bg-[#f6f1e6]">
          <CardContent className="pt-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#1f3a2f]">{demoMeta.firmName}</p>
                <p className="text-sm text-[#405048]">
                  Scenario: {demoMeta.scenario} | Source: {demoMeta.source}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-[#e7decb] text-[#2c3f36] border-0">{clientsCount} clients</Badge>
                <Badge className="bg-[#e7decb] text-[#2c3f36] border-0">{agentsCount} referral partners</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
