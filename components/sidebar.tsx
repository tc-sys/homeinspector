'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
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

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="flex flex-col w-72 min-h-screen bg-[#1f3a2f] text-[#f4eee2] border-r border-[#3e5c4f]">
      <div className="px-6 py-6 border-b border-[#3e5c4f]">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-[#2f5f4c] flex items-center justify-center">
            <Home className="h-5 w-5 text-[#f4eee2]" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#d8cfbd]">Operations</p>
            <span className="text-lg font-semibold">InspectPro</span>
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
  )
}
