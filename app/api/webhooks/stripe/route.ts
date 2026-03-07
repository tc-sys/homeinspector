import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceRoleClient } from '@/lib/supabase-server'
import type Stripe from 'stripe'
import { toISODateLocal } from '@/lib/utils'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    const supabase = await createServiceRoleClient()

    const { data: alreadyProcessed } = await supabase
      .from('stripe_webhook_events')
      .select('id')
      .eq('id', event.id)
      .single()
    if (alreadyProcessed) {
      return NextResponse.json({ received: true, duplicate: true })
    }

    await supabase.from('stripe_webhook_events').insert({
      id: event.id,
      type: event.type,
    })

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const invoiceId = session.metadata?.invoice_id

      if (invoiceId) {
        // Mark invoice as paid
        const { data: invoice } = await supabase
          .from('invoices')
          .update({
            status: 'paid',
            paid_date: toISODateLocal(),
            stripe_payment_intent_id: session.payment_intent as string,
            updated_at: new Date().toISOString(),
          })
          .eq('id', invoiceId)
          .select()
          .single()

        // Unlock report
        if (invoice?.inspection_id) {
          await supabase
            .from('inspections')
            .update({ report_locked: false, updated_at: new Date().toISOString() })
            .eq('id', invoice.inspection_id)
        }

        // Record payment (idempotent by payment intent)
        if (session.payment_intent) {
          const { data: paymentExists } = await supabase
            .from('payments')
            .select('id')
            .eq('stripe_payment_intent_id', session.payment_intent as string)
            .single()
          if (!paymentExists) {
            await supabase.from('payments').insert({
              invoice_id: invoiceId,
              amount: session.amount_total ?? 0,
              status: 'completed',
              stripe_payment_intent_id: session.payment_intent as string,
              payment_method: 'card',
            })
          }
        }
      }
    }
  } catch (error) {
    console.error('Stripe webhook processing failed', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
