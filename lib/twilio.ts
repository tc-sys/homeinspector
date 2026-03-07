import twilio from 'twilio'

function getClient() {
  return twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  )
}

export async function sendSMS(to: string, body: string) {
  await getClient().messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER!,
    to,
  })
}

export async function sendInspectionConfirmationSMS(
  phone: string,
  clientName: string,
  inspectionDate: string,
  inspectionTime: string,
  address: string
) {
  const body = `Hi ${clientName}! Your inspection at ${address} is confirmed for ${inspectionDate} at ${inspectionTime}. Reply STOP to unsubscribe.`
  await sendSMS(phone, body)
}

export async function sendInspectionReminderSMS(
  phone: string,
  clientName: string,
  inspectionTime: string,
  address: string
) {
  const body = `Reminder: Your home inspection at ${address} is tomorrow at ${inspectionTime}. See you then! Reply STOP to unsubscribe.`
  await sendSMS(phone, body)
}
