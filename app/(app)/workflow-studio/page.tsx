import {
  ArrowRight,
  Calendar,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  FileText,
  Home,
  MapPinned,
  MessageSquare,
  Mic,
  Phone,
  Search,
  ShieldAlert,
  UserRound,
  Users,
  Wallet,
} from 'lucide-react'

const workflows = [
  {
    id: 'lead-intake',
    eyebrow: '01',
    title: 'Lead Intake',
    summary: 'Capture inbound demand, qualify it quickly, and move it to a quote or booked inspection without losing referral context.',
    outcome: 'Faster conversion from website lead or agent call into scheduled job.',
    desktop: <LeadIntakeDesktop />,
    mobile: <LeadIntakeMobile />,
  },
  {
    id: 'scheduling',
    eyebrow: '02',
    title: 'Scheduling',
    summary: 'Dispatch inspections with calendar awareness, route context, inspector assignment, and add-on pricing in one flow.',
    outcome: 'Lower scheduling friction and fewer travel or overlap errors.',
    desktop: <SchedulingDesktop />,
    mobile: <SchedulingMobile />,
  },
  {
    id: 'pre-inspection',
    eyebrow: '03',
    title: 'Pre-Inspection Intake',
    summary: 'Collect agreements, access information, reminders, and readiness checks before the inspector arrives on site.',
    outcome: 'Fewer day-of surprises and better client preparation.',
    desktop: <PreInspectionDesktop />,
    mobile: <PreInspectionMobile />,
  },
  {
    id: 'on-site',
    eyebrow: '04',
    title: 'On-Site Inspection',
    summary: 'Give inspectors a field-first report runner with section progress, quick phrases, dictation, and photo capture.',
    outcome: 'Faster field completion and higher-quality observations.',
    desktop: <OnSiteDesktop />,
    mobile: <OnSiteMobile />,
  },
  {
    id: 'report-qa',
    eyebrow: '05',
    title: 'Report Writing and QA',
    summary: 'Review findings, catch missing narratives or photos, and finalize with confidence before release.',
    outcome: 'Cleaner reports with less manual double-checking.',
    desktop: <ReportQADesktop />,
    mobile: <ReportQAMobile />,
  },
  {
    id: 'delivery',
    eyebrow: '06',
    title: 'Report Delivery',
    summary: 'Control release timing, portal access, notifications, and buyer or agent visibility from a single delivery view.',
    outcome: 'A more professional handoff and fewer support questions.',
    desktop: <DeliveryDesktop />,
    mobile: <DeliveryMobile />,
  },
  {
    id: 'payments',
    eyebrow: '07',
    title: 'Payment Collection',
    summary: 'Track invoice status, automate reminders, and make payment actions visible to both office staff and clients.',
    outcome: 'Less revenue leakage and fewer overdue balances.',
    desktop: <PaymentsDesktop />,
    mobile: <PaymentsMobile />,
  },
  {
    id: 'agent-follow-up',
    eyebrow: '08',
    title: 'Agent Follow-Up',
    summary: 'Tie inspections to referral partners, follow-up actions, and repair-request style collaboration after delivery.',
    outcome: 'Stronger agent retention and better post-report communication.',
    desktop: <AgentFollowUpDesktop />,
    mobile: <AgentFollowUpMobile />,
  },
  {
    id: 'client-portal',
    eyebrow: '09',
    title: 'Client Portal',
    summary: 'Expose the full customer journey in one place: job status, report, invoice, support, and appointment actions.',
    outcome: 'A more complete self-service experience after booking.',
    desktop: <PortalDesktop />,
    mobile: <PortalMobile />,
  },
  {
    id: 'operations',
    eyebrow: '10',
    title: 'Business Operations',
    summary: 'Run the company with workload, revenue, QA, referral performance, and exception visibility from one dashboard.',
    outcome: 'Owner-level visibility beyond individual inspections.',
    desktop: <OperationsDesktop />,
    mobile: <OperationsMobile />,
  },
]

export default function WorkflowStudioPage() {
  return (
    <div className="p-4 md:p-8 space-y-8">
      <section className="rounded-[2rem] border border-[#cfc5af] bg-[radial-gradient(circle_at_top_left,rgba(208,138,45,0.16),transparent_34%),linear-gradient(135deg,#fffdf8_0%,#f3ebdd_58%,#efe4d2_100%)] px-5 py-6 md:px-8 md:py-8">
        <div className="max-w-4xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#e9dfcd] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#516056]">
            <MapPinned className="h-3.5 w-3.5" />
            Workflow Studio
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl md:text-6xl leading-none text-[#1f3028]">Specthub Workflow Blueprint</h1>
            <p className="max-w-3xl text-sm md:text-lg text-[#5d695f]">
              These are polished product mockups for the full home inspector operating cycle, built from the workflow model and ready to guide implementation.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <StatCard label="Workflows" value="10" subcopy="Lead to post-inspection operations" />
            <StatCard label="Primary Roles" value="5" subcopy="Inspector, admin, owner, agent, client" />
            <StatCard label="Design Focus" value="Field-First" subcopy="Desktop command + iPhone execution" />
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-5">
        {workflows.map(workflow => (
          <a
            key={workflow.id}
            href={`#${workflow.id}`}
            className="rounded-2xl border border-[#d8cfbd] bg-[#fffaf1]/80 px-4 py-3 text-sm text-[#314239] transition hover:-translate-y-0.5 hover:border-[#bcae90] hover:bg-[#fffdf8]"
          >
            <div className="text-[11px] uppercase tracking-[0.18em] text-[#7a847d]">{workflow.eyebrow}</div>
            <div className="mt-1 font-semibold">{workflow.title}</div>
          </a>
        ))}
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-[0.18em] text-[#78837b]">System View</div>
            <h2 className="text-3xl md:text-4xl text-[#203128]">How The Workflows Tie Together</h2>
            <p className="max-w-3xl text-sm md:text-base text-[#5d695f]">
              Specthub should feel like one operating system for the business. Every workflow below hands context forward so the next step starts informed, faster, and easier to trust.
            </p>
          </div>
          <div className="rounded-2xl border border-[#d8cfbd] bg-[#fffaf1] px-4 py-3 text-sm text-[#39483f] md:max-w-md">
            <div className="text-[11px] uppercase tracking-[0.18em] text-[#7a847d]">Design Principle</div>
            <div className="mt-1 font-medium">One job record, many role-specific views, zero duplicate re-entry.</div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <OperatingSystemDesktop />
          <OperatingSystemMobile />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <JourneyCard
            title="Forward Context"
            description="Lead source, property, client, template, service package, and notes should move automatically from intake into scheduling, prep, inspection, report, and invoice."
          />
          <JourneyCard
            title="Role-Specific Clarity"
            description="The same job should look different to the owner, scheduler, inspector, agent, and client, while all of them work from the same underlying record."
          />
          <JourneyCard
            title="Business Visibility"
            description="Every workflow should update owner-level insight: conversion, utilization, overdue risk, report latency, referral performance, and support load."
          />
        </div>
      </section>

      <div className="space-y-12">
        {workflows.map(workflow => (
          <section key={workflow.id} id={workflow.id} className="space-y-5 scroll-mt-24">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-[0.18em] text-[#78837b]">{workflow.eyebrow}</div>
                <h2 className="text-3xl md:text-4xl text-[#203128]">{workflow.title}</h2>
                <p className="max-w-3xl text-sm md:text-base text-[#5d695f]">{workflow.summary}</p>
              </div>
              <div className="rounded-2xl border border-[#d8cfbd] bg-[#fffaf1] px-4 py-3 text-sm text-[#39483f] md:max-w-sm">
                <div className="text-[11px] uppercase tracking-[0.18em] text-[#7a847d]">Outcome</div>
                <div className="mt-1 font-medium">{workflow.outcome}</div>
              </div>
            </div>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              {workflow.desktop}
              {workflow.mobile}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

function OperatingSystemDesktop() {
  return (
    <MockWindow title="Specthub Operating System" sidebar={<MockSidebar items={['Jobs', 'People', 'Money', 'Visibility']} />}>
      <div className="space-y-4">
        <SectionTitle
          icon={<MapPinned className="h-5 w-5" />}
          title="Single Job Lifecycle"
          subtitle="Each stage feeds the next and updates the business automatically."
        />
        <div className="grid gap-3 md:grid-cols-5">
          <LifecycleNode label="Lead" sub="source, property, urgency" tone="amber" />
          <LifecycleNode label="Schedule" sub="time, inspector, services" tone="green" />
          <LifecycleNode label="Prep" sub="agreement, access, reminders" tone="neutral" />
          <LifecycleNode label="Inspect" sub="findings, photos, notes" tone="green" />
          <LifecycleNode label="Deliver + Collect" sub="report, portal, payment" tone="amber" />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-[#dfd3bf] bg-white/75 p-4 space-y-3">
            <div className="text-sm font-semibold text-[#25362d]">Shared Job Record</div>
            <div className="grid gap-3 md:grid-cols-2">
              <InfoCard label="Core Record" value="1420 Spruce St" sub="Client, agent, lead source, property facts" />
              <InfoCard label="Execution" value="Assigned to Avery" sub="Calendar, route, template, service package" />
              <InfoCard label="Inspection Data" value="42 findings / 27 photos" sub="Field notes, severity, narratives" />
              <InfoCard label="Commercial Outcome" value="$525 pending" sub="Invoice, payment link, delivery status" />
            </div>
            <div className="rounded-2xl bg-[#f6efe2] p-4 text-sm text-[#5d695f]">
              End-user benefit: nobody has to rebuild the job from scratch at each stage. The office books it once, the inspector executes it, the client consumes it, and the owner measures it.
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-3xl border border-[#dfd3bf] bg-white/75 p-4 space-y-2">
              <div className="text-sm font-semibold text-[#25362d]">Role Handoffs</div>
              <RoleRow role="Admin" handoff="Creates job, collects prep data, confirms schedule" />
              <RoleRow role="Inspector" handoff="Captures findings, photos, and field narratives" />
              <RoleRow role="Owner" handoff="Sees utilization, overdue, QA, and referral performance" />
              <RoleRow role="Client" handoff="Books, pays, views report, asks follow-up questions" />
            </div>
            <div className="rounded-3xl border border-[#dfd3bf] bg-white/75 p-4 space-y-2">
              <div className="text-sm font-semibold text-[#25362d]">Business Surfaces Updated Automatically</div>
              <LineItem title="Lead conversion dashboard" meta="updated from intake and booking actions" />
              <LineItem title="Inspector utilization" meta="updated from schedule and duration changes" />
              <LineItem title="Revenue + overdue" meta="updated from invoices and payments" />
              <LineItem title="Referral leaderboard" meta="updated from agent-linked jobs" />
            </div>
          </div>
        </div>
      </div>
    </MockWindow>
  )
}

function OperatingSystemMobile() {
  return (
    <MockPhone title="How It Connects">
      <div className="space-y-4">
        <div className="rounded-3xl border border-[#dfd3bf] bg-white/80 p-4 space-y-3">
          <div className="text-sm font-semibold text-[#25362d]">Job Lifecycle</div>
          <div className="space-y-2">
            <MobileLifecycleRow label="Lead" meta="captured from web or referral" />
            <MobileLifecycleRow label="Scheduled" meta="inspector + services assigned" />
            <MobileLifecycleRow label="Prepared" meta="agreement + access confirmed" />
            <MobileLifecycleRow label="Inspected" meta="photos + findings saved" />
            <MobileLifecycleRow label="Delivered" meta="report + invoice in portal" />
          </div>
        </div>

        <div className="rounded-3xl border border-[#dfd3bf] bg-white/80 p-4 space-y-3">
          <div className="text-sm font-semibold text-[#25362d]">Why It Feels Easy</div>
          <InfoRow icon={<CheckCircle2 className="h-4 w-4" />} label="One job record across every screen" />
          <InfoRow icon={<Users className="h-4 w-4" />} label="Each role sees only what matters to them" />
          <InfoRow icon={<Wallet className="h-4 w-4" />} label="Office and owner views update automatically" />
        </div>

        <div className="rounded-3xl border border-[#dfd3bf] bg-white/80 p-4 space-y-2">
          <PhoneCard title="Admin" meta="Books and confirms" badge="Ops" />
          <PhoneCard title="Inspector" meta="Completes field report" badge="Field" />
          <PhoneCard title="Client" meta="Pays and views report" badge="Portal" />
        </div>
      </div>
    </MockPhone>
  )
}

function StatCard({
  label,
  value,
  subcopy,
}: {
  label: string
  value: string
  subcopy: string
}) {
  return (
    <div className="rounded-2xl border border-[#d8cfbd] bg-[#fffaf1]/85 p-4">
      <div className="text-xs uppercase tracking-[0.16em] text-[#7a847d]">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-[#1f3028]">{value}</div>
      <div className="mt-1 text-sm text-[#657066]">{subcopy}</div>
    </div>
  )
}

function JourneyCard({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-3xl border border-[#d8cfbd] bg-[#fffaf1]/85 p-5">
      <div className="text-base font-semibold text-[#1f3028]">{title}</div>
      <div className="mt-2 text-sm text-[#647067]">{description}</div>
    </div>
  )
}

function MockWindow({
  title,
  sidebar,
  children,
}: {
  title: string
  sidebar?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-[#cdbfa5] bg-[#faf6ee] shadow-[0_24px_60px_rgba(28,39,31,0.08)]">
      <div className="flex items-center justify-between border-b border-[#ddd3c0] bg-[#f4ecdf] px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#d59161]" />
          <span className="h-3 w-3 rounded-full bg-[#d8b046]" />
          <span className="h-3 w-3 rounded-full bg-[#85aa7c]" />
        </div>
        <div className="text-sm font-medium text-[#304139]">{title}</div>
        <div className="w-12" />
      </div>
      <div className={`grid ${sidebar ? 'lg:grid-cols-[220px_minmax(0,1fr)]' : ''} min-h-[520px]`}>
        {sidebar && <div className="border-r border-[#ddd3c0] bg-[#1f3a2f] p-4 text-[#f2ebdf]">{sidebar}</div>}
        <div className="bg-[linear-gradient(180deg,#fffdf8_0%,#f8f3ea_100%)] p-4 md:p-5">{children}</div>
      </div>
    </div>
  )
}

function MockPhone({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto w-full max-w-[360px] rounded-[34px] border border-[#cbbca0] bg-[#1f1f1f] p-2 shadow-[0_24px_60px_rgba(28,39,31,0.14)]">
      <div className="rounded-[28px] bg-[#fffdf8] overflow-hidden">
        <div className="flex justify-center py-2">
          <div className="h-1.5 w-24 rounded-full bg-[#d5cec0]" />
        </div>
        <div className="border-b border-[#e6dbc7] px-4 py-3">
          <div className="text-sm font-semibold text-[#23352c]">{title}</div>
        </div>
        <div className="min-h-[560px] bg-[linear-gradient(180deg,#fffdf8_0%,#f6efe2_100%)] p-4">{children}</div>
      </div>
    </div>
  )
}

function MockSidebar({ items }: { items: string[] }) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-[#294c3e] px-3 py-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-[#d8cfbd]">Specthub</div>
        <div className="mt-1 text-lg font-semibold">Workflow</div>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={item}
            className={`rounded-xl border px-3 py-2 text-sm ${
              index === 0
                ? 'border-[#e8b96a] bg-[#d08a2d] text-[#1e2b24]'
                : 'border-transparent bg-[#294c3e] text-[#ecdfcf]'
            }`}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}

function SectionTitle({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-2xl bg-[#ebdfcd] p-3 text-[#29473a]">{icon}</div>
      <div>
        <div className="text-lg font-semibold text-[#22342b]">{title}</div>
        <div className="text-sm text-[#69746c]">{subtitle}</div>
      </div>
    </div>
  )
}

function Pill({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'green' | 'amber' | 'red' }) {
  const toneClass = {
    neutral: 'bg-[#ede5d8] text-[#49564e]',
    green: 'bg-[#ddebdc] text-[#35624c]',
    amber: 'bg-[#f3e2c8] text-[#956320]',
    red: 'bg-[#f2d9d2] text-[#9b4a36]',
  }[tone]
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${toneClass}`}>{children}</span>
}

function LineItem({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#e5dac6] bg-white/80 px-3 py-2">
      <div>
        <div className="text-sm font-medium text-[#273830]">{title}</div>
        {meta && <div className="text-xs text-[#7a847d]">{meta}</div>}
      </div>
      <ArrowRight className="h-4 w-4 text-[#97a29a]" />
    </div>
  )
}

function MiniBar({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-[#e5dac6] bg-white/70 p-3">
      <div className="text-xl font-semibold text-[#22342b]">{value}</div>
      <div className="text-xs uppercase tracking-[0.12em] text-[#7a847d]">{label}</div>
    </div>
  )
}

function LeadIntakeDesktop() {
  return (
    <MockWindow title="Lead Intake Workspace" sidebar={<MockSidebar items={['Leads', 'Quoted', 'Booked', 'Referral Sources']} />}>
      <div className="space-y-4">
        <SectionTitle icon={<Users className="h-5 w-5" />} title="Inbound Opportunity Desk" subtitle="Qualify, quote, and convert new demand." />
        <div className="grid gap-4 md:grid-cols-4">
          <MiniBar value="24" label="New Leads" />
          <MiniBar value="11" label="Quoted" />
          <MiniBar value="7" label="Awaiting Reply" />
          <MiniBar value="19" label="Booked" />
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.05fr_1fr]">
          <div className="space-y-3 rounded-3xl border border-[#dfd3bf] bg-white/75 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-[#24362d]">Lead Queue</div>
              <div className="flex items-center gap-2 rounded-full border border-[#ddd2bf] bg-[#fbf8f1] px-3 py-1 text-xs text-[#6f7972]">
                <Search className="h-3.5 w-3.5" />
                Search address or phone
              </div>
            </div>
            <LineItem title="John Carter" meta="1420 Spruce St · New today · Compass referral" />
            <LineItem title="Dana Ellis" meta="19 Valley Rd · Quote sent yesterday" />
            <LineItem title="Mason Hughes" meta="Rittenhouse condo · Radon add-on requested" />
            <LineItem title="Harper Parker" meta="Repeat client · Buyer inspection" />
          </div>
          <div className="space-y-3 rounded-3xl border border-[#dfd3bf] bg-white/75 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-[#24362d]">Selected Lead</div>
              <Pill tone="green">Ready to Quote</Pill>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <InfoCard label="Contact" value="john@example.com" sub="(267) 555-1142" />
              <InfoCard label="Property" value="1420 Spruce St" sub="2,450 sq ft · 19103" />
              <InfoCard label="Services" value="General + Radon" sub="$625 estimated" />
              <InfoCard label="Referral" value="Compass / Dana Ellis" sub="High-value partner" />
            </div>
            <div className="rounded-2xl bg-[#f6efe2] p-3 text-sm text-[#5e695f]">
              Timeline: lead captured, callback logged, quote draft ready, await booking hold.
            </div>
            <div className="flex flex-wrap gap-2">
              <ActionButton>Call Lead</ActionButton>
              <ActionButton tone="accent">Create Quote</ActionButton>
              <ActionButton tone="dark">Convert to Booking</ActionButton>
            </div>
          </div>
        </div>
      </div>
    </MockWindow>
  )
}

function LeadIntakeMobile() {
  return (
    <MockPhone title="Leads">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <SmallChip>New 24</SmallChip>
          <SmallChip>Quoted 11</SmallChip>
          <SmallChip>Booked 19</SmallChip>
        </div>
        <div className="space-y-2">
          <PhoneCard title="John Carter" meta="1420 Spruce St · New" badge="Compass" />
          <PhoneCard title="Dana Ellis" meta="19 Valley Rd · Quoted" badge="Follow up" />
          <PhoneCard title="Mason Hughes" meta="Rittenhouse condo · Add-ons" badge="Hot lead" />
        </div>
        <div className="rounded-3xl border border-[#dfd3bf] bg-white/80 p-4 space-y-3">
          <div className="text-sm font-semibold text-[#25362d]">Lead Detail</div>
          <InfoRow icon={<Phone className="h-4 w-4" />} label="(267) 555-1142" />
          <InfoRow icon={<Home className="h-4 w-4" />} label="1420 Spruce St, Philadelphia" />
          <InfoRow icon={<Users className="h-4 w-4" />} label="Compass / Dana Ellis" />
          <div className="grid grid-cols-2 gap-2">
            <ActionButton compact>Quote</ActionButton>
            <ActionButton compact tone="dark">Book</ActionButton>
          </div>
        </div>
      </div>
    </MockPhone>
  )
}

function SchedulingDesktop() {
  return (
    <MockWindow title="Scheduling Desk" sidebar={<MockSidebar items={['Dispatcher', 'Calendar', 'Routes', 'Availability']} />}>
      <div className="space-y-4">
        <SectionTitle icon={<Calendar className="h-5 w-5" />} title="Dispatch Calendar" subtitle="Assign, route, and confirm with fewer conflicts." />
        <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
          <div className="space-y-3 rounded-3xl border border-[#dfd3bf] bg-white/75 p-4">
            <div className="text-sm font-semibold text-[#25362d]">Booking Form</div>
            <StackedInput label="Property" value="1420 Spruce St, Philadelphia" />
            <div className="grid grid-cols-2 gap-2">
              <StackedInput label="Date" value="Thu Mar 12" />
              <StackedInput label="Time" value="9:00 AM" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <StackedInput label="Inspector" value="Avery Thompson" />
              <StackedInput label="Template" value="Buyer Inspection" />
            </div>
            <StackedInput label="Services" value="General + Sewer Scope" />
            <div className="rounded-2xl bg-[#f3e2c8] p-3 text-sm text-[#7d5c22]">
              Route warning: current gap allows 22 minutes, expected drive is 28 minutes.
            </div>
            <div className="flex gap-2">
              <ActionButton>Save Draft</ActionButton>
              <ActionButton tone="dark">Book + Confirm</ActionButton>
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded-3xl border border-[#dfd3bf] bg-white/75 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-[#25362d]">Inspector Schedule</div>
                <Pill tone="green">Open route</Pill>
              </div>
              <div className="mt-4 grid gap-2">
                <ScheduleRow time="8:00" title="Bryn Mawr pre-listing" meta="Completed buffer by 10:30" />
                <ScheduleRow time="11:30" title="Conshohocken condo" meta="Travel gap 28 minutes" />
                <ScheduleRow time="3:00" title="Open inspection window" meta="Ideal for Center City booking" />
              </div>
            </div>
            <div className="rounded-3xl border border-[#dfd3bf] bg-[linear-gradient(140deg,#eaf1ed_0%,#dce8e2_100%)] p-4">
              <div className="text-sm font-semibold text-[#25362d]">Route Context</div>
              <div className="mt-4 h-44 rounded-2xl border border-[#bfd0c6] bg-[radial-gradient(circle_at_30%_30%,rgba(47,95,76,0.18),transparent_28%),linear-gradient(135deg,#f3f6f1_0%,#e2ece6_100%)] p-4">
                <div className="grid grid-cols-3 gap-3">
                  <RouteStop label="Job A" />
                  <RouteStop label="Drive" />
                  <RouteStop label="Job B" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MockWindow>
  )
}

function SchedulingMobile() {
  return (
    <MockPhone title="Schedule">
      <div className="space-y-4">
        <div className="rounded-3xl border border-[#dfd3bf] bg-white/80 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-[#25362d]">Today</div>
            <Pill tone="green">3 jobs</Pill>
          </div>
          <PhoneCard title="9:00 Carter" meta="Philadelphia · Buyer inspection" />
          <PhoneCard title="1:30 Ellis" meta="Ardmore · Warranty" />
          <PhoneCard title="4:00 Open window" meta="Available for late booking" />
        </div>
        <div className="rounded-3xl border border-dashed border-[#cdbfa5] bg-[#fff9ef] p-4 space-y-3">
          <div className="text-sm font-semibold text-[#25362d]">Book Inspection</div>
          <StepPills steps={['Property', 'Time', 'People', 'Services', 'Confirm']} active={1} />
          <StackedInput label="Address" value="1420 Spruce St" />
          <div className="grid grid-cols-2 gap-2">
            <ActionButton compact>Save</ActionButton>
            <ActionButton compact tone="dark">Next</ActionButton>
          </div>
        </div>
      </div>
    </MockPhone>
  )
}

function PreInspectionDesktop() {
  return (
    <MockWindow title="Job Prep" sidebar={<MockSidebar items={['Checklist', 'Documents', 'Contacts', 'Reminders']} />}>
      <div className="space-y-4">
        <SectionTitle icon={<ClipboardCheck className="h-5 w-5" />} title="Inspection Readiness" subtitle="Ensure the job is truly ready before the truck rolls." />
        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-[#dfd3bf] bg-white/75 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-[#25362d]">Prep Checklist</div>
              <Pill tone="amber">6 / 9 complete</Pill>
            </div>
            <ChecklistItem label="Inspection agreement signed" checked />
            <ChecklistItem label="Client confirmed attendance" checked />
            <ChecklistItem label="Utilities confirmed on" />
            <ChecklistItem label="Lockbox code captured" />
            <ChecklistItem label="Payment method on file" checked />
            <ChecklistItem label="Seller disclosure received" />
          </div>
          <div className="space-y-3">
            <div className="rounded-3xl border border-[#dfd3bf] bg-white/75 p-4 space-y-3">
              <div className="text-sm font-semibold text-[#25362d]">Access and Occupancy</div>
              <StackedInput label="Occupancy" value="Owner occupied" />
              <StackedInput label="Access" value="Supra lockbox · code on file" />
              <StackedInput label="Special Notes" value="Dog in rear yard, alarm panel at entry" />
            </div>
            <div className="rounded-3xl border border-[#dfd3bf] bg-white/75 p-4 space-y-3">
              <div className="text-sm font-semibold text-[#25362d]">Communications</div>
              <LineItem title="Prep email sent" meta="Yesterday at 5:12 PM" />
              <LineItem title="Reminder SMS queued" meta="Scheduled for 7:30 AM tomorrow" />
              <div className="flex gap-2">
                <ActionButton compact>Send Reminder</ActionButton>
                <ActionButton compact tone="dark">Request Docs</ActionButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MockWindow>
  )
}

function PreInspectionMobile() {
  return (
    <MockPhone title="Job Prep">
      <div className="space-y-4">
        <div className="rounded-3xl border border-[#dfd3bf] bg-white/80 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-[#25362d]">Checklist</div>
            <Pill tone="amber">6/9</Pill>
          </div>
          <div className="mt-3 space-y-2">
            <ChecklistItem label="Agreement signed" checked compact />
            <ChecklistItem label="Attendance confirmed" checked compact />
            <ChecklistItem label="Utilities confirmed" compact />
            <ChecklistItem label="Lockbox code captured" compact />
          </div>
        </div>
        <div className="rounded-3xl border border-[#dfd3bf] bg-white/80 p-4 space-y-2">
          <InfoRow icon={<FileText className="h-4 w-4" />} label="Prep email delivered" />
          <InfoRow icon={<MessageSquare className="h-4 w-4" />} label="Reminder SMS scheduled" />
          <InfoRow icon={<Home className="h-4 w-4" />} label="Owner occupied · Dog on site" />
        </div>
      </div>
    </MockPhone>
  )
}

function OnSiteDesktop() {
  return (
    <MockWindow title="Field Workspace" sidebar={<MockSidebar items={['Roof', 'Exterior', 'Structure', 'Electrical']} />}>
      <div className="space-y-4">
        <SectionTitle icon={<Camera className="h-5 w-5" />} title="Inspection Runner" subtitle="Field data capture built for speed and clarity." />
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-3xl border border-[#dfd3bf] bg-white/75 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-[#25362d]">Shingles</div>
                <div className="text-xs text-[#7b857d]">Roof section · item 4 of 18</div>
              </div>
              <Pill tone="red">Major item</Pill>
            </div>
            <div className="grid gap-2 md:grid-cols-4">
              <StateButton active>Good</StateButton>
              <StateButton>Fair</StateButton>
              <StateButton tone="red">Poor</StateButton>
              <StateButton>N/I</StateButton>
            </div>
            <div className="grid gap-2 md:grid-cols-5">
              <StateButton>None</StateButton>
              <StateButton>Monitor</StateButton>
              <StateButton tone="amber">Repair</StateButton>
              <StateButton tone="red">Replace</StateButton>
              <StateButton tone="red">Safety</StateButton>
            </div>
            <div className="rounded-2xl border border-[#e5dac6] bg-[#fffdf8] p-3 text-sm text-[#526057] min-h-[96px]">
              Asphalt shingles show granular loss on rear slope. Recommend roofer evaluation before settlement.
            </div>
            <div className="flex flex-wrap gap-2">
              <ActionButton compact>Quick Phrase</ActionButton>
              <ActionButton compact><Mic className="mr-1 h-3.5 w-3.5" /> Dictate</ActionButton>
              <ActionButton compact tone="dark"><Camera className="mr-1 h-3.5 w-3.5" /> Add Photo</ActionButton>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <PhotoBlock />
              <PhotoBlock />
              <PhotoBlock />
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded-3xl border border-[#dfd3bf] bg-white/75 p-4">
              <div className="text-sm font-semibold text-[#25362d]">Progress</div>
              <div className="mt-3 h-2 rounded-full bg-[#ede4d6]">
                <div className="h-2 w-[42%] rounded-full bg-[#2f5f4c]" />
              </div>
              <div className="mt-2 text-xs text-[#7b857d]">42% complete · 9 flagged findings · 27 photos</div>
            </div>
            <div className="rounded-3xl border border-[#dfd3bf] bg-white/75 p-4 space-y-2">
              <div className="text-sm font-semibold text-[#25362d]">Flagged Summary</div>
              <LineItem title="Roof shingles" meta="Poor · Replace" />
              <LineItem title="GFCI protection" meta="Safety hazard" />
              <LineItem title="Basement moisture" meta="Repair recommended" />
            </div>
          </div>
        </div>
      </div>
    </MockWindow>
  )
}

function OnSiteMobile() {
  return (
    <MockPhone title="On-Site Report">
      <div className="space-y-4">
        <div className="rounded-3xl border border-[#dfd3bf] bg-white/80 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-[#25362d]">Roof</div>
              <div className="text-xs text-[#7b857d]">4 / 18 items</div>
            </div>
            <Pill tone="green">Autosaved</Pill>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            <SmallChip>Roof</SmallChip>
            <SmallChip>Exterior</SmallChip>
            <SmallChip>Electrical</SmallChip>
          </div>
          <div className="text-sm font-medium text-[#25362d]">Shingles</div>
          <div className="grid grid-cols-4 gap-2">
            <StateButton active compact>Good</StateButton>
            <StateButton compact>Fair</StateButton>
            <StateButton tone="red" compact>Poor</StateButton>
            <StateButton compact>N/I</StateButton>
          </div>
          <div className="rounded-2xl border border-[#e5dac6] bg-[#fffdf8] p-3 text-sm text-[#526057] min-h-[84px]">
            Dictated comment appears here with quick phrases appended.
          </div>
          <div className="grid grid-cols-2 gap-2">
            <ActionButton compact><Mic className="mr-1 h-3.5 w-3.5" /> Dictate</ActionButton>
            <ActionButton compact tone="dark"><Camera className="mr-1 h-3.5 w-3.5" /> Photo</ActionButton>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <PhotoBlock compact />
            <PhotoBlock compact />
            <PhotoBlock compact />
          </div>
        </div>
      </div>
    </MockPhone>
  )
}

function ReportQADesktop() {
  return (
    <MockWindow title="Report Review" sidebar={<MockSidebar items={['Summary', 'Findings', 'QA', 'Finalize']} />}>
      <div className="space-y-4">
        <SectionTitle icon={<ShieldAlert className="h-5 w-5" />} title="Quality Review" subtitle="Catch missing answers, weak narratives, and final-release issues." />
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-3xl border border-[#dfd3bf] bg-white/75 p-4 space-y-3">
            <LineItem title="Roof shingles" meta="Poor · Replace · 3 photos attached" />
            <LineItem title="Attic insulation" meta="Comment missing · needs narrative" />
            <LineItem title="Electrical panel" meta="Safety hazard · ready for summary" />
            <LineItem title="Basement moisture" meta="Repair recommendation set" />
          </div>
          <div className="space-y-3">
            <div className="rounded-3xl border border-[#dfd3bf] bg-white/75 p-4 space-y-2">
              <div className="text-sm font-semibold text-[#25362d]">QA Checklist</div>
              <ChecklistItem label="Missing comments: 1" compact />
              <ChecklistItem label="Missing photos: 2" compact />
              <ChecklistItem label="Safety summary required" checked compact />
            </div>
            <div className="rounded-3xl border border-[#dfd3bf] bg-white/75 p-4 space-y-3">
              <div className="text-sm font-semibold text-[#25362d]">Finalize</div>
              <div className="rounded-2xl bg-[#f6efe2] p-3 text-sm text-[#5f6a61]">
                Executive summary builder groups safety hazards, major defects, and maintenance items.
              </div>
              <ActionButton tone="dark">Finalize Report</ActionButton>
            </div>
          </div>
        </div>
      </div>
    </MockWindow>
  )
}

function ReportQAMobile() {
  return (
    <MockPhone title="Report QA">
      <div className="space-y-4">
        <div className="rounded-3xl border border-[#dfd3bf] bg-white/80 p-4 space-y-2">
          <div className="text-sm font-semibold text-[#25362d]">Checklist</div>
          <ChecklistItem label="1 comment missing" compact />
          <ChecklistItem label="2 photos missing" compact />
          <ChecklistItem label="Safety summary ready" checked compact />
        </div>
        <div className="rounded-3xl border border-[#dfd3bf] bg-white/80 p-4 space-y-2">
          <PhoneCard title="Roof shingles" meta="Poor · Replace" />
          <PhoneCard title="Attic insulation" meta="Needs narrative" />
          <ActionButton tone="dark" compact>Finalize</ActionButton>
        </div>
      </div>
    </MockPhone>
  )
}

function DeliveryDesktop() {
  return (
    <MockWindow title="Report Delivery" sidebar={<MockSidebar items={['Release', 'Portal', 'Recipients', 'Access Log']} />}>
      <div className="space-y-4">
        <SectionTitle icon={<FileText className="h-5 w-5" />} title="Delivery Controls" subtitle="Release to the right people with the right timing and message." />
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-[#dfd3bf] bg-white/75 p-4 space-y-3">
            <ToggleRow label="Client portal access" enabled />
            <ToggleRow label="Email PDF copy" enabled />
            <ToggleRow label="Notify agent" enabled />
            <ToggleRow label="Delay until payment" />
            <div className="flex gap-2">
              <ActionButton>Schedule Send</ActionButton>
              <ActionButton tone="dark">Send Now</ActionButton>
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded-3xl border border-[#dfd3bf] bg-white/75 p-4">
              <div className="text-sm font-semibold text-[#25362d]">Recipient Preview</div>
              <div className="mt-3 space-y-2">
                <InfoRow icon={<UserRound className="h-4 w-4" />} label="John Carter · john@example.com" />
                <InfoRow icon={<Users className="h-4 w-4" />} label="Dana Ellis · dana@compass.com" />
                <InfoRow icon={<CheckCircle2 className="h-4 w-4" />} label="Portal access pending first open" />
              </div>
            </div>
            <div className="rounded-3xl border border-[#dfd3bf] bg-white/75 p-4 space-y-2">
              <div className="text-sm font-semibold text-[#25362d]">Access Log</div>
              <LineItem title="PDF emailed" meta="Queued for 3:45 PM" />
              <LineItem title="Portal not yet viewed" meta="Awaiting release" />
            </div>
          </div>
        </div>
      </div>
    </MockWindow>
  )
}

function DeliveryMobile() {
  return (
    <MockPhone title="Deliver Report">
      <div className="space-y-4">
        <div className="rounded-3xl border border-[#dfd3bf] bg-white/80 p-4 space-y-3">
          <ToggleRow label="Client portal" enabled compact />
          <ToggleRow label="Email PDF" enabled compact />
          <ToggleRow label="Notify agent" enabled compact />
          <ActionButton tone="dark" compact>Send Now</ActionButton>
        </div>
        <div className="rounded-3xl border border-[#dfd3bf] bg-white/80 p-4 space-y-2">
          <InfoRow icon={<UserRound className="h-4 w-4" />} label="John Carter" />
          <InfoRow icon={<MessageSquare className="h-4 w-4" />} label="Portal link ready" />
        </div>
      </div>
    </MockPhone>
  )
}

function PaymentsDesktop() {
  return (
    <MockWindow title="Payments Desk" sidebar={<MockSidebar items={['Invoices', 'Payment Links', 'Overdue', 'Reminders']} />}>
      <div className="space-y-4">
        <SectionTitle icon={<Wallet className="h-5 w-5" />} title="Invoice and Collection Workflow" subtitle="Keep collections visible and actionable." />
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-3xl border border-[#dfd3bf] bg-white/75 p-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <MiniBar value="$18.4k" label="Outstanding" />
              <MiniBar value="$62.1k" label="Collected" />
              <MiniBar value="7" label="Overdue Jobs" />
            </div>
            <LineItem title="Invoice #1042" meta="1420 Spruce St · Pending · $525" />
            <LineItem title="Invoice #1041" meta="19 Valley Rd · Overdue · $645" />
            <LineItem title="Invoice #1039" meta="Paid yesterday · $410" />
          </div>
          <div className="space-y-3">
            <div className="rounded-3xl border border-[#dfd3bf] bg-white/75 p-4 space-y-2">
              <div className="text-sm font-semibold text-[#25362d]">Actions</div>
              <ActionButton compact tone="dark"><CreditCard className="mr-1 h-3.5 w-3.5" /> Create Payment Link</ActionButton>
              <ActionButton compact>Send Reminder</ActionButton>
              <ActionButton compact>Mark Paid</ActionButton>
            </div>
            <div className="rounded-3xl border border-[#dfd3bf] bg-white/75 p-4 space-y-2">
              <div className="text-sm font-semibold text-[#25362d]">Automation</div>
              <div className="rounded-2xl bg-[#f6efe2] p-3 text-sm text-[#5f6a61]">Auto-reminders at T+3, T+7, and overdue threshold.</div>
            </div>
          </div>
        </div>
      </div>
    </MockWindow>
  )
}

function PaymentsMobile() {
  return (
    <MockPhone title="Invoices">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <MiniBar value="$18.4k" label="Outstanding" />
          <MiniBar value="7" label="Overdue" />
        </div>
        <PhoneCard title="Invoice #1042" meta="Pending · $525" badge="Send" />
        <PhoneCard title="Invoice #1041" meta="Overdue · $645" badge="Reminder" />
      </div>
    </MockPhone>
  )
}

function AgentFollowUpDesktop() {
  return (
    <MockWindow title="Agent Follow-Up" sidebar={<MockSidebar items={['Partners', 'Active Deals', 'Repair Lists', 'Notes']} />}>
      <div className="space-y-4">
        <SectionTitle icon={<Users className="h-5 w-5" />} title="Referral Relationship Workspace" subtitle="Support deals after the report and track partner value over time." />
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-3xl border border-[#dfd3bf] bg-white/75 p-4 space-y-3">
            <LineItem title="1420 Spruce St" meta="Report delivered · negotiation pending" />
            <LineItem title="19 Valley Rd" meta="Inspection tomorrow · warranty template" />
            <div className="rounded-2xl bg-[#f6efe2] p-4">
              <div className="text-sm font-semibold text-[#25362d]">Repair Request Builder</div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <StateButton compact>Safety</StateButton>
                <StateButton compact>Major</StateButton>
                <StateButton compact>Custom</StateButton>
              </div>
              <div className="mt-3 flex gap-2">
                <ActionButton compact>Send Summary</ActionButton>
                <ActionButton compact tone="dark">Generate Repair List</ActionButton>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded-3xl border border-[#dfd3bf] bg-white/75 p-4 space-y-2">
              <div className="text-sm font-semibold text-[#25362d]">Partner Health</div>
              <MiniBar value="14" label="Jobs 90d" />
              <MiniBar value="$9.8k" label="Revenue" />
            </div>
            <div className="rounded-3xl border border-[#dfd3bf] bg-white/75 p-4 space-y-2">
              <LineItem title="Call with Dana Ellis" meta="Today 4:00 PM" />
              <LineItem title="Repair addendum sent" meta="Yesterday" />
            </div>
          </div>
        </div>
      </div>
    </MockWindow>
  )
}

function AgentFollowUpMobile() {
  return (
    <MockPhone title="Agent Follow-Up">
      <div className="space-y-4">
        <div className="rounded-3xl border border-[#dfd3bf] bg-white/80 p-4 space-y-2">
          <InfoRow icon={<Users className="h-4 w-4" />} label="Dana Ellis · Compass" />
          <InfoRow icon={<CheckCircle2 className="h-4 w-4" />} label="14 jobs in last 90 days" />
        </div>
        <PhoneCard title="1420 Spruce St" meta="Repair request ready" badge="Generate" />
        <PhoneCard title="19 Valley Rd" meta="Inspection tomorrow" badge="Prep" />
      </div>
    </MockPhone>
  )
}

function PortalDesktop() {
  return (
    <MockWindow title="Client Portal" sidebar={<MockSidebar items={['Timeline', 'Report', 'Invoice', 'Support']} />}>
      <div className="space-y-4">
        <SectionTitle icon={<Home className="h-5 w-5" />} title="Customer Job Hub" subtitle="Give clients one place to manage the entire inspection lifecycle." />
        <div className="rounded-3xl border border-[#dfd3bf] bg-white/75 p-4 space-y-4">
          <div className="grid gap-3 md:grid-cols-5">
            <TimelineStep label="Booked" active />
            <TimelineStep label="Confirmed" active />
            <TimelineStep label="Inspected" active />
            <TimelineStep label="Report Delivered" active />
            <TimelineStep label="Paid" />
          </div>
          <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
            <div className="grid gap-3 md:grid-cols-2">
              <PortalAction label="View Report" icon={<FileText className="h-4 w-4" />} />
              <PortalAction label="Download PDF" icon={<ClipboardCheck className="h-4 w-4" />} />
              <PortalAction label="Pay Invoice" icon={<CreditCard className="h-4 w-4" />} />
              <PortalAction label="Ask Question" icon={<MessageSquare className="h-4 w-4" />} />
            </div>
            <div className="rounded-3xl border border-[#e2d6c1] bg-[#fffaf1] p-4 space-y-2">
              <div className="text-sm font-semibold text-[#25362d]">Summary</div>
              <InfoRow icon={<ShieldAlert className="h-4 w-4" />} label="2 safety items" />
              <InfoRow icon={<ClipboardCheck className="h-4 w-4" />} label="4 major defects" />
              <InfoRow icon={<Wallet className="h-4 w-4" />} label="$525 invoice pending" />
            </div>
          </div>
        </div>
      </div>
    </MockWindow>
  )
}

function PortalMobile() {
  return (
    <MockPhone title="Client Portal">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <PortalAction label="Report" icon={<FileText className="h-4 w-4" />} compact />
          <PortalAction label="Pay" icon={<CreditCard className="h-4 w-4" />} compact />
          <PortalAction label="Manage" icon={<Calendar className="h-4 w-4" />} compact />
          <PortalAction label="Support" icon={<MessageSquare className="h-4 w-4" />} compact />
        </div>
        <div className="rounded-3xl border border-[#dfd3bf] bg-white/80 p-4 space-y-2">
          <InfoRow icon={<ShieldAlert className="h-4 w-4" />} label="2 safety items" />
          <InfoRow icon={<Wallet className="h-4 w-4" />} label="$525 pending invoice" />
        </div>
      </div>
    </MockPhone>
  )
}

function OperationsDesktop() {
  return (
    <MockWindow title="Operations Command" sidebar={<MockSidebar items={['Overview', 'Team Load', 'Revenue', 'Exceptions']} />}>
      <div className="space-y-4">
        <SectionTitle icon={<MapPinned className="h-5 w-5" />} title="Owner Control Center" subtitle="Run the business with team, money, and exception visibility." />
        <div className="grid gap-3 md:grid-cols-5">
          <MiniBar value="$84k" label="Revenue MTD" />
          <MiniBar value="32" label="Jobs This Week" />
          <MiniBar value="$518" label="Avg Ticket" />
          <MiniBar value="6" label="QA Queue" />
          <MiniBar value="7" label="Overdue" />
        </div>
        <div className="grid gap-4 xl:grid-cols-[1fr_1fr_320px]">
          <div className="rounded-3xl border border-[#dfd3bf] bg-white/75 p-4 space-y-2">
            <div className="text-sm font-semibold text-[#25362d]">Inspector Utilization</div>
            <LineItem title="Avery Thompson" meta="92% scheduled capacity" />
            <LineItem title="KC Bartley" meta="71% scheduled capacity" />
            <LineItem title="Field Team East" meta="2 open report drafts" />
          </div>
          <div className="rounded-3xl border border-[#dfd3bf] bg-white/75 p-4 space-y-2">
            <div className="text-sm font-semibold text-[#25362d]">Referral Performance</div>
            <LineItem title="Compass" meta="14 jobs · $9.8k" />
            <LineItem title="BHHS Fox & Roach" meta="11 jobs · $7.3k" />
            <LineItem title="Repeat Clients" meta="8 jobs · 36% margin" />
          </div>
          <div className="rounded-3xl border border-[#dfd3bf] bg-white/75 p-4 space-y-2">
            <div className="text-sm font-semibold text-[#25362d]">Exceptions</div>
            <LineItem title="3 reports older than 24h" meta="Needs attention" />
            <LineItem title="2 inspectors overbooked Friday" meta="Resolve schedule" />
            <LineItem title="1 payment dispute" meta="Client follow-up" />
          </div>
        </div>
      </div>
    </MockWindow>
  )
}

function OperationsMobile() {
  return (
    <MockPhone title="Operations">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <MiniBar value="$84k" label="Revenue" />
          <MiniBar value="32" label="Jobs" />
          <MiniBar value="6" label="QA" />
          <MiniBar value="7" label="Overdue" />
        </div>
        <div className="rounded-3xl border border-[#dfd3bf] bg-white/80 p-4 space-y-2">
          <PhoneCard title="Avery Thompson" meta="92% scheduled capacity" badge="Team" />
          <PhoneCard title="Compass" meta="14 jobs · top source" badge="Referral" />
          <PhoneCard title="3 old draft reports" meta="Needs resolution" badge="Alert" />
        </div>
      </div>
    </MockPhone>
  )
}

function InfoCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-[#e3d7c4] bg-[#fffdf8] p-3">
      <div className="text-[11px] uppercase tracking-[0.14em] text-[#7c867e]">{label}</div>
      <div className="mt-1 text-sm font-semibold text-[#23352c]">{value}</div>
      <div className="mt-1 text-xs text-[#7a847d]">{sub}</div>
    </div>
  )
}

function ActionButton({
  children,
  tone = 'neutral',
  compact = false,
}: {
  children: React.ReactNode
  tone?: 'neutral' | 'accent' | 'dark'
  compact?: boolean
}) {
  const styles = {
    neutral: 'border-[#d7cbb8] bg-white text-[#314239]',
    accent: 'border-[#e4be80] bg-[#f3dfbe] text-[#7d5c22]',
    dark: 'border-[#2f5f4c] bg-[#2f5f4c] text-[#f7f1e8]',
  }[tone]

  return (
    <button className={`inline-flex items-center justify-center rounded-xl border font-medium ${compact ? 'px-3 py-2 text-sm' : 'px-4 py-2.5 text-sm'} ${styles}`}>
      {children}
    </button>
  )
}

function SmallChip({ children }: { children: React.ReactNode }) {
  return <div className="rounded-full border border-[#d8cfbd] bg-white/85 px-3 py-1.5 text-center text-xs font-medium text-[#536057]">{children}</div>
}

function PhoneCard({ title, meta, badge }: { title: string; meta: string; badge?: string }) {
  return (
    <div className="rounded-2xl border border-[#e4d8c4] bg-white/85 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-[#24362d]">{title}</div>
          <div className="mt-1 text-xs text-[#7a847d]">{meta}</div>
        </div>
        {badge && <Pill>{badge}</Pill>}
      </div>
    </div>
  )
}

function InfoRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-[#4f5c53]">
      <span className="text-[#7a847d]">{icon}</span>
      <span>{label}</span>
    </div>
  )
}

function StackedInput({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#e3d7c4] bg-[#fffdf8] p-3">
      <div className="text-[11px] uppercase tracking-[0.14em] text-[#7c867e]">{label}</div>
      <div className="mt-1 text-sm font-medium text-[#23352c]">{value}</div>
    </div>
  )
}

function ScheduleRow({ time, title, meta }: { time: string; title: string; meta: string }) {
  return (
    <div className="grid grid-cols-[58px_minmax(0,1fr)] gap-3 rounded-2xl border border-[#e3d7c4] bg-[#fffdf8] p-3">
      <div className="text-sm font-semibold text-[#23352c]">{time}</div>
      <div>
        <div className="text-sm font-medium text-[#23352c]">{title}</div>
        <div className="mt-1 text-xs text-[#7a847d]">{meta}</div>
      </div>
    </div>
  )
}

function RouteStop({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-[#bfd0c6] bg-white/80 p-3 text-center text-sm font-medium text-[#2f5f4c]">
      {label}
    </div>
  )
}

function ChecklistItem({
  label,
  checked = false,
  compact = false,
}: {
  label: string
  checked?: boolean
  compact?: boolean
}) {
  return (
    <div className={`flex items-center gap-2 rounded-2xl border ${checked ? 'border-[#c9dbc9] bg-[#eef5ec]' : 'border-[#e3d7c4] bg-[#fffdf8]'} ${compact ? 'px-3 py-2' : 'px-3 py-2.5'}`}>
      <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${checked ? 'border-[#6a9a69] bg-[#6a9a69] text-white' : 'border-[#cdbfa5] bg-white'}`}>
        {checked && <CheckCircle2 className="h-3.5 w-3.5" />}
      </div>
      <div className="text-sm text-[#334239]">{label}</div>
    </div>
  )
}

function StateButton({
  children,
  tone = 'neutral',
  active = false,
  compact = false,
}: {
  children: React.ReactNode
  tone?: 'neutral' | 'amber' | 'red'
  active?: boolean
  compact?: boolean
}) {
  const activeStyles =
    tone === 'red'
      ? 'border-[#cf8a78] bg-[#f2d9d2] text-[#9b4a36]'
      : tone === 'amber'
        ? 'border-[#d4b278] bg-[#f3e2c8] text-[#8c6425]'
        : 'border-[#bad0c0] bg-[#e7f0ea] text-[#335c47]'

  return (
    <div className={`rounded-xl border text-center font-medium ${compact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'} ${active ? activeStyles : 'border-[#ded3c1] bg-white text-[#5f6b62]'}`}>
      {children}
    </div>
  )
}

function PhotoBlock({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`rounded-2xl border border-[#d8cfbd] bg-[linear-gradient(140deg,#ebe2d3_0%,#ddd6c9_100%)] ${compact ? 'h-16' : 'h-24'} flex items-center justify-center text-[#7b857d]`}>
      <Camera className="h-4 w-4" />
    </div>
  )
}

function StepPills({ steps, active }: { steps: string[]; active: number }) {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {steps.map((step, index) => (
        <div
          key={step}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${
            index === active
              ? 'border-[#2f5f4c] bg-[#2f5f4c] text-[#f7f1e8]'
              : 'border-[#d8cfbd] bg-white/85 text-[#536057]'
          }`}
        >
          {step}
        </div>
      ))}
    </div>
  )
}

function ToggleRow({
  label,
  enabled = false,
  compact = false,
}: {
  label: string
  enabled?: boolean
  compact?: boolean
}) {
  return (
    <div className={`flex items-center justify-between rounded-2xl border border-[#e3d7c4] bg-[#fffdf8] ${compact ? 'px-3 py-2' : 'px-4 py-3'}`}>
      <div className="text-sm text-[#314239]">{label}</div>
      <div className={`h-6 w-11 rounded-full p-1 ${enabled ? 'bg-[#2f5f4c]' : 'bg-[#d9d1c2]'}`}>
        <div className={`h-4 w-4 rounded-full bg-white transition ${enabled ? 'translate-x-5' : ''}`} />
      </div>
    </div>
  )
}

function TimelineStep({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div className={`rounded-2xl border px-3 py-3 text-center text-xs font-semibold ${active ? 'border-[#bad0c0] bg-[#e7f0ea] text-[#345e49]' : 'border-[#e3d7c4] bg-white text-[#6b756d]'}`}>
      {label}
    </div>
  )
}

function PortalAction({
  label,
  icon,
  compact = false,
}: {
  label: string
  icon: React.ReactNode
  compact?: boolean
}) {
  return (
    <div className={`rounded-2xl border border-[#e3d7c4] bg-white/85 ${compact ? 'p-3' : 'p-4'} text-[#29473a]`}>
      <div className="flex items-center gap-2">
        <span>{icon}</span>
        <span className="text-sm font-semibold">{label}</span>
      </div>
    </div>
  )
}

function LifecycleNode({
  label,
  sub,
  tone = 'neutral',
}: {
  label: string
  sub: string
  tone?: 'neutral' | 'green' | 'amber'
}) {
  const toneClass = {
    neutral: 'border-[#ddd3c0] bg-white/85',
    green: 'border-[#bfd3c6] bg-[#eef5f0]',
    amber: 'border-[#e1c895] bg-[#fbf1dc]',
  }[tone]

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <div className="text-sm font-semibold text-[#22342b]">{label}</div>
      <div className="mt-1 text-xs text-[#69746c]">{sub}</div>
    </div>
  )
}

function RoleRow({
  role,
  handoff,
}: {
  role: string
  handoff: string
}) {
  return (
    <div className="rounded-2xl border border-[#e3d7c4] bg-[#fffdf8] p-3">
      <div className="text-xs uppercase tracking-[0.14em] text-[#7a847d]">{role}</div>
      <div className="mt-1 text-sm text-[#334239]">{handoff}</div>
    </div>
  )
}

function MobileLifecycleRow({
  label,
  meta,
}: {
  label: string
  meta: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#e3d7c4] bg-[#fffdf8] p-3">
      <div className="h-3 w-3 rounded-full bg-[#2f5f4c]" />
      <div>
        <div className="text-sm font-semibold text-[#23352c]">{label}</div>
        <div className="text-xs text-[#7a847d]">{meta}</div>
      </div>
    </div>
  )
}
