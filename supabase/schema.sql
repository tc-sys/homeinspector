-- ============================================================
-- Specthub Database Schema
-- Run this in Supabase SQL Editor to create all tables
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- USER PROFILES
-- ============================================================
create table if not exists public.user_profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text not null default '',
  company_name text,
  phone text,
  logo_url text,
  website text,
  inspector_photo_url text,
  default_cover_photo_url text,
  booking_slug text unique,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, email, booking_slug)
  values (
    new.id,
    new.email,
    lower(substr(replace(new.id::text, '-', ''), 1, 10))
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- CLIENTS
-- ============================================================
create table if not exists public.clients (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  address text,
  notes text,
  tags text[] default '{}',
  pipeline_stage text not null default 'lead'
    check (pipeline_stage in ('lead', 'schedule', 'converted')),
  lead_street text,
  lead_city text,
  lead_state text,
  lead_zip text,
  lead_availability jsonb not null default '[]'::jsonb,
  lead_notes text,
  sent_to_schedule_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists clients_user_id_idx on public.clients(user_id);
create index if not exists clients_pipeline_stage_idx on public.clients(pipeline_stage);

-- ============================================================
-- AGENTS
-- ============================================================
create table if not exists public.agents (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  brokerage text,
  notes text,
  tags text[] default '{}',
  referral_count integer default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists agents_user_id_idx on public.agents(user_id);

-- ============================================================
-- SERVICES
-- ============================================================
create table if not exists public.services (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  description text,
  base_price integer not null default 0, -- in cents
  duration_minutes integer not null default 180,
  active boolean default true not null,
  created_at timestamptz default now() not null
);

create index if not exists services_user_id_idx on public.services(user_id);

-- ============================================================
-- INSPECTIONS
-- ============================================================
create table if not exists public.inspections (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  client_id uuid references public.clients on delete set null,
  agent_id uuid references public.agents on delete set null,
  service_id uuid references public.services on delete set null,
  template_id uuid,
  address text not null,
  city text not null default '',
  state text not null default '',
  zip text not null default '',
  scheduled_date date not null,
  scheduled_time time not null,
  duration_minutes integer not null default 180,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'in_progress', 'completed', 'cancelled')),
  inspection_type text not null default 'General Home Inspection',
  notes text,
  square_footage integer,
  year_built integer,
  price integer not null default 0, -- in cents
  report_locked boolean default false not null,
  cover_photo_url text,
  client_portal_token text unique,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists inspections_user_id_idx on public.inspections(user_id);
create index if not exists inspections_scheduled_date_idx on public.inspections(scheduled_date);
create index if not exists inspections_client_id_idx on public.inspections(client_id);
create index if not exists inspections_agent_id_idx on public.inspections(agent_id);
create index if not exists inspections_client_portal_token_idx on public.inspections(client_portal_token);
create index if not exists inspections_template_id_idx on public.inspections(template_id);

alter table public.user_profiles add column if not exists website text;
alter table public.user_profiles add column if not exists inspector_photo_url text;
alter table public.user_profiles add column if not exists default_cover_photo_url text;
alter table public.inspections add column if not exists cover_photo_url text;
alter table public.inspections add column if not exists template_id uuid;
alter table public.clients add column if not exists pipeline_stage text not null default 'lead';
alter table public.clients add column if not exists lead_street text;
alter table public.clients add column if not exists lead_city text;
alter table public.clients add column if not exists lead_state text;
alter table public.clients add column if not exists lead_zip text;
alter table public.clients add column if not exists lead_availability jsonb not null default '[]'::jsonb;
alter table public.clients add column if not exists lead_notes text;
alter table public.clients add column if not exists sent_to_schedule_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'clients_pipeline_stage_check'
  ) then
    alter table public.clients
      add constraint clients_pipeline_stage_check
      check (pipeline_stage in ('lead', 'schedule', 'converted'));
  end if;
end $$;

-- ============================================================
-- REPORT TEMPLATES
-- ============================================================
create table if not exists public.report_templates (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  description text,
  sections jsonb not null default '[]'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists report_templates_user_id_idx on public.report_templates(user_id);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'inspections_template_id_fkey'
  ) then
    alter table public.inspections
      add constraint inspections_template_id_fkey
      foreign key (template_id)
      references public.report_templates(id)
      on delete set null;
  end if;
end $$;

alter table public.clients add column if not exists converted_inspection_id uuid;
create index if not exists clients_converted_inspection_id_idx on public.clients(converted_inspection_id);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'clients_converted_inspection_id_fkey'
  ) then
    alter table public.clients
      add constraint clients_converted_inspection_id_fkey
      foreign key (converted_inspection_id)
      references public.inspections(id)
      on delete set null;
  end if;
end $$;

update public.clients c
set pipeline_stage = 'converted',
    converted_inspection_id = latest.id
from lateral (
  select i.id
  from public.inspections i
  where i.client_id = c.id
  order by i.scheduled_date desc nulls last, i.scheduled_time desc nulls last, i.created_at desc
  limit 1
) latest
where latest.id is not null;

-- ============================================================
-- INSPECTION REPORTS (COMPLETED/DRAFT ANSWERS)
-- ============================================================
create table if not exists public.inspection_reports (
  id uuid default uuid_generate_v4() primary key,
  inspection_id uuid references public.inspections on delete cascade not null unique,
  template_id uuid references public.report_templates on delete set null not null,
  status text not null default 'draft'
    check (status in ('draft', 'finalized')),
  answers jsonb not null default '[]'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  finalized_at timestamptz
);

create index if not exists inspection_reports_template_id_idx on public.inspection_reports(template_id);

-- ============================================================
-- INVOICES
-- ============================================================
create table if not exists public.invoices (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  inspection_id uuid references public.inspections on delete cascade not null,
  client_id uuid references public.clients on delete set null,
  amount integer not null default 0, -- in cents
  tax_amount integer not null default 0,
  total_amount integer not null default 0,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'overdue', 'cancelled')),
  due_date date,
  paid_date date,
  stripe_payment_intent_id text,
  stripe_payment_link text,
  pass_card_fee boolean default false not null,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists invoices_user_id_idx on public.invoices(user_id);
create index if not exists invoices_inspection_id_idx on public.invoices(inspection_id);
create index if not exists invoices_status_idx on public.invoices(status);

-- ============================================================
-- PAYMENTS
-- ============================================================
create table if not exists public.payments (
  id uuid default uuid_generate_v4() primary key,
  invoice_id uuid references public.invoices on delete cascade not null,
  amount integer not null,
  status text not null default 'pending'
    check (status in ('pending', 'completed', 'failed', 'refunded')),
  stripe_payment_intent_id text,
  payment_method text,
  created_at timestamptz default now() not null
);

-- ============================================================
-- CALENDAR EVENTS
-- ============================================================
create table if not exists public.calendar_events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  inspection_id uuid references public.inspections on delete cascade,
  title text not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  is_available boolean default true not null,
  notes text,
  created_at timestamptz default now() not null
);

create index if not exists calendar_events_user_id_idx on public.calendar_events(user_id);

-- ============================================================
-- CONTACTS LOG
-- ============================================================
create table if not exists public.contacts_log (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  client_id uuid references public.clients on delete cascade,
  agent_id uuid references public.agents on delete cascade,
  type text not null check (type in ('call', 'email', 'sms', 'meeting', 'note')),
  notes text not null,
  created_at timestamptz default now() not null
);

create index if not exists contacts_log_client_id_idx on public.contacts_log(client_id);
create index if not exists contacts_log_agent_id_idx on public.contacts_log(agent_id);

-- ============================================================
-- STRIPE WEBHOOK EVENT LOG
-- ============================================================
create table if not exists public.stripe_webhook_events (
  id text primary key,
  type text not null,
  created_at timestamptz default now() not null
);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Increment agent referral count
create or replace function public.increment_referral_count(agent_id uuid)
returns void as $$
begin
  update public.agents
  set referral_count = referral_count + 1,
      updated_at = now()
  where id = agent_id;
end;
$$ language plpgsql security definer;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
alter table public.user_profiles enable row level security;
alter table public.clients enable row level security;
alter table public.agents enable row level security;
alter table public.services enable row level security;
alter table public.inspections enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.calendar_events enable row level security;
alter table public.contacts_log enable row level security;
alter table public.report_templates enable row level security;
alter table public.inspection_reports enable row level security;

-- User profiles: users can only see/edit their own
create policy "Users can view own profile" on public.user_profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.user_profiles
  for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.user_profiles
  for insert with check (auth.uid() = id);

-- Clients: owned by user
create policy "Users can CRUD own clients" on public.clients
  for all using (auth.uid() = user_id);

-- Agents: owned by user
create policy "Users can CRUD own agents" on public.agents
  for all using (auth.uid() = user_id);

-- Services: owned by user; public read for active services (booking page)
create policy "Users can CRUD own services" on public.services
  for all using (auth.uid() = user_id);
create policy "Public can read active services" on public.services
  for select using (active = true);

-- Inspections: owned by user
create policy "Users can CRUD own inspections" on public.inspections
  for all using (auth.uid() = user_id);

-- Invoices: owned by user
create policy "Users can CRUD own invoices" on public.invoices
  for all using (auth.uid() = user_id);

-- Report templates: owned by user
create policy "Users can CRUD own report templates" on public.report_templates
  for all using (auth.uid() = user_id);

-- Inspection reports: owned through inspection owner
create policy "Users can CRUD own inspection reports" on public.inspection_reports
  for all using (
    inspection_id in (
      select id from public.inspections where user_id = auth.uid()
    )
  )
  with check (
    inspection_id in (
      select id from public.inspections where user_id = auth.uid()
    )
  );

-- Payments: visible to invoice owner
create policy "Users can view own payments" on public.payments
  for select using (
    invoice_id in (
      select id from public.invoices where user_id = auth.uid()
    )
  );

-- Calendar events: owned by user
create policy "Users can CRUD own calendar events" on public.calendar_events
  for all using (auth.uid() = user_id);

-- Contacts log: owned by user
create policy "Users can CRUD own contacts log" on public.contacts_log
  for all using (auth.uid() = user_id);
