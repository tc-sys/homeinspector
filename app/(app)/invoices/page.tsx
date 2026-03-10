import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, statusColor } from '@/lib/utils'
import Link from 'next/link'
import type { Invoice } from '@/types'
import { isDemoMode, DEMO_INVOICES } from '@/lib/demo'

export const dynamic = 'force-dynamic'

const STATUSES = ['all', 'pending', 'paid', 'overdue', 'cancelled']

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; paid?: string }>
}) {
  const params = await searchParams

  let invoices: Invoice[] = []

  if (isDemoMode()) {
    invoices = DEMO_INVOICES.filter(i =>
      !params.status || params.status === 'all' || i.status === params.status
    )
  } else {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    let query = supabase
      .from('invoices')
      .select('*, client:clients(first_name, last_name), inspection:inspections(address, scheduled_date)')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
    if (params.status && params.status !== 'all') query = query.eq('status', params.status)
    const { data } = await query
    invoices = (data ?? []) as Invoice[]
  }

  const totalPending = invoices
    .filter(i => i.status === 'pending' || i.status === 'overdue')
    .reduce((s, i) => s + i.total_amount, 0)

  const totalPaid = invoices
    .filter(i => i.status === 'paid')
    .reduce((s, i) => s + i.total_amount, 0)

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-500 mt-1">{invoices.length} invoices</p>
        </div>
      </div>

      {params.paid === 'true' && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
          Payment received successfully!
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">Outstanding</p>
            <p className="text-2xl font-bold text-amber-600">{formatCurrency(totalPending)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">Collected</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUSES.map(status => (
          <Link
            key={status}
            href={`/invoices?status=${status}`}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              (params.status ?? 'all') === status
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
            }`}
          >
            {status}
          </Link>
        ))}
      </div>

      {!invoices.length ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-gray-400">No invoices found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {invoices.map(invoice => (
            <Link key={invoice.id} href={`/invoices/${invoice.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="py-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {invoice.inspection?.address ?? 'No address'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {invoice.client
                        ? `${invoice.client.first_name} ${invoice.client.last_name}`
                        : 'No client'}
                      {invoice.inspection?.scheduled_date && ` · ${formatDate(invoice.inspection.scheduled_date)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="font-semibold text-gray-900">{formatCurrency(invoice.total_amount)}</span>
                    <Badge className={statusColor(invoice.status)}>{invoice.status}</Badge>
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
