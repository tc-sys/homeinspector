import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, statusColor } from '@/lib/utils'
import { ArrowLeft, Mail, Phone, Building, Star, Plus } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Agent, Inspection } from '@/types'
import { isDemoMode, DEMO_AGENTS, DEMO_INSPECTIONS } from '@/lib/demo'

export const dynamic = 'force-dynamic'

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let agent: Agent | null = null
  let inspections: Inspection[] = []

  if (isDemoMode()) {
    agent = DEMO_AGENTS.find(a => a.id === id) ?? null
    if (!agent) notFound()
    inspections = DEMO_INSPECTIONS.filter(i => i.agent_id === id)
  } else {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    const [{ data: a }, { data: i }] = await Promise.all([
      supabase.from('agents').select('*').eq('id', id).eq('user_id', user!.id).single(),
      supabase.from('inspections').select('*, client:clients(first_name, last_name)').eq('agent_id', id).order('scheduled_date', { ascending: false }),
    ])
    if (!a) notFound()
    agent = a as Agent
    inspections = (i ?? []) as Inspection[]
  }

  const totalRevenue = inspections.reduce((sum, i) => sum + i.price, 0)

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/agents">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Agents
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={`/agents/${id}/edit`}>Edit Agent</Link>
        </Button>
      </div>

      <div className="flex items-start gap-4">
        <div className="h-16 w-16 rounded-full bg-purple-600 flex items-center justify-center text-white text-xl font-bold">
          {agent.first_name[0]}{agent.last_name[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{agent.first_name} {agent.last_name}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {agent.brokerage && (
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <Building className="h-4 w-4" /> {agent.brokerage}
              </span>
            )}
            {agent.email && (
              <a href={`mailto:${agent.email}`} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600">
                <Mail className="h-4 w-4" /> {agent.email}
              </a>
            )}
            {agent.phone && (
              <a href={`tel:${agent.phone}`} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600">
                <Phone className="h-4 w-4" /> {agent.phone}
              </a>
            )}
          </div>
          {agent.tags?.length > 0 && (
            <div className="flex gap-2 mt-2">
              {agent.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="flex items-center justify-center gap-1 text-amber-600 mb-1">
              <Star className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{agent.referral_count}</p>
            <p className="text-sm text-gray-500">Total Referrals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{inspections.length}</p>
            <p className="text-sm text-gray-500">Inspections</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
            <p className="text-sm text-gray-500">Revenue Generated</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Referred Inspections</CardTitle>
          <Button asChild size="sm">
            <Link href={`/inspections/new?agent=${id}`}>
              <Plus className="h-4 w-4 mr-2" />
              New Inspection
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {!inspections.length ? (
            <p className="text-gray-400 text-sm">No inspections from this agent yet.</p>
          ) : (
            <div className="space-y-3">
              {inspections.map(inspection => (
                <Link key={inspection.id} href={`/inspections/${inspection.id}`}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{inspection.address}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(inspection.scheduled_date)}
                        {inspection.client && ` · ${inspection.client.first_name} ${inspection.client.last_name}`}
                      </p>
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

      {agent.notes && (
        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">{agent.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
