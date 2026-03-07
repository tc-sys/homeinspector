import { notFound } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/supabase-server'
import { formatDate, formatTime } from '@/lib/utils'
import { ManageBookingCard } from './ui'

export const dynamic = 'force-dynamic'

export default async function ManageBookingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createServiceRoleClient()

  const { data: inspection } = await supabase
    .from('inspections')
    .select('id, scheduled_date, scheduled_time, status, address, city, state, zip, duration_minutes, client:clients(first_name, last_name), user_profiles!inspections_user_id_fkey(booking_slug)')
    .eq('client_portal_token', token)
    .single()

  if (!inspection) notFound()

  const relatedProfile = (inspection as {
    user_profiles?: { booking_slug?: string } | Array<{ booking_slug?: string }>
    client?: { first_name?: string; last_name?: string } | Array<{ first_name?: string; last_name?: string }>
  }).user_profiles
  const bookingSlug = Array.isArray(relatedProfile)
    ? relatedProfile[0]?.booking_slug
    : relatedProfile?.booking_slug
  const relatedClient = (inspection as {
    client?: { first_name?: string; last_name?: string } | Array<{ first_name?: string; last_name?: string }>
  }).client
  const client = Array.isArray(relatedClient) ? relatedClient[0] : relatedClient

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-xl mx-auto bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h1 className="text-xl font-bold text-gray-900">Manage Your Inspection</h1>
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            <span className="font-medium text-gray-900">Property:</span> {inspection.address}, {inspection.city}, {inspection.state} {inspection.zip}
          </p>
          <p>
            <span className="font-medium text-gray-900">Current Time:</span> {formatDate(inspection.scheduled_date)} at {formatTime(inspection.scheduled_time)}
          </p>
          {client && (
            <p>
              <span className="font-medium text-gray-900">Client:</span> {client.first_name} {client.last_name}
            </p>
          )}
          <p>
            <span className="font-medium text-gray-900">Status:</span> {inspection.status.replace('_', ' ')}
          </p>
        </div>

        <ManageBookingCard
          token={token}
          bookingSlug={bookingSlug ?? ''}
          currentStatus={inspection.status}
        />
      </div>
    </div>
  )
}
