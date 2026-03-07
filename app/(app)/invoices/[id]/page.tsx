import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, statusColor } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { InvoiceActions } from './invoice-actions'
import type { Invoice } from '@/types'
import { isDemoMode, DEMO_INVOICES } from '@/lib/demo'

export const dynamic = 'force-dynamic'

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let invoice: Invoice | null = null

  if (isDemoMode()) {
    invoice = DEMO_INVOICES.find(i => i.id === id) ?? null
    if (!invoice) notFound()
  } else {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('invoices')
      .select('*, client:clients(*), inspection:inspections(address, city, state, zip, scheduled_date, scheduled_time, inspection_type)')
      .eq('id', id)
      .eq('user_id', user!.id)
      .single()
    if (!data) notFound()
    invoice = data as Invoice
  }

  return (
    <div className="p-8 max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/invoices">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoices
          </Link>
        </Button>
        <Badge className={`${statusColor(invoice.status)} text-sm px-3 py-1`}>{invoice.status}</Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">Invoice</CardTitle>
              <p className="text-sm text-gray-500 mt-1">#{invoice.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <p className="text-gray-400 text-sm">{formatDate(invoice.created_at)}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {invoice.client && (
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium mb-2">Bill To</p>
              <p className="font-medium">{invoice.client.first_name} {invoice.client.last_name}</p>
              {invoice.client.email && <p className="text-sm text-gray-600">{invoice.client.email}</p>}
              {invoice.client.phone && <p className="text-sm text-gray-600">{invoice.client.phone}</p>}
            </div>
          )}

          {invoice.inspection && (
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium mb-2">Service</p>
              <p className="font-medium">{invoice.inspection.address}</p>
              {invoice.inspection.city && (
                <p className="text-sm text-gray-600">
                  {invoice.inspection.city}, {invoice.inspection.state} {invoice.inspection.zip}
                </p>
              )}
              <p className="text-sm text-gray-600">
                {invoice.inspection.inspection_type} · {formatDate(invoice.inspection.scheduled_date)}
              </p>
            </div>
          )}

          <div className="border-t pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatCurrency(invoice.amount)}</span>
              </div>
              {invoice.tax_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span>{formatCurrency(invoice.tax_amount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total</span>
                <span>{formatCurrency(invoice.total_amount)}</span>
              </div>
            </div>
          </div>

          {invoice.paid_date && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              <p className="text-sm text-green-800 font-medium">Paid on {formatDate(invoice.paid_date)}</p>
            </div>
          )}

          {invoice.notes && (
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium mb-1">Notes</p>
              <p className="text-sm text-gray-600">{invoice.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <InvoiceActions invoice={invoice} />
    </div>
  )
}
