import type {
  Client,
  Agent,
  Service,
  Inspection,
  Invoice,
  ContactLog,
  ReportTemplate,
  InspectionReport,
  DemoActivityEvent,
  DemoFirmProfile,
  DemoScenario,
  DemoSource,
  DemoRuntimeConfig,
} from '@/types'

function dateOnly(date: Date): string {
  return date.toISOString().split('T')[0]
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
}

export function isDemoMode(): boolean {
  const envDemo = process.env.NEXT_PUBLIC_DEMO_MODE
  if (envDemo === 'false') return false
  if (envDemo === 'true') return true
  return true
}

export function getDemoSource(): DemoSource {
  return process.env.DEMO_SOURCE === 'db' ? 'db' : 'builtin'
}

export function getDemoScenario(): DemoScenario {
  return process.env.DEMO_SCENARIO === 'phl_large_firm_90d'
    ? 'phl_large_firm_90d'
    : 'phl_large_firm_90d'
}

export function getDemoRuntimeConfig(): DemoRuntimeConfig {
  return {
    mode: isDemoMode(),
    source: getDemoSource(),
    scenario: getDemoScenario(),
  }
}

export const DEMO_USER_ID = 'demo-user-00000000'
export const DEMO_FIRM_PROFILE: DemoFirmProfile = {
  id: 'firm-1',
  name: 'Keystone Premier Home Contracting Group',
  region: 'Philadelphia Metro',
  active_since: dateOnly(daysAgo(90)),
  team_size: 42,
  monthly_inspection_target: 120,
}

const PHILLY_STREETS = [
  'Walnut St', 'Chestnut St', 'Spruce St', 'Pine St', 'South St', 'Market St', 'Frankford Ave',
  'Passyunk Ave', 'Ridge Ave', 'Girard Ave', 'Washington Ave', 'Locust St', 'Tasker St', 'Mifflin St',
  'Lombard St', 'Poplar St', 'Master St', 'Morris St', 'Cedar Ave', 'Lansdowne Ave',
]

const PHILLY_AREAS = [
  { city: 'Philadelphia', state: 'PA', zip: '19103' },
  { city: 'Philadelphia', state: 'PA', zip: '19147' },
  { city: 'Philadelphia', state: 'PA', zip: '19146' },
  { city: 'Philadelphia', state: 'PA', zip: '19125' },
  { city: 'Ardmore', state: 'PA', zip: '19003' },
  { city: 'Bryn Mawr', state: 'PA', zip: '19010' },
  { city: 'Villanova', state: 'PA', zip: '19085' },
  { city: 'Radnor', state: 'PA', zip: '19087' },
  { city: 'Conshohocken', state: 'PA', zip: '19428' },
  { city: 'King of Prussia', state: 'PA', zip: '19406' },
  { city: 'Doylestown', state: 'PA', zip: '18901' },
  { city: 'Jenkintown', state: 'PA', zip: '19046' },
  { city: 'Media', state: 'PA', zip: '19063' },
  { city: 'Havertown', state: 'PA', zip: '19083' },
  { city: 'West Chester', state: 'PA', zip: '19380' },
]

const FIRST_NAMES = [
  'Olivia', 'Noah', 'Liam', 'Emma', 'Sophia', 'Mason', 'Ava', 'Ethan', 'Mia', 'Lucas', 'Harper',
  'Amelia', 'Elijah', 'James', 'Charlotte', 'Benjamin', 'Evelyn', 'Daniel', 'Logan', 'Scarlett',
]

const LAST_NAMES = [
  'Anderson', 'Bennett', 'Carter', 'Diaz', 'Ellis', 'Foster', 'Garcia', 'Hughes', 'Irving', 'Johnson',
  'Keller', 'Lawson', 'Mitchell', 'Nguyen', 'Owens', 'Parker', 'Quinn', 'Roberts', 'Stevens', 'Turner',
]

function fullName(index: number): { first: string; last: string } {
  return {
    first: FIRST_NAMES[index % FIRST_NAMES.length],
    last: LAST_NAMES[Math.floor(index / 2) % LAST_NAMES.length],
  }
}

export const DEMO_SERVICES: Service[] = [
  { id: 'service-1', user_id: DEMO_USER_ID, name: 'Residential Full Inspection', description: 'Comprehensive home inspection', base_price: 42500, duration_minutes: 180, active: true, created_at: dateOnly(daysAgo(90)) },
  { id: 'service-2', user_id: DEMO_USER_ID, name: 'Townhome/Condo Inspection', description: 'Attached unit inspection', base_price: 35500, duration_minutes: 150, active: true, created_at: dateOnly(daysAgo(88)) },
  { id: 'service-3', user_id: DEMO_USER_ID, name: 'Pre-Listing Inspection', description: 'Seller prep inspection', base_price: 39000, duration_minutes: 165, active: true, created_at: dateOnly(daysAgo(87)) },
  { id: 'service-4', user_id: DEMO_USER_ID, name: 'New Construction Phase Inspection', description: 'Frame to final walkthrough', base_price: 46500, duration_minutes: 210, active: true, created_at: dateOnly(daysAgo(80)) },
  { id: 'service-5', user_id: DEMO_USER_ID, name: '11-Month Warranty Inspection', description: 'Builder warranty review', base_price: 34500, duration_minutes: 150, active: true, created_at: dateOnly(daysAgo(79)) },
  { id: 'service-6', user_id: DEMO_USER_ID, name: 'Radon Test Add-on', description: '48-hour monitored test', base_price: 17500, duration_minutes: 45, active: true, created_at: dateOnly(daysAgo(75)) },
  { id: 'service-7', user_id: DEMO_USER_ID, name: 'Sewer Scope Add-on', description: 'Lateral line camera inspection', base_price: 22500, duration_minutes: 60, active: true, created_at: dateOnly(daysAgo(73)) },
  { id: 'service-8', user_id: DEMO_USER_ID, name: 'Mold Screening', description: 'Visual + sample set', base_price: 28500, duration_minutes: 75, active: true, created_at: dateOnly(daysAgo(72)) },
  { id: 'service-9', user_id: DEMO_USER_ID, name: 'Termite/WDI Inspection', description: 'Wood-destroying insect report', base_price: 15500, duration_minutes: 45, active: true, created_at: dateOnly(daysAgo(71)) },
  { id: 'service-10', user_id: DEMO_USER_ID, name: 'Luxury Estate Inspection', description: 'Large estate multi-system inspection', base_price: 69500, duration_minutes: 300, active: true, created_at: dateOnly(daysAgo(70)) },
]

export const DEMO_CLIENTS: Client[] = Array.from({ length: 165 }, (_, i) => {
  const name = fullName(i)
  const area = PHILLY_AREAS[i % PHILLY_AREAS.length]
  const street = PHILLY_STREETS[i % PHILLY_STREETS.length]
  const houseNum = 100 + (i * 7 % 8900)
  return {
    id: `client-${i + 1}`,
    user_id: DEMO_USER_ID,
    first_name: name.first,
    last_name: name.last,
    email: `${name.first.toLowerCase()}.${name.last.toLowerCase()}${i}@example.com`,
    phone: `(267) ${`${100 + (i % 800)}`.padStart(3, '0')}-${`${1000 + ((i * 11) % 9000)}`.padStart(4, '0')}`,
    address: `${houseNum} ${street}, ${area.city}, ${area.state} ${area.zip}`,
    notes: i % 3 === 0 ? 'Repeat buyer; prefers PDF + SMS updates.' : null,
    tags: i % 5 === 0 ? ['VIP', 'Referral'] : i % 3 === 0 ? ['Investor'] : ['Buyer'],
    created_at: daysAgo(89 - (i % 80)).toISOString(),
    updated_at: daysAgo((i % 25)).toISOString(),
  }
})

export const DEMO_AGENTS: Agent[] = Array.from({ length: 28 }, (_, i) => {
  const name = fullName(i + 40)
  const brokerage = ['Compass', 'BHHS Fox & Roach', 'Keller Williams', 'RE/MAX', 'Coldwell Banker'][i % 5]
  return {
    id: `agent-${i + 1}`,
    user_id: DEMO_USER_ID,
    first_name: name.first,
    last_name: name.last,
    email: `${name.first.toLowerCase()}.${name.last.toLowerCase()}@${brokerage.toLowerCase().replace(/\s+/g, '')}.com`,
    phone: `(215) ${`${200 + (i % 700)}`.padStart(3, '0')}-${`${1000 + ((i * 13) % 9000)}`.padStart(4, '0')}`,
    brokerage,
    notes: i % 4 === 0 ? 'Top Main Line referral source.' : null,
    tags: i % 4 === 0 ? ['Top Referrer', 'VIP Partner'] : ['Agent Partner'],
    referral_count: 12 + (i * 3 % 37),
    created_at: daysAgo(85 - i).toISOString(),
    updated_at: daysAgo(i % 20).toISOString(),
  }
})

function inspectionStatus(dayOffset: number, i: number): Inspection['status'] {
  if (dayOffset <= 2) return i % 5 === 0 ? 'cancelled' : 'scheduled'
  if (dayOffset <= 8) return i % 6 === 0 ? 'in_progress' : 'scheduled'
  if (dayOffset <= 70) return i % 14 === 0 ? 'cancelled' : 'completed'
  return i % 10 === 0 ? 'cancelled' : 'completed'
}

const INSPECTION_TYPES = [
  'General Home Inspection',
  'Buyer Inspection',
  'Pre-Listing Inspection',
  'New Construction Inspection',
  '11-Month Warranty Inspection',
  'Luxury Estate Inspection',
]

export const DEMO_INSPECTIONS: Inspection[] = Array.from({ length: 96 }, (_, i) => {
  const dayOffset = 90 - Math.floor((i / 96) * 90)
  const date = daysAgo(dayOffset)
  const area = PHILLY_AREAS[i % PHILLY_AREAS.length]
  const street = PHILLY_STREETS[(i * 3) % PHILLY_STREETS.length]
  const service = DEMO_SERVICES[i % DEMO_SERVICES.length]
  const status = inspectionStatus(dayOffset, i)
  const client = DEMO_CLIENTS[i % DEMO_CLIENTS.length]
  const agent = DEMO_AGENTS[i % DEMO_AGENTS.length]
  const scheduledHour = [8, 9, 10, 12, 13, 14, 15][i % 7]
  const scheduledMinute = [0, 30][i % 2]
  const sqft = 1200 + (i * 145 % 4200)
  const basePrice = service.base_price + (sqft > 3500 ? 17500 : sqft > 2500 ? 6500 : 0)

  return {
    id: `inspection-${i + 1}`,
    user_id: DEMO_USER_ID,
    client_id: client.id,
    agent_id: agent.id,
    service_id: service.id,
    template_id: `template-${(i % 4) + 1}`,
    address: `${220 + (i * 19 % 9100)} ${street}`,
    city: area.city,
    state: area.state,
    zip: area.zip,
    scheduled_date: dateOnly(date),
    scheduled_time: `${`${scheduledHour}`.padStart(2, '0')}:${`${scheduledMinute}`.padStart(2, '0')}`,
    duration_minutes: service.duration_minutes,
    status,
    inspection_type: INSPECTION_TYPES[i % INSPECTION_TYPES.length],
    notes: i % 4 === 0 ? 'Occupied property. Supra access via listing agent.' : i % 3 === 0 ? 'Tenant occupied. 24hr notice required.' : null,
    square_footage: sqft,
    year_built: 1920 + (i * 3 % 103),
    price: basePrice,
    report_locked: status !== 'completed' || i % 5 === 0,
    cover_photo_url: i % 3 === 0 ? `https://picsum.photos/seed/phl-home-${i}/1400/900` : null,
    created_at: daysAgo(dayOffset + 7).toISOString(),
    updated_at: daysAgo(Math.max(dayOffset - 1, 0)).toISOString(),
    client,
    agent,
  }
})

export const DEMO_INVOICES: Invoice[] = DEMO_INSPECTIONS.map((inspection, i) => {
  const dayOffset = 90 - Math.floor((i / 96) * 90)
  const isOld = dayOffset > 20
  const paid = inspection.status === 'completed' && (isOld ? i % 6 !== 0 : i % 3 === 0)
  const overdue = !paid && inspection.status === 'completed' && i % 7 === 0
  const status: Invoice['status'] = paid ? 'paid' : overdue ? 'overdue' : 'pending'
  const total = inspection.price
  const paidDate = paid ? dateOnly(daysAgo(Math.max(dayOffset - (2 + (i % 5)), 0))) : null
  return {
    id: `invoice-${i + 1}`,
    user_id: DEMO_USER_ID,
    inspection_id: inspection.id,
    client_id: inspection.client_id,
    amount: total,
    tax_amount: 0,
    total_amount: total,
    status,
    due_date: dateOnly(daysAgo(Math.max(dayOffset - 10, 0))),
    paid_date: paidDate,
    stripe_payment_intent_id: paid ? `pi_demo_${i + 1000}` : null,
    stripe_payment_link: null,
    pass_card_fee: i % 4 === 0,
    notes: overdue ? 'Second reminder sent; payment expected this week.' : null,
    created_at: daysAgo(dayOffset + 3).toISOString(),
    updated_at: daysAgo(Math.max(dayOffset - 1, 0)).toISOString(),
    client: inspection.client,
    inspection,
  }
})

function buildItems(prefix: string, names: string[]): ReportTemplate['sections'][number]['items'] {
  return names.map((name, idx) => ({
    id: `${prefix}-${idx + 1}`,
    name,
    condition: null,
    recommendation: null,
    comment: null,
    photo_urls: [],
  }))
}

export const DEMO_REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'template-1',
    user_id: DEMO_USER_ID,
    name: 'Residential Full Inspection Template',
    description: 'Standard company template for buyer and seller inspections.',
    created_at: daysAgo(88).toISOString(),
    updated_at: daysAgo(2).toISOString(),
    sections: [
      { id: 'roof', name: 'Roof', items: buildItems('roof', ['Shingles', 'Flashings', 'Gutters', 'Chimney', 'Attic Ventilation']) },
      { id: 'exterior', name: 'Exterior', items: buildItems('ext', ['Siding', 'Trim', 'Windows', 'Doors', 'Deck/Porch', 'Drainage']) },
      { id: 'structure', name: 'Structure', items: buildItems('str', ['Foundation', 'Framing', 'Basement Moisture', 'Floor Joists']) },
      { id: 'systems', name: 'Major Systems', items: buildItems('sys', ['Electrical Panel', 'HVAC', 'Plumbing Supply', 'Water Heater', 'Sump Pump']) },
      { id: 'interior', name: 'Interior', items: buildItems('int', ['Kitchen', 'Bathrooms', 'Walls/Ceilings', 'Floors', 'Stairs/Railings']) },
    ],
  },
  {
    id: 'template-2',
    user_id: DEMO_USER_ID,
    name: 'Luxury Estate Inspection Template',
    description: 'Expanded inspection template for high-value and large properties.',
    created_at: daysAgo(70).toISOString(),
    updated_at: daysAgo(5).toISOString(),
    sections: [
      { id: 'estate-exterior', name: 'Estate Exterior', items: buildItems('estate-ext', ['Masonry', 'Copper Roof', 'Pool Equipment', 'Irrigation', 'Retaining Walls']) },
      { id: 'estate-interior', name: 'Estate Interior', items: buildItems('estate-int', ['Imported Flooring', 'Smart Home Hub', 'Wine Cellar', 'Home Theater', 'Sauna/Steam']) },
      { id: 'estate-mechanical', name: 'Mechanical Systems', items: buildItems('estate-mech', ['Boiler Plant', 'Air Handlers', 'Generator', 'Backup Power Transfer', 'Water Treatment']) },
    ],
  },
  {
    id: 'template-3',
    user_id: DEMO_USER_ID,
    name: 'Townhome/Condo Template',
    description: 'Fast-turn template optimized for urban attached units.',
    created_at: daysAgo(65).toISOString(),
    updated_at: daysAgo(4).toISOString(),
    sections: [
      { id: 'condo-outer', name: 'Common + Exterior Interfaces', items: buildItems('condo-out', ['Balcony', 'Common Hallway Door', 'Window Seals', 'Drain Connections']) },
      { id: 'condo-inner', name: 'Interior Unit', items: buildItems('condo-in', ['Kitchen Appliances', 'Bathroom Venting', 'Electrical Safety', 'HVAC Closet']) },
    ],
  },
  {
    id: 'template-4',
    user_id: DEMO_USER_ID,
    name: '11-Month Warranty Template',
    description: 'Builder warranty punch-list style inspection report.',
    created_at: daysAgo(50).toISOString(),
    updated_at: daysAgo(1).toISOString(),
    sections: [
      { id: 'warranty-structure', name: 'Structure + Envelope', items: buildItems('war-struct', ['Settlement Cracks', 'Roof/Flashing', 'Siding Fit', 'Window Operation']) },
      { id: 'warranty-systems', name: 'Systems + Finishes', items: buildItems('war-sys', ['HVAC Performance', 'Plumbing Fixtures', 'Electrical Trim-out', 'Interior Finish Defects']) },
    ],
  },
]

export const DEMO_CONTACT_LOGS: ContactLog[] = Array.from({ length: 260 }, (_, i) => ({
  id: `log-${i + 1}`,
  user_id: DEMO_USER_ID,
  client_id: DEMO_CLIENTS[i % DEMO_CLIENTS.length].id,
  agent_id: DEMO_AGENTS[i % DEMO_AGENTS.length].id,
  type: (['call', 'email', 'sms', 'meeting', 'note'][i % 5] as ContactLog['type']),
  notes: [
    'Confirmed inspection window and lockbox access details.',
    'Sent pre-inspection prep checklist and utility activation reminder.',
    'Discussed major findings and contractor follow-up priorities.',
    'Agent requested expedited report delivery for settlement deadline.',
    'Client asked for add-on radon and sewer scope scheduling.',
  ][i % 5],
  created_at: daysAgo(i % 88).toISOString(),
}))

export const DEMO_ACTIVITY_EVENTS: DemoActivityEvent[] = Array.from({ length: 24 }, (_, i) => {
  const inspection = DEMO_INSPECTIONS[i]
  const invoice = DEMO_INVOICES[i]
  const types: DemoActivityEvent['type'][] = ['inspection_booked', 'report_saved', 'invoice_paid', 'inspection_completed', 'client_added', 'agent_followup']
  const type = types[i % types.length]
  const descriptionMap: Record<DemoActivityEvent['type'], string> = {
    inspection_booked: `Inspection booked at ${inspection.address}, ${inspection.city}.`,
    report_saved: `Final report saved for ${inspection.address}.`,
    invoice_paid: `Invoice ${invoice.id.toUpperCase()} paid by ${inspection.client?.first_name} ${inspection.client?.last_name}.`,
    inspection_completed: `Inspection completed: ${inspection.address}.`,
    client_added: `New client profile added: ${inspection.client?.first_name} ${inspection.client?.last_name}.`,
    agent_followup: `Referral follow-up logged with ${inspection.agent?.first_name} ${inspection.agent?.last_name}.`,
  }
  return {
    id: `evt-${i + 1}`,
    type,
    description: descriptionMap[type],
    created_at: daysAgo(i % 12).toISOString(),
  }
})

function hydrateReportAnswers(template: ReportTemplate, seed: number): ReportTemplate['sections'] {
  const conditionCycle = ['good', 'fair', 'good', 'poor', 'not_inspected'] as const
  const recommendationCycle = ['none', 'monitor', 'repair', 'replace', 'none'] as const
  return template.sections.map((section, sectionIdx) => ({
    ...section,
    items: section.items.map((item, itemIdx) => {
      const offset = seed + sectionIdx + itemIdx
      const condition = conditionCycle[offset % conditionCycle.length]
      const recommendation = recommendationCycle[offset % recommendationCycle.length]
      return {
        ...item,
        condition,
        recommendation,
        comment: condition === 'poor'
          ? `${item.name} requires licensed contractor repair before closing.`
          : `${item.name} inspected and documented for current condition.`,
        photo_urls: [`https://picsum.photos/seed/inspection-report-${seed}-${sectionIdx}-${itemIdx}/1200/800`],
      }
    }),
  }))
}

export const DEMO_INSPECTION_REPORTS: InspectionReport[] = DEMO_INSPECTIONS
  .filter(inspection => inspection.status === 'completed' || inspection.status === 'in_progress')
  .slice(0, 72)
  .map((inspection, idx) => {
    const template = DEMO_REPORT_TEMPLATES.find(t => t.id === inspection.template_id) ?? DEMO_REPORT_TEMPLATES[0]
    return {
      id: `inspection-report-${idx + 1}`,
      inspection_id: inspection.id,
      template_id: template.id,
      status: inspection.status === 'completed' ? 'finalized' : 'draft',
      answers: hydrateReportAnswers(template, idx + 1),
      created_at: inspection.created_at,
      updated_at: inspection.updated_at,
      finalized_at: inspection.status === 'completed' ? inspection.updated_at : null,
      inspection,
      template,
    }
  })
