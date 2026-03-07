import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatTime, statusColor } from '@/lib/utils'
import { Plus, Search } from 'lucide-react'
import Link from 'next/link'
import type { Inspection } from '@/types'
import { isDemoMode, DEMO_INSPECTIONS } from '@/lib/demo'
import { InspectionsMapDialog } from '@/components/inspections-map-dialog'

export const dynamic = 'force-dynamic'

const STATUSES = ['all', 'scheduled', 'in_progress', 'completed', 'cancelled']

export default async function InspectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>
}) {
  const params = await searchParams

  let inspections: Inspection[] = []

  if (isDemoMode()) {
    inspections = DEMO_INSPECTIONS.filter(i => {
      const matchStatus = !params.status || params.status === 'all' || i.status === params.status
      const matchQ = !params.q || i.address.toLowerCase().includes(params.q.toLowerCase())
      return matchStatus && matchQ
    })
  } else {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    let query = supabase
      .from('inspections')
      .select('*, client:clients(first_name, last_name), agent:agents(first_name, last_name), service:services(name)')
      .eq('user_id', user!.id)
      .order('scheduled_date', { ascending: false })
      .order('scheduled_time', { ascending: false })
    if (params.status && params.status !== 'all') query = query.eq('status', params.status)
    if (params.q) query = query.ilike('address', `%${params.q}%`)
    const { data } = await query
    inspections = (data ?? []) as Inspection[]
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inspections</h1>
          <p className="text-gray-500 mt-1">{inspections.length} total inspections</p>
        </div>
        <div className="flex items-center gap-2">
          <InspectionsMapDialog
            inspections={inspections.map(inspection => ({
              id: inspection.id,
              address: inspection.address,
              city: inspection.city,
              state: inspection.state,
              zip: inspection.zip,
              status: inspection.status,
            }))}
          />
          <Button asChild>
            <Link href="/inspections/new">
              <Plus className="h-4 w-4 mr-2" />
              New Inspection
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <form className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              name="q"
              defaultValue={params.q ?? ''}
              placeholder="Search address..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          <Button type="submit" variant="outline" size="sm">Search</Button>
        </form>

        <div className="flex gap-2">
          {STATUSES.map(status => (
            <Link
              key={status}
              href={`/inspections?status=${status}${params.q ? `&q=${params.q}` : ''}`}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                (params.status ?? 'all') === status
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
              }`}
            >
              {status.replace('_', ' ')}
            </Link>
          ))}
        </div>
      </div>

      {!inspections.length ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-gray-400 mb-4">No inspections found.</p>
            <Button asChild>
              <Link href="/inspections/new">Book First Inspection</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {inspections.map(inspection => (
            <Link key={inspection.id} href={`/inspections/${inspection.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="py-4 flex items-center gap-4">
                  <div className="min-w-[52px] text-center">
                    <p className="text-xs font-medium text-gray-400 uppercase">
                      {new Date(inspection.scheduled_date + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })}
                    </p>
                    <p className="text-xl font-bold text-gray-900 leading-none">
                      {new Date(inspection.scheduled_date + 'T12:00:00Z').getUTCDate()}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{inspection.address}</p>
                    <p className="text-sm text-gray-500">
                      {formatTime(inspection.scheduled_time)}
                      {inspection.client && ` · ${inspection.client.first_name} ${inspection.client.last_name}`}
                      {inspection.service && ` · ${inspection.service.name}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="font-semibold text-gray-900">{formatCurrency(inspection.price)}</span>
                    <Badge className={statusColor(inspection.status)}>{inspection.status.replace('_', ' ')}</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
