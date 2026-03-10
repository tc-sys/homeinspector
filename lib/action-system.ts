import type { Client, Inspection, InspectionReport, Invoice } from '@/types'

export type ActionStage = 'lead' | 'schedule' | 'prep' | 'inspect' | 'deliver' | 'collect'

export interface ActionStageItem {
  id: string
  title: string
  subtitle: string
  note: string
  href: string
  actionLabel: string
  tone?: 'neutral' | 'amber' | 'green' | 'red'
}

export interface ActionStageSnapshot {
  lead: ActionStageItem[]
  schedule: ActionStageItem[]
  prep: ActionStageItem[]
  inspect: ActionStageItem[]
  deliver: ActionStageItem[]
  collect: ActionStageItem[]
}

function formatInspectionAddress(inspection: Inspection) {
  return `${inspection.address}${inspection.city ? `, ${inspection.city}` : ''}`
}

function formatMoney(amountInCents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amountInCents / 100)
}

function formatClientName(client?: Client | null) {
  if (!client) return 'No client assigned'
  return `${client.first_name} ${client.last_name}`
}

function daysUntil(date: string) {
  const today = new Date()
  const target = new Date(`${date}T12:00:00`)
  return Math.round((target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))
}

export function buildActionStageSnapshot(input: {
  clients: Client[]
  inspections: Inspection[]
  invoices: Invoice[]
  reports: Pick<InspectionReport, 'inspection_id' | 'status'>[]
}): ActionStageSnapshot {
  const inspectionClientIds = new Set(input.inspections.map(inspection => inspection.client_id).filter(Boolean) as string[])
  const reportStatusByInspectionId = new Map(input.reports.map(report => [report.inspection_id, report.status] as const))
  const invoiceByInspectionId = new Map(input.invoices.map(invoice => [invoice.inspection_id, invoice] as const))

  const lead = input.clients
    .filter(client => !inspectionClientIds.has(client.id))
    .map(client => ({
      id: client.id,
      title: `${client.first_name} ${client.last_name}`,
      subtitle: client.email ?? client.phone ?? 'No contact details saved',
      note: 'No scheduled inspection yet. Convert this lead into a booked job.',
      href: `/clients/${client.id}`,
      actionLabel: 'Book inspection',
      tone: 'neutral' as const,
    }))

  const schedule = input.inspections
    .filter(inspection => inspection.status === 'scheduled')
    .sort((a, b) => `${a.scheduled_date} ${a.scheduled_time}`.localeCompare(`${b.scheduled_date} ${b.scheduled_time}`))
    .map(inspection => ({
      id: inspection.id,
      title: formatInspectionAddress(inspection),
      subtitle: `${inspection.scheduled_date} at ${inspection.scheduled_time} · ${formatClientName(inspection.client)}`,
      note: 'Scheduled job. Confirm the slot, inspector plan, and arrival window.',
      href: `/inspections/${inspection.id}`,
      actionLabel: 'Review schedule',
      tone: daysUntil(inspection.scheduled_date) <= 1 ? 'amber' as const : 'neutral' as const,
    }))

  const prep = input.inspections
    .filter(inspection => inspection.status === 'scheduled')
    .map(inspection => {
      const blockers = [
        !inspection.client_id ? 'client' : null,
        !inspection.service_id ? 'service' : null,
        !inspection.template_id ? 'template' : null,
      ].filter(Boolean) as string[]
      return { inspection, blockers }
    })
    .filter(({ inspection, blockers }) => blockers.length > 0 || daysUntil(inspection.scheduled_date) <= 5)
    .sort((a, b) => b.blockers.length - a.blockers.length || `${a.inspection.scheduled_date} ${a.inspection.scheduled_time}`.localeCompare(`${b.inspection.scheduled_date} ${b.inspection.scheduled_time}`))
    .map(({ inspection, blockers }) => ({
      id: inspection.id,
      title: formatInspectionAddress(inspection),
      subtitle: `${inspection.scheduled_date} · ${formatClientName(inspection.client)}`,
      note: blockers.length
        ? `Prep blocked by missing ${blockers.join(', ')}.`
        : 'Prep is due soon. Confirm access notes, readiness, and job setup.',
      href: blockers.length ? `/inspections/${inspection.id}/edit` : `/inspections/${inspection.id}`,
      actionLabel: blockers.length ? 'Finish prep' : 'Prep checklist',
      tone: blockers.length ? 'red' as const : 'amber' as const,
    }))

  const inspect = input.inspections
    .filter(inspection => inspection.status === 'in_progress' || (inspection.status === 'completed' && reportStatusByInspectionId.get(inspection.id) !== 'finalized'))
    .sort((a, b) => `${b.scheduled_date} ${b.scheduled_time}`.localeCompare(`${a.scheduled_date} ${a.scheduled_time}`))
    .map(inspection => {
      const reportStatus = reportStatusByInspectionId.get(inspection.id) ?? null
      const active = inspection.status === 'in_progress'
      return {
        id: inspection.id,
        title: formatInspectionAddress(inspection),
        subtitle: `${formatClientName(inspection.client)} · ${active ? 'On site now' : 'Inspection completed'}`,
        note: active
          ? 'Fieldwork is active. Continue the report from the inspection workspace.'
          : reportStatus === 'draft'
            ? 'Report draft exists but is not finalized.'
            : 'Inspection finished. Start the report and capture final narratives.',
        href: `/reports/completed/${inspection.id}`,
        actionLabel: active || reportStatus === 'draft' ? 'Continue report' : 'Start report',
        tone: active ? 'green' as const : 'amber' as const,
      }
    })

  const deliver = input.inspections
    .filter(inspection => {
      const reportStatus = reportStatusByInspectionId.get(inspection.id) ?? null
      const invoice = invoiceByInspectionId.get(inspection.id) ?? null
      if (reportStatus !== 'finalized') return false
      if (inspection.report_locked) return false
      if (invoice && invoice.status === 'paid') return true
      return !invoice
    })
    .sort((a, b) => `${b.scheduled_date} ${b.scheduled_time}`.localeCompare(`${a.scheduled_date} ${a.scheduled_time}`))
    .map(inspection => ({
      id: inspection.id,
      title: formatInspectionAddress(inspection),
      subtitle: `${formatClientName(inspection.client)} · report finalized`,
      note: 'Report is ready for release. Generate the PDF and hand it off to the client and agent.',
      href: `/reports/completed/${inspection.id}`,
      actionLabel: 'Release report',
      tone: 'green' as const,
    }))

  const collect = input.invoices
    .filter(invoice => invoice.status === 'pending' || invoice.status === 'overdue')
    .sort((a, b) => {
      if (a.status === b.status) return 0
      return a.status === 'overdue' ? -1 : 1
    })
    .map(invoice => ({
      id: invoice.id,
      title: invoice.inspection?.address ?? `Invoice ${invoice.id.slice(0, 8).toUpperCase()}`,
      subtitle: `${formatClientName(invoice.client)} · ${formatMoney(invoice.total_amount)} due`,
      note: invoice.status === 'overdue'
        ? 'Invoice is overdue. Follow up or mark as paid.'
        : 'Payment is still open. Send the invoice or capture offline payment.',
      href: `/invoices/${invoice.id}`,
      actionLabel: invoice.status === 'overdue' ? 'Resolve overdue' : 'Collect payment',
      tone: invoice.status === 'overdue' ? 'red' as const : 'amber' as const,
    }))

  return { lead, schedule, prep, inspect, deliver, collect }
}
