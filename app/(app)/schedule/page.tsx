'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import nextDynamic from 'next/dynamic'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import type { Inspection } from '@/types'
import { isDemoMode, DEMO_INSPECTIONS } from '@/lib/demo'

// Disable SSR for FullCalendar — it uses browser APIs directly
const FullCalendar = nextDynamic(() => import('@fullcalendar/react'), { ssr: false })

const statusColors: Record<string, string> = {
  scheduled: '#3b82f6',
  in_progress: '#f59e0b',
  completed: '#10b981',
  cancelled: '#ef4444',
}

export default function SchedulePage() {
  const [events, setEvents] = useState<object[]>([])
  const [bookingLink, setBookingLink] = useState('/book/keystone-philly')
  const supabase = createClient()

  useEffect(() => {
    async function loadInspections() {
      if (isDemoMode()) {
        const calEvents = DEMO_INSPECTIONS
          .filter(inspection => inspection.status !== 'cancelled')
          .map(inspection => ({
            id: inspection.id,
            title: inspection.client
              ? `${inspection.client.first_name} ${inspection.client.last_name} — ${inspection.address}`
              : inspection.address,
            start: `${inspection.scheduled_date}T${inspection.scheduled_time}`,
            end: new Date(
              new Date(`${inspection.scheduled_date}T${inspection.scheduled_time}`).getTime() +
              inspection.duration_minutes * 60000
            ).toISOString(),
            url: `/inspections/${inspection.id}`,
            backgroundColor: statusColors[inspection.status] ?? '#3b82f6',
            borderColor: 'transparent',
          }))
        setEvents(calEvents)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data }, { data: profile }] = await Promise.all([
        supabase
          .from('inspections')
          .select('*, client:clients(first_name, last_name)')
          .eq('user_id', user.id)
          .neq('status', 'cancelled'),
        supabase
          .from('user_profiles')
          .select('booking_slug')
          .eq('id', user.id)
          .single(),
      ])

      if (data) {
        const calEvents = (data as Inspection[]).map(inspection => ({
          id: inspection.id,
          title: inspection.client
            ? `${inspection.client.first_name} ${inspection.client.last_name} — ${inspection.address}`
            : inspection.address,
          start: `${inspection.scheduled_date}T${inspection.scheduled_time}`,
          end: new Date(
            new Date(`${inspection.scheduled_date}T${inspection.scheduled_time}`).getTime() +
            inspection.duration_minutes * 60000
          ).toISOString(),
          url: `/inspections/${inspection.id}`,
          backgroundColor: statusColors[inspection.status] ?? '#3b82f6',
          borderColor: 'transparent',
        }))
        setEvents(calEvents)
      }
      if (profile?.booking_slug && typeof window !== 'undefined') {
        setBookingLink(`${window.location.origin}/book/${profile.booking_slug}`)
      }
    }

    loadInspections()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
          <p className="text-gray-500 mt-1">View and manage your inspection calendar</p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <a href={bookingLink} target="_blank">
              Booking Link
            </a>
          </Button>
          <Button asChild>
            <Link href="/inspections/new">
              <Plus className="h-4 w-4 mr-2" />
              New Inspection
            </Link>
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
          }}
          events={events}
          slotMinTime="07:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          height="auto"
          nowIndicator={true}
          eventClick={(info: { event: { url: string }; jsEvent: Event }) => {
            if (info.event.url) {
              info.jsEvent.preventDefault()
              window.location.href = info.event.url
            }
          }}
        />
      </Card>
    </div>
  )
}
