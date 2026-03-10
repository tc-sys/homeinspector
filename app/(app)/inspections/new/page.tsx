'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Client, Agent, Service, ReportTemplate } from '@/types'
import { combineLocalDateTime, rangesOverlap, toISODateLocal } from '@/lib/utils'

function NewInspectionForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [sendConfirmations, setSendConfirmations] = useState(true)
  const [form, setForm] = useState({
    address: '',
    city: '',
    state: '',
    zip: '',
    scheduled_date: '',
    scheduled_time: '09:00',
    duration_minutes: '180',
    client_id: searchParams.get('client') ?? '',
    agent_id: searchParams.get('agent') ?? '',
    service_id: '',
    template_id: '',
    inspection_type: '',
    price: '',
    square_footage: '',
    year_built: '',
    notes: '',
  })

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      const [{ data: c }, { data: a }, { data: s }, { data: t }] = await Promise.all([
        supabase.from('clients').select('*').eq('user_id', user!.id).order('last_name'),
        supabase.from('agents').select('*').eq('user_id', user!.id).order('last_name'),
        supabase.from('services').select('*').eq('user_id', user!.id).eq('active', true).order('name'),
        supabase.from('report_templates').select('*').eq('user_id', user!.id).order('updated_at', { ascending: false }),
      ])
      setClients(c ?? [])
      setAgents(a ?? [])
      setServices(s ?? [])
      setTemplates((t ?? []) as ReportTemplate[])
      if ((t?.length ?? 0) > 0) {
        const defaultTemplate = t![0] as ReportTemplate
        setForm(prev => ({ ...prev, template_id: defaultTemplate.id, inspection_type: defaultTemplate.name }))
      }
    }
    loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleServiceChange(serviceId: string) {
    const service = services.find(s => s.id === serviceId)
    if (service) {
      setForm(f => ({
        ...f,
        service_id: serviceId,
        price: (service.base_price / 100).toString(),
        duration_minutes: service.duration_minutes.toString(),
      }))
    } else {
      setForm(f => ({ ...f, service_id: serviceId }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!form.template_id) {
        throw new Error('Please select an inspection template before booking.')
      }

      // Check for conflicts
      const { data: conflicts } = await supabase
        .from('inspections')
        .select('id, scheduled_time, duration_minutes')
        .eq('user_id', user!.id)
        .eq('scheduled_date', form.scheduled_date)
        .neq('status', 'cancelled')

      const proposedStart = combineLocalDateTime(form.scheduled_date, form.scheduled_time)
      const proposedEnd = new Date(proposedStart.getTime() + parseInt(form.duration_minutes, 10) * 60_000)
      const overlapCount = (conflicts ?? []).filter((item: { scheduled_time: string; duration_minutes: number }) => {
        const existingStart = combineLocalDateTime(form.scheduled_date, item.scheduled_time.slice(0, 5))
        const existingEnd = new Date(existingStart.getTime() + item.duration_minutes * 60_000)
        return rangesOverlap(proposedStart, proposedEnd, existingStart, existingEnd)
      }).length

      if (overlapCount > 0) {
        const confirmed = window.confirm(
          `This time overlaps ${overlapCount} existing inspection(s). Continue anyway?`
        )
        if (!confirmed) {
          setLoading(false)
          return
        }
      }

      const priceInCents = Math.round(parseFloat(form.price || '0') * 100)
      const selectedTemplate = templates.find(t => t.id === form.template_id)

      const { data: inspection, error: insertError } = await supabase
        .from('inspections')
        .insert({
          user_id: user!.id,
          address: form.address,
          city: form.city,
          state: form.state,
          zip: form.zip,
          scheduled_date: form.scheduled_date,
          scheduled_time: form.scheduled_time,
          duration_minutes: parseInt(form.duration_minutes),
          client_id: form.client_id || null,
          agent_id: form.agent_id || null,
          service_id: form.service_id || null,
          template_id: form.template_id || null,
          inspection_type: selectedTemplate?.name ?? (form.inspection_type || 'General Home Inspection'),
          price: priceInCents,
          square_footage: form.square_footage ? parseInt(form.square_footage) : null,
          year_built: form.year_built ? parseInt(form.year_built) : null,
          notes: form.notes || null,
          status: 'scheduled',
          report_locked: false,
          client_portal_token: crypto.randomUUID(),
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Auto-create invoice
      await supabase.from('invoices').insert({
        user_id: user!.id,
        inspection_id: inspection.id,
        client_id: form.client_id || null,
        amount: priceInCents,
        tax_amount: 0,
        total_amount: priceInCents,
        status: 'pending',
        pass_card_fee: false,
      })

      // Update agent referral count
      if (form.agent_id) {
        await supabase.rpc('increment_referral_count', { agent_id: form.agent_id })
      }

      // Send confirmations if enabled
      if (sendConfirmations && form.client_id) {
        const client = clients.find(c => c.id === form.client_id)
        if (client?.email) {
          try {
            await fetch('/api/send-confirmation', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'inspection_confirmation',
                inspectionId: inspection.id,
              }),
            })
          } catch {
            // Non-blocking
          }
        }
      }

      router.push(`/inspections/${inspection.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create inspection')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/inspections">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inspections
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Inspection</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Property Address */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Property</h3>
              <div className="space-y-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="123 Main Street"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 col-span-1">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={form.state}
                    onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                    placeholder="CA"
                    maxLength={2}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP *</Label>
                  <Input
                    id="zip"
                    value={form.zip}
                    onChange={e => setForm(f => ({ ...f, zip: e.target.value }))}
                    placeholder="90210"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="square_footage">Square Footage</Label>
                  <Input
                    id="square_footage"
                    type="number"
                    value={form.square_footage}
                    onChange={e => setForm(f => ({ ...f, square_footage: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year_built">Year Built</Label>
                  <Input
                    id="year_built"
                    type="number"
                    value={form.year_built}
                    onChange={e => setForm(f => ({ ...f, year_built: e.target.value }))}
                    placeholder="1990"
                  />
                </div>
              </div>
            </div>

            {/* Scheduling */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-gray-900">Scheduling</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduled_date">Date *</Label>
                  <Input
                    id="scheduled_date"
                    type="date"
                    value={form.scheduled_date}
                    onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))}
                    min={toISODateLocal()}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduled_time">Time *</Label>
                  <Input
                    id="scheduled_time"
                    type="time"
                    value={form.scheduled_time}
                    onChange={e => setForm(f => ({ ...f, scheduled_time: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inspection_type">Inspection Template</Label>
                  <Select
                    value={form.template_id}
                    onValueChange={v => {
                      const selected = templates.find(t => t.id === v)
                      setForm(f => ({ ...f, template_id: v, inspection_type: selected?.name ?? f.inspection_type }))
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={templates.length ? 'Select template' : 'Create a template first'} />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!templates.length && (
                    <p className="text-xs text-amber-600">
                      No templates found. Create one in Reports → Templates before scheduling inspections.
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service">Service Package</Label>
                  <Select
                    value={form.service_id}
                    onValueChange={handleServiceChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service..." />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} — ${(s.base_price / 100).toFixed(0)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={form.duration_minutes}
                    onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))}
                    min="30"
                    step="30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="350.00"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Client & Agent */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-gray-900">People</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client</Label>
                  <Select
                    value={form.client_id}
                    onValueChange={v => setForm(f => ({ ...f, client_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select client..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.first_name} {c.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Link href="/clients/new" className="text-xs text-blue-600 hover:underline">+ Add new client</Link>
                </div>
                <div className="space-y-2">
                  <Label>Referring Agent</Label>
                  <Select
                    value={form.agent_id}
                    onValueChange={v => setForm(f => ({ ...f, agent_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select agent..." />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map(a => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.first_name} {a.last_name}
                          {a.brokerage ? ` (${a.brokerage})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Link href="/agents/new" className="text-xs text-blue-600 hover:underline">+ Add new agent</Link>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2 border-t pt-4">
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Access codes, special instructions, client notes..."
                rows={3}
              />
            </div>

            {/* Notifications */}
            <div className="flex items-center gap-3 border-t pt-4">
              <Switch
                id="send_confirmations"
                checked={sendConfirmations}
                onCheckedChange={setSendConfirmations}
              />
              <Label htmlFor="send_confirmations" className="cursor-pointer">
                Send email & SMS confirmation to client
              </Label>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading || !templates.length}>
                {loading ? 'Booking...' : 'Book Inspection'}
              </Button>
              <Button asChild variant="outline">
                <Link href="/inspections">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function NewInspectionPage() {
  return (
    <Suspense fallback={<div className="p-4 md:p-8">Loading...</div>}>
      <NewInspectionForm />
    </Suspense>
  )
}
