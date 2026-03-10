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
import { ActionQueueCard, StageHeader } from '@/components/action-system'

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
  const [inspections, setInspections] = useState<Inspection[]>([])
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
        setInspections(DEMO_INSPECTIONS)
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
        const typedData = data as Inspection[]
        const calEvents = typedData.map(inspection => ({
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
        setInspections(typedData)
        setEvents(calEvents)
      }
      if (profile?.booking_slug && typeof window !== 'undefined') {
        setBookingLink(`${window.location.origin}/book/${profile.booking_slug}`)
      }
    }

    loadInspections()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const scheduledQueue = inspections
    .filter(inspection => inspection.status === 'scheduled')
    .sort((a, b) => `${a.scheduled_date} ${a.scheduled_time}`.localeCompare(`${b.scheduled_date} ${b.scheduled_time}`))
    .slice(0, 6)
    .map(inspection => ({
      id: inspection.id,
      title: inspection.address,
      subtitle: `${inspection.scheduled_date} at ${inspection.scheduled_time}${inspection.client ? ` · ${inspection.client.first_name} ${inspection.client.last_name}` : ''}`,
      note: 'Confirm the slot, route, and any day-of scheduling changes before the team heads out.',
      href: `/inspections/${inspection.id}`,
      actionLabel: 'Open job',
      tone: 'amber' as const,
    }))

  return (
    <div className="p-4 md:p-8 space-y-6">
      <StageHeader
        eyebrow="Schedule"
        title="Schedule Command"
        description="Drive the dispatch board from here. Keep the next few days locked in, visible, and conflict-free."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#1f2f27]">Dispatch Calendar</h2>
              <p className="text-sm text-[#657168] mt-1">View and manage your inspection calendar</p>
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
        </Card>
        <ActionQueueCard
          title="Scheduling Queue"
          description="These are the next appointments to verify and dispatch."
          emptyLabel="No scheduled inspections are waiting in the queue."
          items={scheduledQueue}
        />
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
