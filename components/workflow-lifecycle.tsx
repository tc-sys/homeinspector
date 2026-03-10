'use client'

import Link from 'next/link'
import { ArrowRight, AlertTriangle, CheckCircle2, CircleDashed, Clock3 } from 'lucide-react'
import type { InspectionReport, Invoice, Inspection } from '@/types'
import { getWorkflowSummary } from '@/lib/workflow'

function stageTone(status: ReturnType<typeof getWorkflowSummary>['stages'][number]['status']) {
  switch (status) {
    case 'complete':
      return 'border-[#b7d2c0] bg-[#edf5ef] text-[#2d5d48]'
    case 'current':
      return 'border-[#e1c895] bg-[#fbf1dc] text-[#8a5c16]'
    case 'blocked':
      return 'border-[#e4c0bb] bg-[#fbefed] text-[#8b3a2f]'
    default:
      return 'border-[#ddd3c0] bg-[#fffdf8] text-[#6e766f]'
  }
}

function stageIcon(status: ReturnType<typeof getWorkflowSummary>['stages'][number]['status']) {
  switch (status) {
    case 'complete':
      return <CheckCircle2 className="h-4 w-4" />
    case 'current':
      return <Clock3 className="h-4 w-4" />
    case 'blocked':
      return <AlertTriangle className="h-4 w-4" />
    default:
      return <CircleDashed className="h-4 w-4" />
  }
}

export function WorkflowLifecycle({
  inspection,
  invoice,
  reportStatus,
  compact = false,
}: {
  inspection: Inspection
  invoice?: Invoice | null
  reportStatus?: InspectionReport['status'] | null
  compact?: boolean
}) {
  const summary = getWorkflowSummary({ inspection, invoice, reportStatus })

  return (
    <div className={`rounded-3xl border border-[#d8cfbd] bg-[#fffaf1] ${compact ? 'p-4' : 'p-5'} space-y-4`}>
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-[#7a847d]">Business Workflow</div>
          <div className="mt-1 text-lg font-semibold text-[#23352c]">{summary.currentStage.label}</div>
          <p className="mt-1 text-sm text-[#5d695f]">{summary.currentStage.description}</p>
        </div>
        {summary.nextAction && (
          <Link
            href={summary.nextAction.href}
            className="inline-flex items-center gap-2 rounded-2xl border border-[#bcae90] bg-white px-3 py-2 text-sm font-medium text-[#2c4036] hover:bg-[#f6efe2]"
          >
            {summary.nextAction.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className={`grid gap-3 ${compact ? 'sm:grid-cols-5' : 'md:grid-cols-5'}`}>
        {summary.stages.map(stage => (
          <div key={stage.id} className={`rounded-2xl border px-3 py-3 ${stageTone(stage.status)}`}>
            <div className="flex items-center gap-2 text-sm font-semibold">
              {stageIcon(stage.status)}
              <span>{stage.label}</span>
            </div>
            <div className="mt-1 text-xs opacity-80">{stage.description}</div>
          </div>
        ))}
      </div>

      {summary.nextAction && (
        <div className="rounded-2xl border border-[#e3d7c4] bg-white/80 px-4 py-3 text-sm text-[#39483f]">
          <span className="font-semibold">Next step:</span> {summary.nextAction.description}
        </div>
      )}
    </div>
  )
}

