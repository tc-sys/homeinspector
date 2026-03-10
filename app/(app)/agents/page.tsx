import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getInitials } from '@/lib/utils'
import { Plus, Phone, Mail, Building, Star } from 'lucide-react'
import Link from 'next/link'
import type { Agent } from '@/types'
import { isDemoMode, DEMO_AGENTS } from '@/lib/demo'

export const dynamic = 'force-dynamic'

export default async function AgentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams

  let agents: Agent[] = []

  if (isDemoMode()) {
    const q = params.q?.toLowerCase()
    agents = q
      ? DEMO_AGENTS.filter(a =>
          `${a.first_name} ${a.last_name} ${a.brokerage}`.toLowerCase().includes(q)
        )
      : DEMO_AGENTS
  } else {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    let query = supabase
      .from('agents')
      .select('*')
      .eq('user_id', user!.id)
      .order('referral_count', { ascending: false })
    if (params.q) {
      query = query.or(`first_name.ilike.%${params.q}%,last_name.ilike.%${params.q}%,brokerage.ilike.%${params.q}%`)
    }
    const { data } = await query
    agents = (data ?? []) as Agent[]
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
          <p className="text-gray-500 mt-1">{agents.length} real estate agent partners</p>
        </div>
        <Button asChild>
          <Link href="/agents/new">
            <Plus className="h-4 w-4 mr-2" />
            New Agent
          </Link>
        </Button>
      </div>

      <form className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <input
            name="q"
            defaultValue={params.q ?? ''}
            placeholder="Search agents..."
            className="pl-4 pr-4 py-2 w-full border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button type="submit" variant="outline">Search</Button>
      </form>

      {!agents.length ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-gray-400 mb-4">No agents yet. Add your real estate agent partners.</p>
            <Button asChild>
              <Link href="/agents/new">Add First Agent</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {agents.map(agent => (
            <Link key={agent.id} href={`/agents/${agent.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="py-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {getInitials(agent.first_name, agent.last_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{agent.first_name} {agent.last_name}</p>
                    <div className="flex items-center gap-4 mt-1">
                      {agent.brokerage && (
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                          <Building className="h-3.5 w-3.5" />
                          {agent.brokerage}
                        </span>
                      )}
                      {agent.email && (
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                          <Mail className="h-3.5 w-3.5" />
                          {agent.email}
                        </span>
                      )}
                      {agent.phone && (
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                          <Phone className="h-3.5 w-3.5" />
                          {agent.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex items-center gap-1 text-sm font-medium text-amber-600">
                      <Star className="h-4 w-4" />
                      {agent.referral_count} referral{agent.referral_count !== 1 ? 's' : ''}
                    </div>
                    {agent.tags?.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
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
