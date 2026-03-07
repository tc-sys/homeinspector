'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import type { Invoice } from '@/types'
import { toISODateLocal } from '@/lib/utils'

export function InvoiceActions({ invoice }: { invoice: Invoice }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [passCardFee, setPassCardFee] = useState(invoice.pass_card_fee)

  async function sendInvoiceEmail() {
    setLoading(true)
    try {
      await fetch('/api/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice.id, passCardFee }),
      })
      alert('Invoice email sent!')
    } finally {
      setLoading(false)
    }
  }

  async function markPaid() {
    if (!confirm('Mark this invoice as paid?')) return
    setLoading(true)
    await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid_date: toISODateLocal(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoice.id)

    // Unlock report on the inspection
    if (invoice.inspection_id) {
      await supabase
        .from('inspections')
        .update({ report_locked: false })
        .eq('id', invoice.inspection_id)
    }

    router.refresh()
    setLoading(false)
  }

  async function markOverdue() {
    setLoading(true)
    await supabase.from('invoices').update({ status: 'overdue' }).eq('id', invoice.id)
    router.refresh()
    setLoading(false)
  }

  if (invoice.status === 'paid') {
    return (
      <Card>
        <CardContent className="pt-4">
          <p className="text-sm text-green-600 font-medium text-center">Invoice paid — report unlocked.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Actions</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Switch
            id="pass_card_fee"
            checked={passCardFee}
            onCheckedChange={setPassCardFee}
          />
          <Label htmlFor="pass_card_fee" className="cursor-pointer text-sm">
            Pass card processing fee to client
          </Label>
        </div>

        <Button
          className="w-full"
          onClick={sendInvoiceEmail}
          disabled={loading || !invoice.client_id}
        >
          {loading ? 'Sending...' : 'Send Invoice Email'}
        </Button>

        {invoice.stripe_payment_link && (
          <Button asChild variant="outline" className="w-full">
            <a href={invoice.stripe_payment_link} target="_blank">Open Payment Link</a>
          </Button>
        )}

        <Button variant="outline" className="w-full" onClick={markPaid} disabled={loading}>
          Mark as Paid (Cash/Check)
        </Button>

        {invoice.status === 'pending' && (
          <Button variant="ghost" size="sm" className="w-full text-gray-500" onClick={markOverdue} disabled={loading}>
            Mark as Overdue
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
