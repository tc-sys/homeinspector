import { Sidebar } from '@/components/sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen app-shell md:flex">
      <Sidebar />
      <main className="flex-1 overflow-auto pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
        <div className="min-h-screen">{children}</div>
      </main>
    </div>
  )
}
