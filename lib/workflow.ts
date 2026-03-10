import type { Inspection, InspectionReport, Invoice } from '@/types'

export type WorkflowStageStatus = 'complete' | 'current' | 'pending' | 'blocked'

export interface WorkflowStage {
  id: 'intake' | 'scope' | 'fieldwork' | 'report' | 'handoff'
  label: string
  description: string
  status: WorkflowStageStatus
}

export interface WorkflowNextAction {
  label: string
  href: string
  description: string
}

export interface WorkflowSummary {
  stages: WorkflowStage[]
  currentStage: WorkflowStage
  nextAction: WorkflowNextAction | null
}

export interface WorkflowSnapshot {
  intake: number
  scope: number
  fieldwork: number
  report: number
  handoff: number
  blocked: number
}

function buildStageStatus(
  inspection: Inspection,
  invoice: Invoice | null,
  reportStatus: InspectionReport['status'] | null
): WorkflowStage[] {
  if (inspection.status === 'cancelled') {
    return [
      { id: 'intake', label: 'Intake', description: 'Client and property record captured.', status: 'complete' },
      { id: 'scope', label: 'Scoping', description: 'Service package and report type assigned.', status: 'blocked' },
      { id: 'fieldwork', label: 'Fieldwork', description: 'Inspector completes the on-site visit.', status: 'blocked' },
      { id: 'report', label: 'Reporting', description: 'Findings are reviewed and finalized.', status: 'blocked' },
      { id: 'handoff', label: 'Handoff', description: 'Client receives report and payment is reconciled.', status: 'blocked' },
    ]
  }

  const intakeComplete = Boolean(inspection.client_id)
  const scopeComplete = Boolean(inspection.service_id && inspection.template_id)
  const fieldworkComplete = inspection.status === 'completed'
  const fieldworkCurrent = inspection.status === 'in_progress'
  const reportComplete = reportStatus === 'finalized'
  const reportCurrent = reportStatus === 'draft' || (fieldworkComplete && !inspection.report_locked)
  const handoffComplete = invoice?.status === 'paid'
  const handoffBlocked = invoice?.status === 'overdue' || (inspection.report_locked && inspection.status === 'completed')
  const handoffCurrent = Boolean(invoice) && !handoffComplete

  return [
    {
      id: 'intake',
      label: 'Intake',
      description: 'Client and property record captured.',
      status: intakeComplete ? 'complete' : 'current',
    },
    {
      id: 'scope',
      label: 'Scoping',
      description: 'Service package and report type assigned.',
      status: !intakeComplete ? 'pending' : scopeComplete ? 'complete' : 'current',
    },
    {
      id: 'fieldwork',
      label: 'Fieldwork',
      description: 'Inspector completes the on-site visit.',
      status: !scopeComplete ? 'pending' : fieldworkComplete ? 'complete' : fieldworkCurrent ? 'current' : 'pending',
    },
    {
      id: 'report',
      label: 'Reporting',
      description: 'Findings are reviewed and finalized.',
      status: !fieldworkComplete ? 'pending' : reportComplete ? 'complete' : reportCurrent ? 'current' : 'pending',
    },
    {
      id: 'handoff',
      label: 'Handoff',
      description: 'Client receives report and payment is reconciled.',
      status: !reportComplete ? 'pending' : handoffComplete ? 'complete' : handoffBlocked ? 'blocked' : handoffCurrent ? 'current' : 'pending',
    },
  ]
}

export function getWorkflowSummary(input: {
  inspection: Inspection
  invoice?: Invoice | null
  reportStatus?: InspectionReport['status'] | null
}): WorkflowSummary {
  const invoice = input.invoice ?? null
  const reportStatus = input.reportStatus ?? null
  const stages = buildStageStatus(input.inspection, invoice, reportStatus)

  const currentStage =
    stages.find(stage => stage.status === 'blocked') ??
    stages.find(stage => stage.status === 'current') ??
    stages[stages.length - 1]

  let nextAction: WorkflowNextAction | null = null

  if (input.inspection.status === 'cancelled') {
    nextAction = null
  } else if (!input.inspection.client_id) {
    nextAction = {
      label: 'Add client details',
      href: `/inspections/${input.inspection.id}/edit`,
      description: 'Complete the client record so reminders, billing, and report delivery have a recipient.',
    }
  } else if (!input.inspection.template_id || !input.inspection.service_id) {
    nextAction = {
      label: 'Finish job setup',
      href: `/inspections/${input.inspection.id}/edit`,
      description: 'Assign the service package and report template before the team goes on site.',
    }
  } else if (input.inspection.status === 'scheduled') {
    nextAction = {
      label: 'Review prep and arrive on site',
      href: `/inspections/${input.inspection.id}`,
      description: 'Use the inspection detail page to confirm schedule, contacts, and pre-visit notes.',
    }
  } else if (input.inspection.status === 'in_progress') {
    nextAction = {
      label: 'Continue field report',
      href: `/reports/completed/${input.inspection.id}`,
      description: 'Capture findings, dictation, and photos while the inspection is active.',
    }
  } else if (!reportStatus || reportStatus === 'draft') {
    nextAction = {
      label: reportStatus === 'draft' ? 'Finalize report' : 'Start report',
      href: `/reports/completed/${input.inspection.id}`,
      description: 'Complete the inspection report so the office can release results and collect payment.',
    }
  } else if (invoice?.status === 'overdue') {
    nextAction = {
      label: 'Resolve overdue invoice',
      href: `/invoices/${invoice.id}`,
      description: 'Payment is holding up the handoff. Follow up from the invoice screen.',
    }
  } else if (invoice && invoice.status !== 'paid') {
    nextAction = {
      label: 'Collect payment and release',
      href: `/invoices/${invoice.id}`,
      description: 'Use the invoice record to send payment, mark cash/check, or close out the job.',
    }
  }

  return {
    stages,
    currentStage,
    nextAction,
  }
}

export function getWorkflowSnapshot(input: {
  inspections: Inspection[]
  invoicesByInspectionId: Map<string, Invoice | null>
  reportStatusByInspectionId: Map<string, InspectionReport['status'] | null>
}): WorkflowSnapshot {
  return input.inspections.reduce<WorkflowSnapshot>((acc, inspection) => {
    const summary = getWorkflowSummary({
      inspection,
      invoice: input.invoicesByInspectionId.get(inspection.id) ?? null,
      reportStatus: input.reportStatusByInspectionId.get(inspection.id) ?? null,
    })

    if (summary.currentStage.status === 'blocked') {
      acc.blocked += 1
    }

    acc[summary.currentStage.id] += 1
    return acc
  }, {
    intake: 0,
    scope: 0,
    fieldwork: 0,
    report: 0,
    handoff: 0,
    blocked: 0,
  })
}

