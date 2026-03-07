import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { sendInspectionConfirmation, sendInspectionReminder } from '@/lib/resend'
import { sendInspectionConfirmationSMS, sendInspectionReminderSMS } from '@/lib/twilio'
import { formatDate, formatTime } from '@/lib/utils'
import { z } from 'zod'
import { getAppUrl } from '@/lib/app-url'

const payloadSchema = z.object({
  type: z.enum(['inspection_confirmation', 'inspection_reminder']),
  inspectionId: z.string().uuid(),
})

export async function POST(request: Request) {
  const parsed = payloadSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }
  const { type, inspectionId } = parsed.data

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: inspection } = await supabase
    .from('inspections')
    .select('*, client:clients(*), user:user_profiles(*)')
    .eq('id', inspectionId)
    .eq('user_id', user.id)
    .single()

  if (!inspection) {
    return NextResponse.json({ error: 'Inspection not found' }, { status: 404 })
  }

  const client = inspection.client
  const inspector = inspection.user

  if (!client) {
    return NextResponse.json({ error: 'No client attached' }, { status: 400 })
  }

  const formattedDate = formatDate(inspection.scheduled_date)
  const formattedTime = formatTime(inspection.scheduled_time)
  const address = `${inspection.address}, ${inspection.city}, ${inspection.state}`
  const inspectorName = inspector?.full_name ?? 'Your Inspector'
  const inspectorPhone = inspector?.phone ?? ''
  const appUrl = getAppUrl()
  const manageUrl = inspection.client_portal_token
    ? `${appUrl}/booking/manage/${inspection.client_portal_token}`
    : undefined

  if (type === 'inspection_confirmation') {
    if (client.email) {
      await sendInspectionConfirmation(
        client.email,
        `${client.first_name} ${client.last_name}`,
        formattedDate,
        formattedTime,
        address,
        inspectorName,
        inspectorPhone,
        manageUrl
      )
    }
    if (client.phone) {
      await sendInspectionConfirmationSMS(
        client.phone,
        client.first_name,
        formattedDate,
        formattedTime,
        address
      )
    }
  }

  if (type === 'inspection_reminder') {
    if (client.email) {
      await sendInspectionReminder(
        client.email,
        `${client.first_name} ${client.last_name}`,
        formattedDate,
        formattedTime,
        address,
        inspectorName,
        manageUrl
      )
    }
    if (client.phone) {
      await sendInspectionReminderSMS(
        client.phone,
        client.first_name,
        formattedTime,
        address
      )
    }
  }

  return NextResponse.json({ ok: true })
}
