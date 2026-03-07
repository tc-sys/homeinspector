import { BookingForm } from '../booking-form'

export const dynamic = 'force-dynamic'

export default async function InspectorBookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <BookingForm slug={slug} />
}
