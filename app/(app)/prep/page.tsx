import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { ActionQueueCard, StageHeader } from '@/components/action-system'
import { buildActionStageSnapshot } from '@/lib/action-system'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import type { Client, Inspection, InspectionReport, Invoice } from '@/types'
import {
  isDemoMode,
  DEMO_CLIENTS,
  DEMO_INSPECTIONS,
  DEMO_INVOICES,
  DEMO_INSPECTION_REPORTS,
} from '@/lib/demo'

export const dynamic = 'force-dynamic'

export default async function PrepPage() {
  let clients: Client[] = []
  let inspections: Inspection[] = []
  let invoices: Invoice[] = []
  let reports: Pick<InspectionReport, 'inspection_id' | 'status'>[] = []

  if (isDemoMode()) {
    clients = DEMO_CLIENTS
    inspections = DEMO_INSPECTIONS
    invoices = DEMO_INVOICES
    reports = DEMO_INSPECTION_REPORTS
  } else {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    const [{ data: clientsData }, { data: inspectionsData }, { data: invoicesData }, { data: reportsData }] = await Promise.all([
      supabase.from('clients').select('*').eq('user_id', user!.id),
      supabase
        .from('inspections')
        .select('*, client:clients(first_name, last_name)')
        .eq('user_id', user!.id),
      supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user!.id),
      supabase
        .from('inspection_reports')
        .select('inspection_id, status'),
    ])
    clients = (clientsData ?? []) as Client[]
    inspections = (inspectionsData ?? []) as Inspection[]
    invoices = (invoicesData ?? []) as Invoice[]
    reports = (reportsData ?? []) as Pick<InspectionReport, 'inspection_id' | 'status'>[]
  }

  const snapshot = buildActionStageSnapshot({ clients, inspections, invoices, reports })

  return (
    <div className="p-4 md:p-8 space-y-6">
      <StageHeader
        eyebrow="Prep"
        title="Prep Command"
        description="Finish job setup before the inspector goes on site. This page highlights missing templates, missing service packages, and near-term jobs that need readiness review."
        currentStage="prep"
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <ActionQueueCard
          title="Prep Queue"
          description="Jobs that need setup work or are approaching site day and should be reviewed now."
          emptyLabel="All scheduled jobs are fully prepped."
          items={snapshot.prep.slice(0, 8)}
        />

        <Card className="glass-card border-[#d8cfbd]">
          <CardContent className="pt-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-[#1f2f27]">Prep Actions</h2>
              <p className="text-sm text-[#657168] mt-1">These are the fastest ways to remove blockers before fieldwork starts.</p>
            </div>
            <div className="grid gap-3">
              <Button asChild className="bg-[#2f5f4c] hover:bg-[#234b3c] text-[#f8f4ea] justify-start">
                <Link href="/inspections/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Job
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start border-[#bcae90] text-[#304239] hover:bg-[#f3ebdc]">
                <Link href="/reports?tab=templates">Review Templates</Link>
              </Button>
              <Button asChild variant="outline" className="justify-start border-[#bcae90] text-[#304239] hover:bg-[#f3ebdc]">
                <Link href="/schedule">Open Calendar</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
