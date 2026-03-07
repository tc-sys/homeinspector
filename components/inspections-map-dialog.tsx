'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { MapPinned } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface InspectionMapItem {
  id: string
  address: string
  city: string
  state: string
  zip: string
  status: string
}

interface GeocodedInspection extends InspectionMapItem {
  lat: number
  lon: number
  normalizedAddress: string
}

declare global {
  interface Window {
    L?: {
      map: (el: HTMLElement) => LeafletMap
      tileLayer: (url: string, opts: Record<string, unknown>) => { addTo: (map: LeafletMap) => void }
      marker: (coords: [number, number]) => { addTo: (map: LeafletMap) => { bindPopup: (html: string) => void } }
      latLngBounds: (coords: [number, number][]) => unknown
    }
    __leafletLoading?: Promise<void>
  }
}

interface LeafletMap {
  setView: (coords: [number, number], zoom: number) => void
  fitBounds: (bounds: unknown, opts?: { padding?: [number, number] }) => void
  remove: () => void
}

function inspectionAddress(inspection: InspectionMapItem): string {
  const parts = [inspection.address, inspection.city, inspection.state, inspection.zip]
    .map(part => (part ?? '').trim())
    .filter(Boolean)
  return parts.join(', ')
}

function normalizeQuery(raw: string): string {
  return raw
    .replace(/\bSt\b/gi, 'Street')
    .replace(/\bRd\b/gi, 'Road')
    .replace(/\bDr\b/gi, 'Drive')
    .replace(/\bAve\b/gi, 'Avenue')
    .replace(/\bBlvd\b/gi, 'Boulevard')
    .replace(/\s+/g, ' ')
    .trim()
}

function candidateQueries(inspection: InspectionMapItem): string[] {
  const base = normalizeQuery(inspectionAddress(inspection))
  const streetState = normalizeQuery(
    [inspection.address, inspection.city, inspection.state].map(v => (v ?? '').trim()).filter(Boolean).join(', ')
  )
  const cityState = normalizeQuery(
    [inspection.city, inspection.state].map(v => (v ?? '').trim()).filter(Boolean).join(', ')
  )
  return Array.from(new Set([
    `${base}, USA`,
    base,
    `${streetState}, USA`,
    streetState,
    `${cityState}, USA`,
    cityState,
  ].filter(Boolean)))
}

async function loadLeaflet(): Promise<void> {
  if (typeof window === 'undefined') return
  if (window.L) return
  if (window.__leafletLoading) return window.__leafletLoading

  const existingCss = document.getElementById('leaflet-css')
  if (!existingCss) {
    const link = document.createElement('link')
    link.id = 'leaflet-css'
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
  }

  window.__leafletLoading = new Promise((resolve, reject) => {
    const existing = document.getElementById('leaflet-js') as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Failed to load map library')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.id = 'leaflet-js'
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load map library'))
    document.body.appendChild(script)
  })

  return window.__leafletLoading
}

export function InspectionsMapDialog({ inspections }: { inspections: InspectionMapItem[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [points, setPoints] = useState<GeocodedInspection[]>([])
  const mapRef = useRef<HTMLDivElement | null>(null)
  const leafletMapRef = useRef<LeafletMap | null>(null)

  const normalizedInspections = useMemo(
    () => inspections.filter(i => inspectionAddress(i).length > 0),
    [inspections]
  )

  useEffect(() => {
    if (!open || points.length > 0 || normalizedInspections.length === 0) return

    async function geocodeAll() {
      setLoading(true)
      setError('')
      try {
        const cache = new Map<string, { lat: number; lon: number; normalizedAddress: string }>()
        const next: GeocodedInspection[] = []

        for (const inspection of normalizedInspections) {
          const fullAddress = inspectionAddress(inspection)
          if (cache.has(fullAddress.toLowerCase())) {
            const c = cache.get(fullAddress.toLowerCase())!
            next.push({ ...inspection, lat: c.lat, lon: c.lon, normalizedAddress: c.normalizedAddress })
            continue
          }

          let found: { lat: number; lon: number; normalizedAddress: string } | null = null
          for (const query of candidateQueries(inspection)) {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=1&q=${encodeURIComponent(query)}`
            )
            if (!response.ok) continue
            const data = (await response.json()) as Array<{ lat: string; lon: string; display_name?: string }>
            if (!data.length) continue
            const lat = parseFloat(data[0].lat)
            const lon = parseFloat(data[0].lon)
            if (Number.isNaN(lat) || Number.isNaN(lon)) continue
            found = {
              lat,
              lon,
              normalizedAddress: data[0].display_name ?? fullAddress,
            }
            break
          }
          if (!found) continue

          cache.set(fullAddress.toLowerCase(), found)
          next.push({
            ...inspection,
            lat: found.lat,
            lon: found.lon,
            normalizedAddress: found.normalizedAddress,
          })
        }

        setPoints(next)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Could not load map data')
      } finally {
        setLoading(false)
      }
    }

    geocodeAll()
  }, [open, points.length, normalizedInspections])

  useEffect(() => {
    if (!open || points.length === 0 || !mapRef.current) return

    async function renderMap() {
      try {
        await loadLeaflet()
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Could not load map library')
        return
      }
      if (!window.L || !mapRef.current) return

      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
      }

      const map = window.L.map(mapRef.current)
      leafletMapRef.current = map

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map)

      const coords: [number, number][] = []
      for (const point of points) {
        coords.push([point.lat, point.lon])
        window.L.marker([point.lat, point.lon]).addTo(map).bindPopup(
          `<strong>${point.address || point.normalizedAddress}</strong><br/>${point.city}, ${point.state} ${point.zip}<br/>Status: ${point.status}<br/>Mapped as: ${point.normalizedAddress}`
        )
      }

      if (coords.length === 1) {
        map.setView(coords[0], 12)
      } else {
        map.fitBounds(window.L.latLngBounds(coords), { padding: [24, 24] })
      }
    }

    renderMap()
  }, [open, points])

  useEffect(() => {
    if (open) return
    if (leafletMapRef.current) {
      leafletMapRef.current.remove()
      leafletMapRef.current = null
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <MapPinned className="h-4 w-4 mr-2" />
          Map View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl w-[95vw] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Inspections Map</DialogTitle>
          <DialogDescription>
            Locations for {normalizedInspections.length} inspections with valid addresses.
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="h-[65vh] rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-sm text-gray-500">
            Geocoding inspection addresses...
          </div>
        )}

        {!loading && error && (
          <div className="h-[65vh] rounded-lg border border-red-200 bg-red-50 flex items-center justify-center text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && points.length === 0 && (
          <div className="h-[65vh] rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-sm text-gray-500">
            No map coordinates found for current inspections.
          </div>
        )}

        {!loading && !error && points.length > 0 && (
          <div ref={mapRef} className="h-[65vh] rounded-lg border border-gray-200" />
        )}
      </DialogContent>
    </Dialog>
  )
}
