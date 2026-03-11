import { type NextResponse } from 'next/server'
import type { Client, Inspection, Invoice } from '@/types'
import { DEMO_CLIENTS, DEMO_INSPECTIONS, DEMO_INVOICES } from '@/lib/demo'

export const DEMO_CLIENT_OVERRIDES_COOKIE = 'specthub_demo_clients'
export const DEMO_INSPECTION_OVERRIDES_COOKIE = 'specthub_demo_inspections'
export const DEMO_INVOICE_OVERRIDES_COOKIE = 'specthub_demo_invoices'

type DemoOverrideBundle = {
  clients: Client[]
  inspections: Inspection[]
  invoices: Invoice[]
}

function parseOverrideCookie<T>(rawValue?: string | null): T[] {
  if (!rawValue) return []

  try {
    const parsed = JSON.parse(rawValue)
    return Array.isArray(parsed) ? parsed as T[] : []
  } catch {
    return []
  }
}

function mergeById<T extends { id: string }>(base: T[], overrides: T[]): T[] {
  const byId = new Map(base.map(item => [item.id, item] as const))

  overrides.forEach(item => {
    const previous = byId.get(item.id)
    byId.set(item.id, previous ? { ...previous, ...item } : item)
  })

  return Array.from(byId.values())
}

export function parseCookieString(cookieString: string): Record<string, string> {
  return cookieString
    .split(';')
    .map(part => part.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, part) => {
      const separatorIndex = part.indexOf('=')
      if (separatorIndex === -1) return acc
      const key = decodeURIComponent(part.slice(0, separatorIndex))
      const value = decodeURIComponent(part.slice(separatorIndex + 1))
      acc[key] = value
      return acc
    }, {})
}

export function getDemoOverrideBundleFromValues(values: Partial<Record<string, string>>): DemoOverrideBundle {
  return {
    clients: parseOverrideCookie<Client>(values[DEMO_CLIENT_OVERRIDES_COOKIE]),
    inspections: parseOverrideCookie<Inspection>(values[DEMO_INSPECTION_OVERRIDES_COOKIE]),
    invoices: parseOverrideCookie<Invoice>(values[DEMO_INVOICE_OVERRIDES_COOKIE]),
  }
}

export function getMergedDemoData(overrides: DemoOverrideBundle): DemoOverrideBundle {
  return {
    clients: mergeById(DEMO_CLIENTS, overrides.clients),
    inspections: mergeById(DEMO_INSPECTIONS, overrides.inspections),
    invoices: mergeById(DEMO_INVOICES, overrides.invoices),
  }
}

export function getDemoOverrideBundleFromCookieHeader(cookieHeader?: string | null): DemoOverrideBundle {
  return getDemoOverrideBundleFromValues(parseCookieString(cookieHeader ?? ''))
}

export function getBrowserDemoData(): DemoOverrideBundle {
  if (typeof document === 'undefined') {
    return {
      clients: DEMO_CLIENTS,
      inspections: DEMO_INSPECTIONS,
      invoices: DEMO_INVOICES,
    }
  }

  const values = parseCookieString(document.cookie)
  return getMergedDemoData(getDemoOverrideBundleFromValues(values))
}

export function upsertById<T extends { id: string }>(items: T[], nextItem: T): T[] {
  const existingIndex = items.findIndex(item => item.id === nextItem.id)
  if (existingIndex === -1) return [...items, nextItem]
  return items.map(item => item.id === nextItem.id ? nextItem : item)
}

function writeCookie<T>(response: NextResponse, name: string, value: T[]) {
  response.cookies.set({
    name,
    value: JSON.stringify(value),
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 14,
  })
}

export function writeDemoOverrides(
  response: NextResponse,
  overrides: Partial<DemoOverrideBundle>
) {
  if (overrides.clients) {
    writeCookie(response, DEMO_CLIENT_OVERRIDES_COOKIE, overrides.clients)
  }
  if (overrides.inspections) {
    writeCookie(response, DEMO_INSPECTION_OVERRIDES_COOKIE, overrides.inspections)
  }
  if (overrides.invoices) {
    writeCookie(response, DEMO_INVOICE_OVERRIDES_COOKIE, overrides.invoices)
  }
}
