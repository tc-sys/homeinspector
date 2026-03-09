'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2 } from 'lucide-react'
import type { Service, UserProfile } from '@/types'

export default function SettingsPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<Partial<UserProfile>>({})
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newService, setNewService] = useState({ name: '', description: '', base_price: '', duration_minutes: '180' })

  function createBookingSlug() {
    const source = (profile.company_name || profile.full_name || 'inspector')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 28)
    const suffix = Math.random().toString(36).slice(2, 6)
    return `${source || 'inspector'}-${suffix}`
  }

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: p }, { data: s }] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('id', user.id).single(),
        supabase.from('services').select('*').eq('user_id', user.id).order('name'),
      ])

      if (p) {
        setProfile({
          ...p,
          booking_slug: p.booking_slug ?? `${(p.company_name || p.full_name || 'inspector').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 28)}-${Math.random().toString(36).slice(2, 6)}`,
        })
      }
      if (s) setServices(s)
    }
    loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('user_profiles').upsert({
      id: user!.id,
      ...profile,
      booking_slug: profile.booking_slug ?? createBookingSlug(),
      updated_at: new Date().toISOString(),
    })

    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setLoading(false)
  }

  async function addService(e: React.FormEvent) {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()

    const { data } = await supabase.from('services').insert({
      user_id: user!.id,
      name: newService.name,
      description: newService.description || null,
      base_price: Math.round(parseFloat(newService.base_price) * 100),
      duration_minutes: parseInt(newService.duration_minutes),
      active: true,
    }).select().single()

    if (data) {
      setServices(prev => [...prev, data])
      setNewService({ name: '', description: '', base_price: '', duration_minutes: '180' })
    }
  }

  async function toggleService(serviceId: string, active: boolean) {
    await supabase.from('services').update({ active }).eq('id', serviceId)
    setServices(prev => prev.map(s => s.id === serviceId ? { ...s, active } : s))
  }

  async function deleteService(serviceId: string) {
    if (!confirm('Delete this service?')) return
    await supabase.from('services').delete().eq('id', serviceId)
    setServices(prev => prev.filter(s => s.id !== serviceId))
  }

  const bookingLink = typeof window !== 'undefined'
    ? `${window.location.origin}/book/${profile.booking_slug ?? ''}`
    : `/book/${profile.booking_slug ?? ''}`

  return (
    <div className="p-8 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and business settings</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="services">Services & Pricing</TabsTrigger>
          <TabsTrigger value="booking">Booking Page</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Business Profile</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={saveProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={profile.full_name ?? ''}
                      onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      type="tel"
                      value={profile.phone ?? ''}
                      onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input
                    value={profile.company_name ?? ''}
                    onChange={e => setProfile(p => ({ ...p, company_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input
                    value={profile.website ?? ''}
                    onChange={e => setProfile(p => ({ ...p, website: e.target.value }))}
                    placeholder="https://yourcompany.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Logo URL</Label>
                  <Input
                    value={profile.logo_url ?? ''}
                    onChange={e => setProfile(p => ({ ...p, logo_url: e.target.value }))}
                    placeholder="https://.../logo.png"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Inspector Photo URL</Label>
                  <Input
                    value={profile.inspector_photo_url ?? ''}
                    onChange={e => setProfile(p => ({ ...p, inspector_photo_url: e.target.value }))}
                    placeholder="https://.../inspector-photo.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Report Cover Photo URL</Label>
                  <Input
                    value={profile.default_cover_photo_url ?? ''}
                    onChange={e => setProfile(p => ({ ...p, default_cover_photo_url: e.target.value }))}
                    placeholder="https://.../property-cover.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Booking Slug</Label>
                  <Input
                    value={profile.booking_slug ?? ''}
                    onChange={e => setProfile(p => ({
                      ...p,
                      booking_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 64),
                    }))}
                    placeholder="my-inspection-team"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Profile'}
                  </Button>
                  {saved && <span className="text-sm text-green-600 self-center">Saved!</span>}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="mt-6 space-y-6">
          {/* Existing Services */}
          <Card>
            <CardHeader><CardTitle>Your Services</CardTitle></CardHeader>
            <CardContent>
              {services.length === 0 ? (
                <p className="text-gray-400 text-sm">No services yet. Add one below.</p>
              ) : (
                <div className="space-y-3">
                  {services.map(service => (
                    <div key={service.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{service.name}</p>
                        <p className="text-sm text-gray-500">
                          ${(service.base_price / 100).toFixed(0)} · {service.duration_minutes} min
                          {service.description && ` · ${service.description}`}
                        </p>
                      </div>
                      <Switch
                        checked={service.active}
                        onCheckedChange={v => toggleService(service.id, v)}
                      />
                      <button
                        onClick={() => deleteService(service.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add New Service */}
          <Card>
            <CardHeader><CardTitle>Add Service</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={addService} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Service Name *</Label>
                    <Input
                      value={newService.name}
                      onChange={e => setNewService(s => ({ ...s, name: e.target.value }))}
                      placeholder="Standard Home Inspection"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Base Price ($) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newService.base_price}
                      onChange={e => setNewService(s => ({ ...s, base_price: e.target.value }))}
                      placeholder="350.00"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={newService.duration_minutes}
                      onChange={e => setNewService(s => ({ ...s, duration_minutes: e.target.value }))}
                      min="30"
                      step="30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={newService.description}
                      onChange={e => setNewService(s => ({ ...s, description: e.target.value }))}
                      placeholder="Optional description"
                    />
                  </div>
                </div>
                <Button type="submit">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="booking" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Client Booking Page</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Share your unique booking link with clients and embed it on your website so they can self-book inspections.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm break-all">
                {bookingLink}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigator.clipboard.writeText(bookingLink)}
                >
                  Copy Link
                </Button>
                <Button asChild variant="outline">
                  <a href={bookingLink} target="_blank">Preview Booking Page</a>
                </Button>
              </div>
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Embed on your website:</p>
                <div className="bg-gray-50 rounded-lg p-3 font-mono text-xs break-all">
                  {`<iframe src="${bookingLink}" width="100%" height="700" frameborder="0"></iframe>`}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
