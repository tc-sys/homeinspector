'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { isDemoMode } from '@/lib/demo'
import { getBrowserDemoData } from '@/lib/demo-state'
import type { Client, LeadAvailabilityOption } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toISODateLocal } from '@/lib/utils'

export default function AssignSchedulePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()
  const [client, setClient] = useState<Client | null>(null)
  const [loadingClient, setLoadingClient] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    scheduled_date: '',
    scheduled_time: '09:00',
    duration_minutes: '180',
    notes: '',
  })

  useEffect(() => {
    async function loadClient() {
      if (isDemoMode()) {
        const found = getBrowserDemoData().clients.find(entry => entry.id === params.id) ?? null
        setClient(found)
        if (found?.lead_availability[0]) {
          setForm(prev => ({
            ...prev,
            scheduled_date: found.lead_availability[0].date,
            scheduled_time: found.lead_availability[0].time,
          }))
        }
        setLoadingClient(false)
        return
      }

      const { data } = await supabase.from('clients').select('*').eq('id', params.id).single()
      const found = (data as Client | null) ?? null
      setClient(found)
      if (found?.lead_availability[0]) {
        setForm(prev => ({
          ...prev,
          scheduled_date: found.lead_availability[0].date,
          scheduled_time: found.lead_availability[0].time,
        }))
      }
      setLoadingClient(false)
    }

    loadClient()
  }, [params.id, supabase])

  const leadAddress = useMemo(() => {
    if (!client) return ''
    return [client.lead_street, client.lead_city, client.lead_state, client.lead_zip].filter(Boolean).join(', ')
  }, [client])

  async function handleSubmit() {
    setError('')
    if (!form.scheduled_date || !form.scheduled_time) {
      setError('A final inspection date and time are required.')
      return
    }
    if (form.scheduled_date < toISODateLocal()) {
      setError('Final inspection date must be today or later.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/clients/${params.id}/convert-to-inspection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduled_date: form.scheduled_date,
          scheduled_time: form.scheduled_time,
          duration_minutes: parseInt(form.duration_minutes, 10),
          notes: form.notes || null,
        }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload.error ?? 'Failed to create inspection')
      }

      router.push(`/inspections/${payload.inspectionId}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to assign final slot')
    } finally {
      setLoading(false)
    }
  }

  function applyOption(option: LeadAvailabilityOption) {
    setForm(prev => ({
      ...prev,
      scheduled_date: option.date,
      scheduled_time: option.time,
    }))
  }

  if (loadingClient) {
    return <div className="p-4 md:p-8">Loading scheduling request...</div>
  }

  if (!client) {
    return <div className="p-4 md:p-8">Scheduling request not found.</div>
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/schedule">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Schedule
        </Link>
      </Button>

      <Card className="glass-card border-[#d8cfbd]">
        <CardHeader>
          <CardTitle>Assign Final Slot</CardTitle>
          <p className="text-sm text-[#667269]">
            Confirm the actual inspection time for {client.first_name} {client.last_name} and convert this scheduling request into a real inspection.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-2xl border border-[#d8cfbd] bg-[#fffdf8] p-4">
            <div className="text-xs uppercase tracking-[0.14em] text-[#78837b]">Property</div>
            <div className="mt-2 text-base font-semibold text-[#23352c]">{leadAddress || 'Address missing'}</div>
            {client.lead_notes && (
              <div className="mt-3 text-sm text-[#59645c]">{client.lead_notes}</div>
            )}
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold text-[#23352c]">Submitted Availability</div>
            {!client.lead_availability.length ? (
              <div className="rounded-2xl border border-dashed border-[#d8cfbd] px-4 py-6 text-sm text-[#78837b]">
                No availability options were submitted for this client.
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-3">
                {client.lead_availability.map(option => {
                  const active = form.scheduled_date === option.date && form.scheduled_time === option.time
                  return (
                    <button
                      key={`${option.date}-${option.time}`}
                      type="button"
                      onClick={() => applyOption(option)}
                      className={`rounded-2xl border px-4 py-4 text-left ${
                        active
                          ? 'border-[#d08a2d] bg-[#d08a2d] text-[#1f2a24]'
                          : 'border-[#d8cfbd] bg-white text-[#314239]'
                      }`}
                    >
                      <div className="text-sm font-semibold">{option.date}</div>
                      <div className="mt-1 text-xs">{option.time}</div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Final Date *</Label>
              <Input
                type="date"
                min={toISODateLocal()}
                value={form.scheduled_date}
                onChange={event => setForm(prev => ({ ...prev, scheduled_date: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Final Time *</Label>
              <Input
                type="time"
                value={form.scheduled_time}
                onChange={event => setForm(prev => ({ ...prev, scheduled_time: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Duration (min)</Label>
              <Input
                type="number"
                min={30}
                step={30}
                value={form.duration_minutes}
                onChange={event => setForm(prev => ({ ...prev, duration_minutes: event.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Inspection Notes</Label>
            <Textarea
              rows={4}
              value={form.notes}
              onChange={event => setForm(prev => ({ ...prev, notes: event.target.value }))}
              placeholder="Optional notes to carry into the inspection record. Lead notes will also be preserved."
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end">
            <Button disabled={loading} onClick={handleSubmit}>
              {loading ? 'Creating Inspection...' : 'Create Inspection'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
