import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendInspectionConfirmation(
  clientEmail: string,
  clientName: string,
  inspectionDate: string,
  inspectionTime: string,
  address: string,
  inspectorName: string,
  inspectorPhone: string,
  manageUrl?: string
) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: clientEmail,
    subject: `Inspection Confirmed — ${address}`,
    html: `
      <h2>Your Inspection is Confirmed</h2>
      <p>Hi ${clientName},</p>
      <p>Your home inspection has been scheduled. Here are the details:</p>
      <ul>
        <li><strong>Date:</strong> ${inspectionDate}</li>
        <li><strong>Time:</strong> ${inspectionTime}</li>
        <li><strong>Address:</strong> ${address}</li>
        <li><strong>Inspector:</strong> ${inspectorName}</li>
        <li><strong>Inspector Phone:</strong> ${inspectorPhone}</li>
      </ul>
      ${manageUrl ? `<p><a href="${manageUrl}">Reschedule or cancel this booking</a></p>` : ''}
      <p>Please don't hesitate to reach out if you have any questions.</p>
      <p>— ${inspectorName}</p>
    `,
  })
}

export async function sendInspectionReminder(
  clientEmail: string,
  clientName: string,
  inspectionDate: string,
  inspectionTime: string,
  address: string,
  inspectorName: string,
  manageUrl?: string
) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: clientEmail,
    subject: `Reminder: Inspection Tomorrow — ${address}`,
    html: `
      <h2>Inspection Reminder</h2>
      <p>Hi ${clientName},</p>
      <p>This is a reminder that your home inspection is scheduled for <strong>tomorrow</strong>.</p>
      <ul>
        <li><strong>Date:</strong> ${inspectionDate}</li>
        <li><strong>Time:</strong> ${inspectionTime}</li>
        <li><strong>Address:</strong> ${address}</li>
      </ul>
      ${manageUrl ? `<p><a href="${manageUrl}">Need to reschedule? Manage your booking here.</a></p>` : ''}
      <p>See you then!</p>
      <p>— ${inspectorName}</p>
    `,
  })
}

export async function sendInvoiceEmail(
  clientEmail: string,
  clientName: string,
  amount: number,
  address: string,
  paymentLink: string,
  inspectorName: string
) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: clientEmail,
    subject: `Invoice — ${address}`,
    html: `
      <h2>Invoice for Home Inspection</h2>
      <p>Hi ${clientName},</p>
      <p>Thank you for choosing ${inspectorName} for your home inspection at ${address}.</p>
      <p><strong>Amount Due: $${(amount / 100).toFixed(2)}</strong></p>
      <p><a href="${paymentLink}" style="background:#0070f3;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">Pay Now</a></p>
      <p>Please complete payment to receive your full inspection report.</p>
      <p>— ${inspectorName}</p>
    `,
  })
}
