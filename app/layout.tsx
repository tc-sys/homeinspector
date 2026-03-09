import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'InspectPro — Home Inspection Management',
  description: 'Manage your home inspection business with ease',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
