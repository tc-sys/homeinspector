'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
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

const MIN_OPTIONS = 2
const MAX_OPTIONS = 5

function emptyAvailabilityOption(): LeadAvailabilityOption {
  return {
    date: '',
    time: '09:00',
  }
}

export default function ClientBookInspectionPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingClient, setLoadingClient] = useState(true)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    lead_street: '',
    lead_city: '',
    lead_state: '',
    lead_zip: '',
    lead_notes: '',
  })
  const [availability, setAvailability] = useState<LeadAvailabilityOption[]>([
    emptyAvailabilityOption(),
    emptyAvailabilityOption(),
  ])

  useEffect(() => {
    async function loadClient() {
      if (isDemoMode()) {
        const found = getBrowserDemoData().clients.find(entry => entry.id === params.id) ?? null
        setClient(found)
        if (found) {
          setForm({
            lead_street: found.lead_street ?? '',
            lead_city: found.lead_city ?? '',
            lead_state: found.lead_state ?? '',
            lead_zip: found.lead_zip ?? '',
            lead_notes: found.lead_notes ?? '',
          })
          if (found.lead_availability.length >= MIN_OPTIONS) {
            setAvailability(found.lead_availability)
          }
        }
        setLoadingClient(false)
        return
      }

      const { data } = await supabase.from('clients').select('*').eq('id', params.id).single()
      const found = (data as Client | null) ?? null
      setClient(found)
      if (found) {
        setForm({
          lead_street: found.lead_street ?? '',
          lead_city: found.lead_city ?? '',
          lead_state: found.lead_state ?? '',
          lead_zip: found.lead_zip ?? '',
          lead_notes: found.lead_notes ?? '',
        })
        if (found.lead_availability.length >= MIN_OPTIONS) {
          setAvailability(found.lead_availability)
        }
      }
      setLoadingClient(false)
    }

    loadClient()
  }, [params.id, supabase])

  const stepTitle = useMemo(() => {
    if (step === 1) return 'Property Address'
    if (step === 2) return 'Availability Options'
    return 'Scheduling Notes'
  }, [step])

  function updateAvailability(index: number, updates: Partial<LeadAvailabilityOption>) {
    setAvailability(prev => prev.map((entry, entryIndex) => entryIndex === index ? { ...entry, ...updates } : entry))
  }

  function addAvailability() {
    setAvailability(prev => prev.length >= MAX_OPTIONS ? prev : [...prev, emptyAvailabilityOption()])
  }

  function removeAvailability(index: number) {
    setAvailability(prev => prev.length <= MIN_OPTIONS ? prev : prev.filter((_, entryIndex) => entryIndex !== index))
  }

  function validateCurrentStep() {
    if (step === 1) {
      if (!form.lead_street.trim() || !form.lead_city.trim() || !form.lead_state.trim() || !form.lead_zip.trim()) {
        setError('Street, city, state, and ZIP are required before continuing.')
        return false
      }
      return true
    }

    if (step === 2) {
      const trimmed = availability.map(option => ({ date: option.date, time: option.time }))
      const invalid = trimmed.some(option => !option.date || !option.time)
      if (invalid) {
        setError('Every availability option needs both a date and time.')
        return false
      }
      const duplicates = new Set(trimmed.map(option => `${option.date}-${option.time}`))
      if (duplicates.size !== trimmed.length) {
        setError('Duplicate date and time options are not allowed.')
        return false
      }
      const pastDate = trimmed.some(option => option.date < toISODateLocal())
      if (pastDate) {
        setError('Availability dates must be today or later.')
        return false
      }
      return true
    }

    return true
  }

  async function handleSubmit() {
    setError('')
    setLoading(true)
    try {
      const response = await fetch(`/api/clients/${params.id}/scheduling-request`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          lead_state: form.lead_state.toUpperCase(),
          lead_availability: availability,
          lead_notes: form.lead_notes || null,
        }),
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload.error ?? 'Failed to save scheduling request')
      }

      router.push('/schedule?requested=1')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save scheduling request')
    } finally {
      setLoading(false)
    }
  }

  if (loadingClient) {
    return <div className="p-4 md:p-8">Loading client...</div>
  }

  if (!client) {
    return <div className="p-4 md:p-8">Client not found.</div>
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/clients">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Lead Queue
        </Link>
      </Button>

      <Card className="glass-card border-[#d8cfbd]">
        <CardHeader>
          <CardTitle>{client.pipeline_stage === 'schedule' ? 'Edit Scheduling Request' : 'Book Inspection'}</CardTitle>
          <p className="text-sm text-[#667269]">
            {client.first_name} {client.last_name} will stay in the client workflow until the office assigns the final inspection slot.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            {[1, 2, 3].map(entry => (
              <button
                key={entry}
                type="button"
                onClick={() => setStep(entry)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                  step === entry
                    ? 'border-[#d08a2d] bg-[#d08a2d] text-[#1f2a24]'
                    : 'border-[#d8cfbd] bg-white text-[#314239]'
                }`}
              >
                Step {entry}
              </button>
            ))}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1f2f27]">{stepTitle}</h2>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Street Address *</Label>
                <Input
                  value={form.lead_street}
                  onChange={event => setForm(prev => ({ ...prev, lead_street: event.target.value }))}
                  placeholder="123 Main Street"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 col-span-1">
                  <Label>City *</Label>
                  <Input
                    value={form.lead_city}
                    onChange={event => setForm(prev => ({ ...prev, lead_city: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>State *</Label>
                  <Input
                    value={form.lead_state}
                    onChange={event => setForm(prev => ({ ...prev, lead_state: event.target.value.toUpperCase() }))}
                    maxLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>ZIP *</Label>
                  <Input
                    value={form.lead_zip}
                    onChange={event => setForm(prev => ({ ...prev, lead_zip: event.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {availability.map((option, index) => (
                <div key={`${index}-${option.date}-${option.time}`} className="rounded-2xl border border-[#d8cfbd] bg-[#fffdf8] p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-[#23352c]">Option {index + 1}</div>
                    {availability.length > MIN_OPTIONS && (
                      <button
                        type="button"
                        onClick={() => removeAvailability(index)}
                        className="text-[#8a4e3a]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Preferred Date *</Label>
                      <Input
                        type="date"
                        min={toISODateLocal()}
                        value={option.date}
                        onChange={event => updateAvailability(index, { date: event.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Preferred Time *</Label>
                      <Input
                        type="time"
                        value={option.time}
                        onChange={event => updateAvailability(index, { time: event.target.value })}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addAvailability}
                disabled={availability.length >= MAX_OPTIONS}
                className="border-[#bcae90] text-[#304239] hover:bg-[#f3ebdc]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Option
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2">
              <Label>Scheduling Notes</Label>
              <Textarea
                rows={5}
                value={form.lead_notes}
                onChange={event => setForm(prev => ({ ...prev, lead_notes: event.target.value }))}
                placeholder="Access details, best windows, gate codes, tenant timing, or any context the scheduler should see."
              />
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center justify-between pt-2">
            <div>
              {step > 1 && (
                <Button type="button" variant="outline" onClick={() => setStep(prev => prev - 1)}>
                  Back
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              {step < 3 ? (
                <Button
                  type="button"
                  onClick={() => {
                    setError('')
                    if (!validateCurrentStep()) return
                    setStep(prev => prev + 1)
                  }}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={loading}
                  onClick={async () => {
                    if (!validateCurrentStep()) return
                    await handleSubmit()
                  }}
                >
                  {loading ? 'Sending...' : 'Send to Schedule'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
