import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, statusColor } from '@/lib/utils'
import { ArrowLeft, Mail, Phone, MapPin, Plus } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Client, Inspection, ContactLog } from '@/types'
import { isDemoMode, DEMO_CONTACT_LOGS } from '@/lib/demo'
import { getServerDemoData } from '@/lib/demo-state-server'

export const dynamic = 'force-dynamic'

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let client: Client | null = null
  let inspections: Inspection[] = []
  let logs: ContactLog[] = []

  if (isDemoMode()) {
    const demoData = await getServerDemoData()
    client = demoData.clients.find(c => c.id === id) ?? null
    if (!client) notFound()
    inspections = demoData.inspections.filter(i => i.client_id === id)
    logs = DEMO_CONTACT_LOGS.filter(l => l.client_id === id)
  } else {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    const [{ data: c }, { data: i }, { data: l }] = await Promise.all([
      supabase.from('clients').select('*').eq('id', id).eq('user_id', user!.id).single(),
      supabase.from('inspections').select('*, invoice:invoices(status, total_amount)').eq('client_id', id).order('scheduled_date', { ascending: false }),
      supabase.from('contacts_log').select('*').eq('client_id', id).order('created_at', { ascending: false }).limit(20),
    ])
    if (!c) notFound()
    client = c as Client
    inspections = (i ?? []) as Inspection[]
    logs = (l ?? []) as ContactLog[]
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/clients">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clients
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={`/clients/${id}/edit`}>Edit Client</Link>
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
          {client.first_name[0]}{client.last_name[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{client.first_name} {client.last_name}</h1>
          <div className="mt-2">
            <Badge variant="secondary">{client.pipeline_stage}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {client.email && (
              <a href={`mailto:${client.email}`} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600">
                <Mail className="h-4 w-4" /> {client.email}
              </a>
            )}
            {client.phone && (
              <a href={`tel:${client.phone}`} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600">
                <Phone className="h-4 w-4" /> {client.phone}
              </a>
            )}
            {client.address && (
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <MapPin className="h-4 w-4" /> {client.address}
              </span>
            )}
          </div>
          {client.tags?.length > 0 && (
            <div className="flex gap-2 mt-2">
              {client.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {(client.pipeline_stage === 'lead' || client.pipeline_stage === 'schedule') && (
        <Card className="glass-card border-[#d8cfbd]">
          <CardContent className="pt-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#23352c]">Lead Workflow</p>
              <p className="text-sm text-[#667269] mt-1">
                {client.pipeline_stage === 'lead'
                  ? 'This client is still in Lead and needs a scheduling request.'
                  : 'This client has submitted scheduling details and is waiting for a final slot.'}
              </p>
            </div>
            <Button asChild>
              <Link href={client.pipeline_stage === 'schedule' ? `/clients/${id}/book-inspection` : `/clients/${id}/book-inspection`}>
                {client.pipeline_stage === 'schedule' ? 'Edit Scheduling Request' : 'Book Inspection'}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {client.pipeline_stage === 'schedule' && (
        <Card className="glass-card border-[#d8cfbd]">
          <CardHeader><CardTitle>Scheduling Request</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-[#23352c]">
              {[client.lead_street, client.lead_city, client.lead_state, client.lead_zip].filter(Boolean).join(', ')}
            </p>
            {client.lead_availability.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {client.lead_availability.map(option => (
                  <Badge key={`${option.date}-${option.time}`} variant="secondary">
                    {option.date} {option.time}
                  </Badge>
                ))}
              </div>
            )}
            {client.lead_notes && <p className="text-sm text-[#667269]">{client.lead_notes}</p>}
            <Button asChild variant="outline" size="sm">
              <Link href={`/schedule/assign/${client.id}`}>Assign Final Slot</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {client.notes && (
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-600">{client.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Inspection History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Inspection History</CardTitle>
          <Button asChild size="sm">
            <Link href={`/inspections/new?client=${id}`}>
              <Plus className="h-4 w-4 mr-2" />
              New Inspection
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {!inspections.length ? (
            <p className="text-gray-400 text-sm">No inspections yet.</p>
          ) : (
            <div className="space-y-3">
              {inspections.map(inspection => (
                <Link key={inspection.id} href={`/inspections/${inspection.id}`}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{inspection.address}</p>
                      <p className="text-sm text-gray-500">{formatDate(inspection.scheduled_date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(inspection.price)}</p>
                      <Badge className={statusColor(inspection.status)}>{inspection.status}</Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          {!logs.length ? (
            <p className="text-gray-400 text-sm">No activity logged yet.</p>
          ) : (
            <div className="space-y-3">
              {logs.map(log => (
                <div key={log.id} className="flex gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 text-blue-700 text-xs font-medium uppercase">
                      {log.type[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700">{log.notes}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(log.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
