import Stripe from 'stripe'
import { getAppUrl } from '@/lib/app-url'

export function getStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(key, {
    apiVersion: '2026-02-25.clover',
    typescript: true,
  })
}

export async function createPaymentLink(
  amount: number,
  description: string,
  clientEmail: string,
  invoiceId: string,
  passCardFee: boolean
): Promise<string> {
  const appUrl = getAppUrl()
  const stripe = getStripeClient()

  // Card fee is typically 2.9% + 30 cents
  const cardFeeAmount = passCardFee
    ? Math.round(amount * 0.029 + 30)
    : 0
  const totalAmount = amount + cardFeeAmount

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: clientEmail,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: description,
          },
          unit_amount: totalAmount,
        },
        quantity: 1,
      },
    ],
    metadata: {
      invoice_id: invoiceId,
    },
    success_url: `${appUrl}/invoices?paid=true`,
    cancel_url: `${appUrl}/invoices`,
  })

  return session.url!
}
