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
    <div className="p-4 md:p-8 space-y-6 animate-rise-in">
      <div className="rounded-2xl border border-[#cfc5af] bg-[linear-gradient(130deg,#fffdf8_0%,#f3ecde_55%,#efe6d7_100%)] px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#627066]">Field Activity</p>
            <h1 className="text-4xl text-[#1e2f27]">Inspection Dispatch</h1>
            <p className="text-[#5b665f] mt-1">{inspections.length} total inspections</p>
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
            <Button asChild className="bg-[#2f5f4c] hover:bg-[#234b3c] text-[#f8f4ea]">
              <Link href="/inspections/new">
                <Plus className="h-4 w-4 mr-2" />
                New Inspection
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-4 flex items-center gap-4 flex-wrap">
        <form className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6f7c73]" />
            <input
              name="q"
              defaultValue={params.q ?? ''}
              placeholder="Search address..."
              className="pl-10 pr-4 py-2 border border-[#cdbfa5] bg-[#fffdf8] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2f5f4c] w-64"
            />
          </div>
          <Button type="submit" variant="outline" size="sm" className="border-[#c0b293] text-[#304239] hover:bg-[#f3ebdc]">Search</Button>
        </form>

        <div className="flex gap-2">
          {STATUSES.map(status => (
            <Link
              key={status}
              href={`/inspections?status=${status}${params.q ? `&q=${params.q}` : ''}`}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                (params.status ?? 'all') === status
                  ? 'bg-[#2f5f4c] text-[#f8f4ea] border-[#2f5f4c]'
                  : 'bg-[#fffdf8] text-[#4a5750] border-[#d1c4ab] hover:border-[#2f5f4c]'
              }`}
            >
              {status.replace('_', ' ')}
            </Link>
          ))}
        </div>
      </div>

      {!inspections.length ? (
        <Card className="glass-card">
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
              <Card className="glass-card hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer border-[#d8cfbd]">
                <CardContent className="py-4 flex items-center gap-4">
                  <div className="min-w-[52px] text-center">
                    <p className="text-xs font-medium text-[#6c7770] uppercase">
                      {new Date(inspection.scheduled_date + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })}
                    </p>
                    <p className="text-xl font-bold text-[#1f2f27] leading-none">
                      {new Date(inspection.scheduled_date + 'T12:00:00Z').getUTCDate()}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1f2f27] truncate">{inspection.address}</p>
                    <p className="text-sm text-[#5f6b63]">
                      {formatTime(inspection.scheduled_time)}
                      {inspection.client && ` · ${inspection.client.first_name} ${inspection.client.last_name}`}
                      {inspection.service && ` · ${inspection.service.name}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="font-semibold text-[#1f2f27]">{formatCurrency(inspection.price)}</span>
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
