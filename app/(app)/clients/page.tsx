import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getInitials, formatDate } from '@/lib/utils'
import { Plus, Phone, Mail, Search } from 'lucide-react'
import Link from 'next/link'
import type { Client } from '@/types'
import { isDemoMode, DEMO_CLIENTS } from '@/lib/demo'

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
    return <ClientsUI clients={clients} q={params.q} />
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

  const { data: clients } = await query

  return <ClientsUI clients={(clients ?? []) as Client[]} q={params.q} />
}

function ClientsUI({ clients, q }: { clients: Client[]; q?: string }) {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 mt-1">{clients.length} total clients</p>
        </div>
        <Button asChild>
          <Link href="/clients/new">
            <Plus className="h-4 w-4 mr-2" />
            New Client
          </Link>
        </Button>
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
