import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Specthub — Inspection Operations Platform',
  description: 'Manage inspection operations, scheduling, reports, and billing in one platform.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
