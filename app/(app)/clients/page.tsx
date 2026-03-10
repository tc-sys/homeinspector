import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getInitials, formatDate } from '@/lib/utils'
import { Plus, Phone, Mail, Search } from 'lucide-react'
import Link from 'next/link'
import type { Client, Inspection, Invoice, InspectionReport } from '@/types'
import { isDemoMode, DEMO_CLIENTS, DEMO_INSPECTIONS, DEMO_INVOICES, DEMO_INSPECTION_REPORTS } from '@/lib/demo'
import { ActionQueueCard, StageCounts, StageHeader } from '@/components/action-system'
import { buildActionStageSnapshot } from '@/lib/action-system'

export const dynamic = 'force-dynamic'

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>
}) {
  const params = await searchParams

  if (isDemoMode()) {
    const q = params.q?.toLowerCase()
    const clients = q
      ? DEMO_CLIENTS.filter(c =>
          `${c.first_name} ${c.last_name} ${c.email}`.toLowerCase().includes(q)
        )
      : DEMO_CLIENTS
    const stageSnapshot = buildActionStageSnapshot({
      clients: DEMO_CLIENTS,
      inspections: DEMO_INSPECTIONS,
      invoices: DEMO_INVOICES,
      reports: DEMO_INSPECTION_REPORTS,
    })
    return <ClientsUI clients={clients} q={params.q} stageSnapshot={stageSnapshot} />
  }

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase
    .from('clients')
    .select('*')
    .eq('user_id', user!.id)
    .order('last_name', { ascending: true })

  if (params.q) {
    query = query.or(`first_name.ilike.%${params.q}%,last_name.ilike.%${params.q}%,email.ilike.%${params.q}%`)
  }

  const [{ data: clients }, { data: inspections }, { data: invoices }, { data: reports }] = await Promise.all([
    query,
    supabase
      .from('inspections')
      .select('*, client:clients(*), agent:agents(*), service:services(*)')
      .eq('user_id', user!.id),
    supabase
      .from('invoices')
      .select('id, inspection_id, user_id, client_id, amount, tax_amount, total_amount, status, due_date, paid_date, stripe_payment_intent_id, stripe_payment_link, pass_card_fee, notes, created_at, updated_at')
      .eq('user_id', user!.id),
    supabase
      .from('inspection_reports')
      .select('inspection_id, status'),
  ])

  const stageSnapshot = buildActionStageSnapshot({
    clients: (clients ?? []) as Client[],
    inspections: (inspections ?? []) as Inspection[],
    invoices: (invoices ?? []) as Invoice[],
    reports: (reports ?? []) as Pick<InspectionReport, 'inspection_id' | 'status'>[],
  })

  return <ClientsUI clients={(clients ?? []) as Client[]} q={params.q} stageSnapshot={stageSnapshot} />
}

function ClientsUI({
  clients,
  q,
  stageSnapshot,
}: {
  clients: Client[]
  q?: string
  stageSnapshot: ReturnType<typeof buildActionStageSnapshot>
}) {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <StageHeader
        eyebrow="Lead"
        title="Lead Command"
        description="Work the top of funnel here. These clients exist in the network but have not been converted into scheduled jobs yet."
      />

      <StageCounts counts={[
        { label: 'Lead', value: stageSnapshot.lead.length },
        { label: 'Schedule', value: stageSnapshot.schedule.length, tone: 'amber' },
        { label: 'Prep', value: stageSnapshot.prep.length, tone: 'amber' },
        { label: 'Inspect', value: stageSnapshot.inspect.length, tone: 'green' },
        { label: 'Deliver', value: stageSnapshot.deliver.length, tone: 'green' },
        { label: 'Collect', value: stageSnapshot.collect.length, tone: 'red' },
      ]} />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ActionQueueCard
          title="Unscheduled Leads"
          description="Clients who are in Specthub but do not yet have an inspection scheduled."
          emptyLabel="Every saved lead already has a scheduled inspection."
          items={stageSnapshot.lead.slice(0, 8)}
        />
        <Card className="glass-card border-[#d8cfbd]">
          <CardContent className="pt-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-[#1f2f27]">Lead Actions</h2>
              <p className="text-sm text-[#657168] mt-1">Use these quick jumps to move people into booked work.</p>
            </div>
            <div className="grid gap-3">
              <Button asChild className="bg-[#2f5f4c] hover:bg-[#234b3c] text-[#f8f4ea] justify-start">
                <Link href="/inspections/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Convert Lead to Inspection
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start border-[#bcae90] text-[#304239] hover:bg-[#f3ebdc]">
                <Link href="/agents">Open Referral Partners</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <form className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            name="q"
            defaultValue={q ?? ''}
            placeholder="Search clients..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button type="submit" variant="outline">Search</Button>
      </form>

      {!clients.length ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-gray-400 mb-4">No clients yet.</p>
            <Button asChild>
              <Link href="/clients/new">Add Your First Client</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {clients.map(client => (
            <Link key={client.id} href={`/clients/${client.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="py-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {getInitials(client.first_name, client.last_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">
                      {client.first_name} {client.last_name}
                    </p>
                    <div className="flex items-center gap-4 mt-1">
                      {client.email && (
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                          <Mail className="h-3.5 w-3.5" />
                          {client.email}
                        </span>
                      )}
                      {client.phone && (
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                          <Phone className="h-3.5 w-3.5" />
                          {client.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {client.tags?.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                    <span className="text-xs text-gray-400">{formatDate(client.created_at)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
