import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createPaymentLink } from '@/lib/stripe'
import { sendInvoiceEmail } from '@/lib/resend'
import { z } from 'zod'

const payloadSchema = z.object({
  invoiceId: z.string().uuid(),
  passCardFee: z.boolean().optional(),
})

export async function POST(request: Request) {
  const parsed = payloadSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }
  const { invoiceId, passCardFee } = parsed.data

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, client:clients(*), inspection:inspections(address, city, state), user:user_profiles(*)')
    .eq('id', invoiceId)
    .eq('user_id', user.id)
    .single()

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  }

  if (!invoice.client?.email) {
    return NextResponse.json({ error: 'Client has no email' }, { status: 400 })
  }

  const address = invoice.inspection
    ? `${invoice.inspection.address}, ${invoice.inspection.city}, ${invoice.inspection.state}`
    : 'Home Inspection'

  // Create Stripe payment link
  const paymentLink = await createPaymentLink(
    invoice.total_amount,
    `Home Inspection — ${address}`,
    invoice.client.email,
    invoiceId,
    passCardFee ?? invoice.pass_card_fee
  )

  // Update invoice with payment link and passCardFee setting
  await supabase.from('invoices').update({
    stripe_payment_link: paymentLink,
    pass_card_fee: passCardFee ?? invoice.pass_card_fee,
    updated_at: new Date().toISOString(),
  }).eq('id', invoiceId)

  // Send email
  await sendInvoiceEmail(
    invoice.client.email,
    `${invoice.client.first_name} ${invoice.client.last_name}`,
    invoice.total_amount,
    address,
    paymentLink,
    invoice.user?.full_name ?? 'Your Inspector'
  )

  return NextResponse.json({ ok: true, paymentLink })
}
