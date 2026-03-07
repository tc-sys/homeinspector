'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Inspection, Invoice } from '@/types'

interface Props {
  inspection: Inspection
  invoice: Invoice | null
}

export function InspectionActions({ inspection, invoice }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [status, setStatus] = useState(inspection.status)
  const [loading, setLoading] = useState(false)

  async function updateStatus(newStatus: string) {
    setLoading(true)
    await supabase
      .from('inspections')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', inspection.id)
    setStatus(newStatus as typeof status)
    router.refresh()
    setLoading(false)
  }

  async function sendInvoice() {
    setLoading(true)
    try {
      await fetch('/api/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice?.id }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function cancelInspection() {
    if (!confirm('Cancel this inspection?')) return
    setLoading(true)
    await supabase
      .from('inspections')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', inspection.id)
    router.refresh()
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Actions</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <p className="text-xs text-gray-500">Update Status</p>
          <Select value={status} onValueChange={updateStatus} disabled={loading}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {invoice && invoice.status === 'pending' && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={sendInvoice}
            disabled={loading}
          >
            Send Invoice to Client
          </Button>
        )}

        <Button asChild variant="outline" size="sm" className="w-full">
          <a href={`/inspections/${inspection.id}/edit`}>Edit Inspection</a>
        </Button>

        {inspection.status !== 'cancelled' && (
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={cancelInspection}
            disabled={loading}
          >
            Cancel Inspection
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
