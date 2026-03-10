'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'
import {
  Calendar,
  ClipboardCheck,
  ClipboardList,
  FileText,
  FolderKanban,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  UserPlus2,
  Wallet,
  Wrench,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'

type WorkflowNavItem = {
  href: string
  label: string
  icon: ComponentType<{ className?: string }>
  description: string
  helperLinks?: Array<{ href: string; label: string }>
}

const commandNav = [
  { href: '/dashboard', label: 'Command', icon: LayoutDashboard },
]

const workflowNav: WorkflowNavItem[] = [
  {
    href: '/clients',
    label: 'Lead',
    icon: UserPlus2,
    description: 'Clients, referral partners, and intake records',
    helperLinks: [
      { href: '/clients', label: 'Clients' },
      { href: '/agents', label: 'Agents' },
    ],
  },
  {
    href: '/schedule',
    label: 'Schedule',
    icon: Calendar,
    description: 'Calendar, availability, and dispatch planning',
  },
  {
    href: '/prep',
    label: 'Prep',
    icon: Wrench,
    description: 'Create jobs, assign services, and confirm readiness',
    helperLinks: [
      { href: '/inspections/new', label: 'New Job' },
      { href: '/inspections', label: 'All Jobs' },
    ],
  },
  {
    href: '/inspections',
    label: 'Inspect',
    icon: ClipboardList,
    description: 'Active inspections, fieldwork, and job details',
  },
  {
    href: '/reports',
    label: 'Deliver',
    icon: ClipboardCheck,
    description: 'Completed reports, release, and templates',
    helperLinks: [
      { href: '/reports?tab=completed', label: 'Completed' },
      { href: '/reports?tab=templates', label: 'Templates' },
    ],
  },
  {
    href: '/invoices',
    label: 'Collect',
    icon: Wallet,
    description: 'Invoices, payments, and overdue follow-up',
  },
]

const utilityNav = [
  { href: '/workflow-studio', label: 'Studio', icon: FolderKanban },
  { href: '/settings', label: 'Settings', icon: Settings },
]

const mobileNavItems = [
  { href: '/dashboard', label: 'Command', icon: LayoutDashboard },
  { href: '/schedule', label: 'Schedule', icon: Calendar },
  { href: '/inspections', label: 'Inspect', icon: ClipboardList },
  { href: '/reports', label: 'Deliver', icon: ClipboardCheck },
  { href: '/invoices', label: 'Collect', icon: FileText },
]

function isActivePath(pathname: string, href: string) {
  const normalizedHref = href.split('?')[0]
  if (normalizedHref === '/dashboard') return pathname === '/dashboard'
  return pathname === normalizedHref || pathname.startsWith(`${normalizedHref}/`)
}

function getActiveSidebarKey(pathname: string) {
  if (pathname === '/dashboard') return 'command'
  if (pathname === '/clients' || pathname.startsWith('/clients/') || pathname === '/agents' || pathname.startsWith('/agents/')) {
    return 'lead'
  }
  if (pathname === '/schedule') return 'schedule'
  if (pathname === '/prep' || pathname === '/inspections/new') return 'prep'
  if (pathname === '/inspections' || pathname.startsWith('/inspections/')) {
    return pathname === '/inspections/new' ? 'prep' : 'inspect'
  }
  if (pathname === '/reports' || pathname.startsWith('/reports/')) return 'deliver'
  if (pathname === '/invoices' || pathname.startsWith('/invoices/')) return 'collect'
  if (pathname === '/workflow-studio') return 'studio'
  if (pathname === '/settings' || pathname.startsWith('/settings/')) return 'settings'
  return null
}

export function Sidebar() {
  const pathname = usePathname()
  const activeSidebarKey = getActiveSidebarKey(pathname)
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
      <aside className="hidden md:flex md:min-h-screen md:w-80 md:flex-col bg-[#1f3a2f] text-[#f4eee2] border-r border-[#3e5c4f]">
        <div className="px-6 py-6 border-b border-[#3e5c4f]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-[#2f5f4c] flex items-center justify-center">
              <Home className="h-5 w-5 text-[#f4eee2]" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#d8cfbd]">Operating System</p>
              <span className="text-lg font-semibold">Specthub</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          <div className="space-y-2">
            <div className="px-2 text-[11px] uppercase tracking-[0.18em] text-[#c7bea9]">Command</div>
            {commandNav.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition-colors',
                  activeSidebarKey === 'command'
                    ? 'bg-[#d08a2d] text-[#1f2a24] border-[#e9b467]'
                    : 'border-[#385446] text-[#efe6d8] hover:bg-[#294c3e] hover:text-white'
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {label}
              </Link>
            ))}
          </div>

          <div className="space-y-3">
            <div className="px-2 text-[11px] uppercase tracking-[0.18em] text-[#c7bea9]">Workflow</div>
            {workflowNav.map(({ href, label, icon: Icon, description, helperLinks }) => {
              const active = activeSidebarKey === label.toLowerCase()
              return (
                <div
                  key={label}
                  className={cn(
                    'rounded-3xl border px-4 py-4 transition-colors',
                    active
                      ? 'border-[#e9b467] bg-[#d08a2d] text-[#1f2a24]'
                      : 'border-[#385446] bg-[#243f34] text-[#f4eee2] hover:bg-[#294c3e]'
                  )}
                >
                  <Link href={href} className="block">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl border',
                        active
                          ? 'border-[#f1ca8e] bg-[#f1ca8e]/35'
                          : 'border-[#466555] bg-[#294c3e]'
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-base font-semibold">{label}</div>
                        <div className={cn(
                          'mt-1 text-sm leading-5',
                          active ? 'text-[#2c352f]' : 'text-[#d6cdbe]'
                        )}>
                          {description}
                        </div>
                      </div>
                    </div>
                  </Link>
                  {helperLinks && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {helperLinks.map(link => {
                        const helperActive = active && isActivePath(pathname, link.href)
                        return (
                          <Link
                            key={link.href + link.label}
                            href={link.href}
                            className={cn(
                              'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                              active
                                ? helperActive
                                  ? 'border-[#1f2a24]/20 bg-[#1f2a24]/10 text-[#1f2a24]'
                                  : 'border-[#1f2a24]/20 bg-transparent text-[#2b3933]'
                                : helperActive
                                  ? 'border-[#d8cfbd] bg-[#f4eee2] text-[#1f3a2f]'
                                  : 'border-[#567666] bg-[#294c3e] text-[#e8dfd0]'
                            )}
                          >
                            {link.label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="space-y-2">
            <div className="px-2 text-[11px] uppercase tracking-[0.18em] text-[#c7bea9]">Utilities</div>
            {utilityNav.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition-colors',
                  activeSidebarKey === label.toLowerCase()
                    ? 'bg-[#d08a2d] text-[#1f2a24] border-[#e9b467]'
                    : 'border-[#385446] text-[#efe6d8] hover:bg-[#294c3e] hover:text-white'
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="px-4 py-4 border-t border-[#3e5c4f]">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#e5dccd] hover:bg-[#294c3e] hover:text-white transition-colors"
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
          <aside className="absolute left-0 top-0 h-full w-[84%] max-w-sm bg-[#1f3a2f] text-[#f4eee2] border-r border-[#3e5c4f] overflow-auto ios-safe-top ios-safe-bottom">
            <div className="px-4 py-4 border-b border-[#3e5c4f]">
              <p className="text-xs uppercase tracking-[0.18em] text-[#d8cfbd]">Operating System</p>
              <p className="text-lg font-semibold mt-1">Specthub</p>
            </div>
            <nav className="px-3 py-4 space-y-5">
              <div className="space-y-2">
                <div className="px-2 text-[11px] uppercase tracking-[0.18em] text-[#c7bea9]">Command</div>
                {commandNav.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition-colors',
                      activeSidebarKey === 'command'
                        ? 'bg-[#d08a2d] text-[#1f2a24] border-[#e9b467]'
                        : 'border-[#385446] text-[#efe6d8] hover:bg-[#294c3e] hover:text-white'
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {label}
                  </Link>
                ))}
              </div>

              <div className="space-y-2">
                <div className="px-2 text-[11px] uppercase tracking-[0.18em] text-[#c7bea9]">Workflow</div>
                {workflowNav.map(({ href, label, icon: Icon, description }) => (
                  <Link
                    key={label}
                    href={href}
                    className={cn(
                      'block rounded-2xl border px-4 py-3 transition-colors',
                      activeSidebarKey === label.toLowerCase()
                        ? 'bg-[#d08a2d] text-[#1f2a24] border-[#e9b467]'
                        : 'border-[#385446] text-[#efe6d8] hover:bg-[#294c3e] hover:text-white'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-semibold">{label}</div>
                        <div className="mt-1 text-xs opacity-80">{description}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="space-y-2">
                <div className="px-2 text-[11px] uppercase tracking-[0.18em] text-[#c7bea9]">Utilities</div>
                {utilityNav.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition-colors',
                      activeSidebarKey === label.toLowerCase()
                        ? 'bg-[#d08a2d] text-[#1f2a24] border-[#e9b467]'
                        : 'border-[#385446] text-[#efe6d8] hover:bg-[#294c3e] hover:text-white'
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {label}
                  </Link>
                ))}
              </div>
            </nav>
            <div className="px-3 py-4 border-t border-[#3e5c4f]">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-[#e5dccd] hover:bg-[#294c3e] hover:text-white transition-colors w-full"
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
                activeSidebarKey === label.toLowerCase() || (label === 'Command' && activeSidebarKey === 'command')
                  ? 'text-[#1f3a2f]'
                  : 'text-[#6e776f]'
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
