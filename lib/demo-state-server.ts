import { cookies } from 'next/headers'
import {
  DEMO_CLIENT_OVERRIDES_COOKIE,
  DEMO_INSPECTION_OVERRIDES_COOKIE,
  DEMO_INVOICE_OVERRIDES_COOKIE,
  getDemoOverrideBundleFromValues,
  getMergedDemoData,
} from '@/lib/demo-state'

export async function getServerDemoData() {
  const cookieStore = await cookies()
  return getMergedDemoData(getDemoOverrideBundleFromValues({
    [DEMO_CLIENT_OVERRIDES_COOKIE]: cookieStore.get(DEMO_CLIENT_OVERRIDES_COOKIE)?.value,
    [DEMO_INSPECTION_OVERRIDES_COOKIE]: cookieStore.get(DEMO_INSPECTION_OVERRIDES_COOKIE)?.value,
    [DEMO_INVOICE_OVERRIDES_COOKIE]: cookieStore.get(DEMO_INVOICE_OVERRIDES_COOKIE)?.value,
  }))
}
