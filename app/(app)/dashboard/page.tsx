import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, formatTime, statusColor, toISODateLocal } from '@/lib/utils'
import { Calendar, DollarSign, ClipboardList, AlertCircle, Plus } from 'lucide-react'
import Link from 'next/link'
import type { Inspection } from '@/types'
import { isDemoMode, DEMO_INSPECTIONS, DEMO_INVOICES } from '@/lib/demo'

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
    return <DashboardUI
      today={today}
      upcomingInspections={upcomingInspections}
      revenueThisMonth={revenueThisMonth}
      pendingCount={pendingCount}
      recentInspections={recentInspections}
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
  />
}

function DashboardUI({
  today,
  upcomingInspections,
  revenueThisMonth,
  pendingCount,
  recentInspections,
}: {
  today: Date
  upcomingInspections: Inspection[]
  revenueThisMonth: number
  pendingCount: number
  recentInspections: Inspection[]
}) {
  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">{today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/clients/new">
              <Plus className="h-4 w-4 mr-2" />
              New Client
            </Link>
          </Button>
          <Button asChild>
            <Link href="/inspections/new">
              <Plus className="h-4 w-4 mr-2" />
              New Inspection
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Revenue This Month</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(revenueThisMonth)}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">This Week</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{upcomingInspections.length}</p>
                <p className="text-xs text-gray-400">inspections</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Invoices</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{pendingCount}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Recent Jobs</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{recentInspections.length}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
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
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="min-w-[56px] text-center">
                      <p className="text-xs font-medium text-gray-500 uppercase">
                        {new Date(inspection.scheduled_date).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })}
                      </p>
                      <p className="text-lg font-bold text-gray-900 leading-none">
                        {new Date(inspection.scheduled_date + 'T12:00:00Z').getUTCDate()}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{inspection.address}</p>
                      <p className="text-sm text-gray-500">
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

        <Card>
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
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{inspection.address}</p>
                      <p className="text-sm text-gray-500">{formatDate(inspection.scheduled_date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(inspection.price)}</p>
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
      </div>
    </div>
  )
}
