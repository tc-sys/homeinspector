import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { isDemoMode, DEMO_REPORT_TEMPLATES } from '@/lib/demo'

export const dynamic = 'force-dynamic'

const DEFAULT_SECTIONS = [
  {
    id: 'sec-exterior',
    name: 'Exterior',
    items: [
      { id: 'item-roof', name: 'Roof Covering', condition: null, comment: null, recommendation: null, photo_urls: [] },
      { id: 'item-siding', name: 'Siding', condition: null, comment: null, recommendation: null, photo_urls: [] },
    ],
  },
  {
    id: 'sec-interior',
    name: 'Interior',
    items: [
      { id: 'item-walls', name: 'Walls & Ceilings', condition: null, comment: null, recommendation: null, photo_urls: [] },
      { id: 'item-floors', name: 'Floors', condition: null, comment: null, recommendation: null, photo_urls: [] },
    ],
  },
]

export default async function NewReportTemplatePage() {
  if (isDemoMode()) {
    redirect(`/reports/${DEMO_REPORT_TEMPLATES[0]?.id}`)
  }

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data } = await supabase
    .from('report_templates')
    .insert({
      user_id: user!.id,
      name: 'New Template',
      description: null,
      sections: DEFAULT_SECTIONS,
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (!data?.id) {
    redirect('/reports')
  }
  redirect(`/reports/${data.id}`)
}
