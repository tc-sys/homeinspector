'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { combineLocalDateTime, rangesOverlap, toISODateLocal } from '@/lib/utils'

export default function EditInspectionPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    address: '',
    city: '',
    state: '',
    zip: '',
    scheduled_date: '',
    scheduled_time: '09:00',
    duration_minutes: '180',
    price: '',
    notes: '',
  })

  useEffect(() => {
    async function loadInspection() {
      const { data } = await supabase.from('inspections').select('*').eq('id', params.id).single()
      if (!data) return
      setForm({
        address: data.address ?? '',
        city: data.city ?? '',
        state: data.state ?? '',
        zip: data.zip ?? '',
        scheduled_date: data.scheduled_date ?? '',
        scheduled_time: data.scheduled_time?.slice(0, 5) ?? '09:00',
        duration_minutes: `${data.duration_minutes ?? 180}`,
        price: `${(data.price ?? 0) / 100}`,
        notes: data.notes ?? '',
      })
    }
    loadInspection()
  }, [params.id, supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: sameDay } = await supabase
        .from('inspections')
        .select('id, scheduled_time, duration_minutes')
        .eq('user_id', user!.id)
        .eq('scheduled_date', form.scheduled_date)
        .neq('status', 'cancelled')
        .neq('id', params.id)

      const proposedStart = combineLocalDateTime(form.scheduled_date, form.scheduled_time)
      const proposedEnd = new Date(proposedStart.getTime() + parseInt(form.duration_minutes, 10) * 60_000)
      const hasConflict = (sameDay ?? []).some((item: { scheduled_time: string; duration_minutes: number }) => {
        const existingStart = combineLocalDateTime(form.scheduled_date, item.scheduled_time.slice(0, 5))
        const existingEnd = new Date(existingStart.getTime() + item.duration_minutes * 60_000)
        return rangesOverlap(proposedStart, proposedEnd, existingStart, existingEnd)
      })
      if (hasConflict) {
        const proceed = window.confirm('This time overlaps another inspection. Save anyway?')
        if (!proceed) {
          setLoading(false)
          return
        }
      }

      const priceInCents = Math.round(parseFloat(form.price || '0') * 100)
      const { error: updateError } = await supabase
        .from('inspections')
        .update({
          address: form.address,
          city: form.city,
          state: form.state,
          zip: form.zip,
          scheduled_date: form.scheduled_date,
          scheduled_time: form.scheduled_time,
          duration_minutes: parseInt(form.duration_minutes, 10),
          price: priceInCents,
          notes: form.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id)
      if (updateError) throw updateError

      await supabase
        .from('invoices')
        .update({
          amount: priceInCents,
          total_amount: priceInCents,
          updated_at: new Date().toISOString(),
        })
        .eq('inspection_id', params.id)
        .neq('status', 'paid')

      router.push(`/inspections/${params.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update inspection')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href={`/inspections/${params.id}`}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Inspection
        </Link>
      </Button>
      <Card>
        <CardHeader><CardTitle>Edit Inspection</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Street Address *</Label>
              <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>City *</Label>
                <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>State *</Label>
                <Input value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} maxLength={2} required />
              </div>
              <div className="space-y-2">
                <Label>ZIP *</Label>
                <Input value={form.zip} onChange={e => setForm(f => ({ ...f, zip: e.target.value }))} required />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input type="date" value={form.scheduled_date} min={toISODateLocal()} onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Time *</Label>
                <Input type="time" value={form.scheduled_time} onChange={e => setForm(f => ({ ...f, scheduled_time: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Duration (min)</Label>
                <Input type="number" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))} min={30} step={30} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Price ($)</Label>
              <Input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
              <Button asChild variant="outline"><Link href={`/inspections/${params.id}`}>Cancel</Link></Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
