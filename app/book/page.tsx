import Link from 'next/link'

export default function BookingLandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-16">
      <div className="max-w-xl mx-auto bg-white rounded-xl border border-gray-200 p-8 text-center space-y-3">
        <h1 className="text-2xl font-bold text-gray-900">Booking Link Required</h1>
        <p className="text-sm text-gray-600">
          Use your inspector-specific booking URL to continue.
        </p>
        <p className="text-sm text-gray-500">
          Inspectors can copy this link from Settings.
        </p>
        <Link href="/login" className="inline-block mt-2 text-sm text-blue-600 hover:underline">
          Inspector sign in
        </Link>
      </div>
    </div>
  )
}
