export type InspectionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'cancelled'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  company_name: string | null
  phone: string | null
  logo_url: string | null
  booking_slug: string | null
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  address: string | null
  notes: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

export interface Agent {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  brokerage: string | null
  notes: string | null
  tags: string[]
  referral_count: number
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  user_id: string
  name: string
  description: string | null
  base_price: number
  duration_minutes: number
  active: boolean
  created_at: string
}

export interface Inspection {
  id: string
  user_id: string
  client_id: string | null
  agent_id: string | null
  service_id: string | null
  address: string
  city: string
  state: string
  zip: string
  scheduled_date: string
  scheduled_time: string
  duration_minutes: number
  status: InspectionStatus
  inspection_type: string
  notes: string | null
  square_footage: number | null
  year_built: number | null
  price: number
  report_locked: boolean
  client_portal_token?: string | null
  created_at: string
  updated_at: string
  client?: Client
  agent?: Agent
  service?: Service
  invoice?: Invoice
}

export interface Invoice {
  id: string
  user_id: string
  inspection_id: string
  client_id: string | null
  amount: number
  tax_amount: number
  total_amount: number
  status: InvoiceStatus
  due_date: string | null
  paid_date: string | null
  stripe_payment_intent_id: string | null
  stripe_payment_link: string | null
  pass_card_fee: boolean
  notes: string | null
  created_at: string
  updated_at: string
  client?: Client
  inspection?: Inspection
}

export interface Payment {
  id: string
  invoice_id: string
  amount: number
  status: PaymentStatus
  stripe_payment_intent_id: string
  payment_method: string | null
  created_at: string
}

export interface CalendarEvent {
  id: string
  user_id: string
  inspection_id: string | null
  title: string
  start_time: string
  end_time: string
  is_available: boolean
  notes: string | null
  created_at: string
}

export interface ContactLog {
  id: string
  user_id: string
  client_id: string | null
  agent_id: string | null
  type: 'call' | 'email' | 'sms' | 'meeting' | 'note'
  notes: string
  created_at: string
}

export interface DashboardStats {
  upcomingInspections: Inspection[]
  revenueThisMonth: number
  revenueLastMonth: number
  completedThisMonth: number
  pendingInvoices: number
  recentActivity: ActivityItem[]
}

export interface ActivityItem {
  id: string
  type: 'inspection_booked' | 'invoice_paid' | 'client_added' | 'agent_added'
  description: string
  created_at: string
}

export type ItemCondition = 'good' | 'fair' | 'poor' | 'not_inspected'
export type ItemRecommendation = 'none' | 'monitor' | 'repair' | 'replace' | 'safety_hazard'

export interface ReportItem {
  id: string
  name: string
  condition: ItemCondition | null
  comment: string | null
  recommendation: ItemRecommendation | null
  photo_urls: string[]
}

export interface ReportSection {
  id: string
  name: string
  items: ReportItem[]
}

export interface ReportTemplate {
  id: string
  user_id: string
  name: string
  description: string | null
  sections: ReportSection[]
  created_at: string
  updated_at: string
}

export interface PublicBookingProfile {
  id: string
  company_name: string | null
  full_name: string
  phone: string | null
  booking_slug: string
}
