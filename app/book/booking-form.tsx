'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Home, CheckCircle } from 'lucide-react'
import type { PublicBookingProfile, Service } from '@/types'
import { toISODateLocal } from '@/lib/utils'

export function BookingForm({ slug }: { slug: string }) {
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [services, setServices] = useState<Service[]>([])
  const [slots, setSlots] = useState<string[]>([])
  const [profile, setProfile] = useState<PublicBookingProfile | null>(null)
  const [manageUrl, setManageUrl] = useState('')
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    preferred_date: '',
    preferred_time: '09:00',
    service_id: '',
    square_footage: '',
    notes: '',
  })

  useEffect(() => {
    async function loadServices() {
      const response = await fetch(`/api/public/services?slug=${encodeURIComponent(slug)}`)
      if (!response.ok) {
        setError('Invalid booking link.')
        return
      }
      const body = await response.json()
      setServices(body.services ?? [])
      setProfile(body.profile ?? null)
    }
    loadServices()
  }, [slug])

  useEffect(() => {
    if (!form.preferred_date) return
    async function loadAvailability() {
      const params = new URLSearchParams({ slug, date: form.preferred_date })
      if (form.service_id) params.set('serviceId', form.service_id)
      const response = await fetch(`/api/public/availability?${params.toString()}`)
      if (!response.ok) return
      const body = await response.json()
      const available = (body.slots ?? []) as string[]
      setSlots(available)
      if (available.length && !available.includes(form.preferred_time)) {
        setForm(prev => ({ ...prev, preferred_time: available[0] }))
      }
    }
    loadAvailability()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, form.preferred_date, form.service_id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, booking_slug: slug }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error ?? 'Booking failed')
      }

      const data = await response.json()
      setManageUrl(data.manageUrl ?? '')
      setStep('success')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Booking failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Request Received!</h2>
            <p className="text-gray-600">
              Thank you! We&apos;ve received your inspection request and will confirm your appointment via email shortly.
            </p>
            {manageUrl && (
              <a href={manageUrl} className="inline-block mt-4 text-sm text-blue-600 hover:underline">
                Manage or reschedule this booking
              </a>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Home className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">{profile?.company_name || 'InspectPro'}</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Book a Home Inspection</CardTitle>
            <CardDescription>Fill out the form below and we&apos;ll confirm your appointment.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Your Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name *</Label>
                    <Input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name *</Label>
                    <Input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-gray-900">Property Address</h3>
                <div className="space-y-2">
                  <Label>Street Address *</Label>
                  <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} required />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2 col-span-1">
                    <Label>City *</Label>
                    <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label>State *</Label>
                    <Input value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} maxLength={2} placeholder="CA" required />
                  </div>
                  <div className="space-y-2">
                    <Label>ZIP *</Label>
                    <Input value={form.zip} onChange={e => setForm(f => ({ ...f, zip: e.target.value }))} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Square Footage (approximate)</Label>
                  <Input type="number" value={form.square_footage} onChange={e => setForm(f => ({ ...f, square_footage: e.target.value }))} placeholder="2000" />
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-gray-900">Preferred Schedule</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Preferred Date *</Label>
                    <Input type="date" value={form.preferred_date} onChange={e => setForm(f => ({ ...f, preferred_date: e.target.value }))} min={toISODateLocal()} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Preferred Time *</Label>
                    {slots.length > 0 ? (
                      <select
                        value={form.preferred_time}
                        onChange={e => setForm(f => ({ ...f, preferred_time: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                        required
                      >
                        {slots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                      </select>
                    ) : (
                      <Input
                        type="time"
                        value={form.preferred_time}
                        onChange={e => setForm(f => ({ ...f, preferred_time: e.target.value }))}
                        required
                      />
                    )}
                  </div>
                </div>

                {services.length > 0 && (
                  <div className="space-y-2">
                    <Label>Service</Label>
                    <Select value={form.service_id} onValueChange={v => setForm(f => ({ ...f, service_id: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service..." />
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
                )}
              </div>

              <div className="space-y-2 border-t pt-4">
                <Label>Additional Notes</Label>
                <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Access codes, gate codes, any special instructions..." rows={3} />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Submitting...' : 'Request Inspection'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
