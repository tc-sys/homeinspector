'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  ClipboardList,
  FileText,
  Settings,
  Home,
  LogOut,
  ClipboardCheck,
  Menu,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/schedule', label: 'Schedule', icon: Calendar },
  { href: '/inspections', label: 'Inspections', icon: ClipboardList },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/agents', label: 'Agents', icon: UserCheck },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/reports', label: 'Reports', icon: ClipboardCheck },
  { href: '/settings', label: 'Settings', icon: Settings },
]

const mobileNavItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/inspections', label: 'Inspections', icon: ClipboardList },
  { href: '/schedule', label: 'Schedule', icon: Calendar },
  { href: '/reports', label: 'Reports', icon: ClipboardCheck },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      <aside className="hidden md:flex md:flex-col md:w-72 md:min-h-screen bg-[#1f3a2f] text-[#f4eee2] border-r border-[#3e5c4f]">
        <div className="px-6 py-6 border-b border-[#3e5c4f]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-[#2f5f4c] flex items-center justify-center">
              <Home className="h-5 w-5 text-[#f4eee2]" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#d8cfbd]">Operations</p>
              <span className="text-lg font-semibold">Specthub</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1.5">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors border',
                pathname.startsWith(href)
                  ? 'bg-[#d08a2d] text-[#1f2a24] border-[#e9b467]'
                  : 'text-[#e5dccd] border-transparent hover:bg-[#294c3e] hover:text-white'
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-[#3e5c4f]">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#e5dccd] hover:bg-[#294c3e] hover:text-white transition-colors w-full"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="md:hidden sticky top-0 z-40 border-b border-[#d8cfbd] bg-[#fffdf8] ios-safe-top">
        <div className="h-14 px-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#2f5f4c] flex items-center justify-center">
              <Home className="h-4 w-4 text-[#f4eee2]" />
            </div>
            <span className="font-semibold text-[#1f3a2f]">Specthub</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(v => !v)}
            className="h-9 w-9 rounded-md border border-[#d8cfbd] text-[#1f3a2f] inline-flex items-center justify-center"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <button
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu overlay"
          />
          <aside className="absolute left-0 top-0 h-full w-[82%] max-w-sm bg-[#1f3a2f] text-[#f4eee2] border-r border-[#3e5c4f] overflow-auto ios-safe-top ios-safe-bottom">
            <div className="px-4 py-4 border-b border-[#3e5c4f]">
              <p className="text-xs uppercase tracking-[0.18em] text-[#d8cfbd]">Operations</p>
              <p className="text-lg font-semibold mt-1">Specthub</p>
            </div>
            <nav className="px-3 py-4 space-y-1.5">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors border',
                    pathname.startsWith(href)
                      ? 'bg-[#d08a2d] text-[#1f2a24] border-[#e9b467]'
                      : 'text-[#e5dccd] border-transparent hover:bg-[#294c3e] hover:text-white'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {label}
                </Link>
              ))}
            </nav>
            <div className="px-3 py-4 border-t border-[#3e5c4f]">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#e5dccd] hover:bg-[#294c3e] hover:text-white transition-colors w-full"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[#d8cfbd] bg-[#fffdf8] ios-safe-bottom">
        <div className="h-16 px-2 grid grid-cols-5">
          {mobileNavItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 text-[11px] font-medium',
                pathname.startsWith(href) ? 'text-[#1f3a2f]' : 'text-[#6e776f]'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
