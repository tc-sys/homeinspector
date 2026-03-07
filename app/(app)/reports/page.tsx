import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { FileText, ChevronRight, PlusCircle } from 'lucide-react'
import { isDemoMode, DEMO_REPORT_TEMPLATES } from '@/lib/demo'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { ReportTemplate } from '@/types'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  let templates: ReportTemplate[] = []

  if (isDemoMode()) {
    templates = DEMO_REPORT_TEMPLATES
  } else {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('report_templates')
      .select('*')
      .eq('user_id', user!.id)
      .order('updated_at', { ascending: false })
    templates = (data ?? []) as ReportTemplate[]
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report Templates</h1>
          <p className="text-gray-500 mt-1">Build and manage your inspection report templates</p>
        </div>
        <Link href="/reports/new" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          <PlusCircle className="h-4 w-4" />
          New Template
        </Link>
      </div>

      {!templates.length ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No report templates yet</p>
            <p className="text-gray-400 text-sm mt-1">Create a template to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {templates.map(template => {
            const totalItems = template.sections.reduce((sum, s) => sum + s.items.length, 0)
            return (
              <Link key={template.id} href={`/reports/${template.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="py-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{template.name}</p>
                      {template.description && (
                        <p className="text-sm text-gray-500 truncate">{template.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge className="bg-gray-100 text-gray-600 border-0">
                        {template.sections.length} sections · {totalItems} items
                      </Badge>
                      <span className="text-xs text-gray-400">{formatDate(template.updated_at)}</span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
