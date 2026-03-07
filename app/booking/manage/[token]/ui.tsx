'use client'

import { useEffect, useMemo, useState } from 'react'
import { toISODateLocal } from '@/lib/utils'

export function ManageBookingCard({
  token,
  bookingSlug,
  currentStatus,
}: {
  token: string
  bookingSlug: string
  currentStatus: string
}) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('09:00')
  const [slots, setSlots] = useState<string[]>([])

  const disabled = useMemo(() => currentStatus === 'cancelled', [currentStatus])

  useEffect(() => {
    if (!date || !bookingSlug) return
    async function loadSlots() {
      const res = await fetch(
        `/api/public/availability?slug=${encodeURIComponent(bookingSlug)}&date=${encodeURIComponent(date)}`
      )
      if (!res.ok) return
      const body = await res.json()
      setSlots(body.slots ?? [])
    }
    loadSlots()
  }, [date, bookingSlug])

  async function cancelBooking() {
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const res = await fetch('/api/public/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'cancel' }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Could not cancel booking')
      setMessage('Your booking was cancelled.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not cancel booking')
    } finally {
      setLoading(false)
    }
  }

  async function rescheduleBooking() {
    if (!date || !time) return
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const res = await fetch('/api/public/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'reschedule', date, time }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Could not reschedule booking')
      setMessage('Your booking was rescheduled.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not reschedule booking')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border-t pt-4 space-y-4">
      <h2 className="text-sm font-semibold text-gray-900">Reschedule</h2>
      <div className="grid grid-cols-2 gap-3">
        <input
          type="date"
          value={date}
          min={toISODateLocal()}
          disabled={disabled || loading}
          onChange={e => setDate(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
        <select
          value={time}
          disabled={disabled || loading}
          onChange={e => setTime(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
        >
          {(slots.length ? slots : ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00']).map(slot => (
            <option key={slot} value={slot}>{slot}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <button
          onClick={rescheduleBooking}
          disabled={disabled || loading || !date}
          className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Reschedule'}
        </button>
        <button
          onClick={cancelBooking}
          disabled={disabled || loading}
          className="px-4 py-2 rounded-md text-sm font-medium border border-red-300 text-red-700 disabled:opacity-50"
        >
          Cancel Booking
        </button>
      </div>
      {message && <p className="text-sm text-green-600">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
