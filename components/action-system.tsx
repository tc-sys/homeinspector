import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ActionStageItem } from '@/lib/action-system'

function toneClass(tone: ActionStageItem['tone']) {
  switch (tone) {
    case 'green':
      return 'border-[#bfd3c6] bg-[#eef5f0]'
    case 'amber':
      return 'border-[#e1c895] bg-[#fbf1dc]'
    case 'red':
      return 'border-[#e4c0bb] bg-[#fbefed]'
    default:
      return 'border-[#ddd3c0] bg-[#fffdf8]'
  }
}

export function StageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-[#cfc5af] bg-[linear-gradient(130deg,#fffdf8_0%,#f3ecde_55%,#efe6d7_100%)] px-6 py-5">
      <p className="text-xs uppercase tracking-[0.18em] text-[#627066]">{eyebrow}</p>
      <h1 className="mt-2 text-4xl text-[#1e2f27]">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-[#5b665f]">{description}</p>
    </div>
  )
}

export function StageCounts({
  counts,
}: {
  counts: Array<{ label: string; value: number; tone?: ActionStageItem['tone'] }>
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
      {counts.map(count => (
        <div key={count.label} className={`rounded-2xl border px-4 py-4 ${toneClass(count.tone)}`}>
          <div className="text-xs uppercase tracking-[0.16em] text-[#6d766f]">{count.label}</div>
          <div className="mt-2 text-2xl font-semibold text-[#1f2f27]">{count.value}</div>
        </div>
      ))}
    </div>
  )
}

export function ActionQueueCard({
  title,
  description,
  emptyLabel,
  items,
}: {
  title: string
  description: string
  emptyLabel: string
  items: ActionStageItem[]
}) {
  return (
    <Card className="glass-card border-[#d8cfbd]">
      <CardHeader>
        <CardTitle className="text-[#1f2f27]">{title}</CardTitle>
        <p className="text-sm text-[#647067]">{description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {!items.length ? (
          <div className="rounded-2xl border border-dashed border-[#d8cfbd] px-4 py-8 text-center text-sm text-[#7a847d]">
            {emptyLabel}
          </div>
        ) : (
          items.map(item => (
            <Link
              key={item.id}
              href={item.href}
              className={`block rounded-2xl border px-4 py-4 transition hover:-translate-y-0.5 hover:shadow-sm ${toneClass(item.tone)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[#24362d]">{item.title}</div>
                  <div className="mt-1 text-xs text-[#6d766f]">{item.subtitle}</div>
                  <div className="mt-3 text-sm text-[#4d5a53]">{item.note}</div>
                </div>
                <div className="inline-flex items-center gap-1 rounded-full border border-[#cdbfa5] bg-white/80 px-2.5 py-1 text-xs font-medium text-[#2d4137]">
                  {item.actionLabel}
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  )
}

