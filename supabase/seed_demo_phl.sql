-- ============================================================
-- Sales Demo Seed: Large Philadelphia Firm (90 days active)
-- ============================================================
-- Usage (Supabase SQL Editor):
-- 1) Ensure at least one auth user exists (the account you'll demo with).
-- 2) Run this entire script.
-- 3) It seeds realistic demo records for that user id.

begin;

create extension if not exists "uuid-ossp";

-- Pick the first user in auth.users as the seed target.
-- You can replace this with a fixed UUID if preferred.
create temp table _demo_target_user as
select id::uuid as user_id
from auth.users
order by created_at asc
limit 1;

do $$
begin
  if not exists (select 1 from _demo_target_user) then
    raise exception 'No auth.users row found. Create a user first, then rerun seed script.';
  end if;
end $$;

-- Clear previous demo data for this user
with target as (select user_id from _demo_target_user)
delete from public.contacts_log where user_id in (select user_id from target);

with target as (select user_id from _demo_target_user)
delete from public.invoices where user_id in (select user_id from target);

with target as (select user_id from _demo_target_user)
delete from public.inspections where user_id in (select user_id from target);

with target as (select user_id from _demo_target_user)
delete from public.report_templates where user_id in (select user_id from target);

with target as (select user_id from _demo_target_user)
delete from public.clients where user_id in (select user_id from target);

with target as (select user_id from _demo_target_user)
delete from public.agents where user_id in (select user_id from target);

with target as (select user_id from _demo_target_user)
delete from public.services where user_id in (select user_id from target);

-- Update profile to look like an established regional firm
update public.user_profiles p
set
  full_name = 'Avery Thompson',
  company_name = 'Keystone Premier Home Contracting Group',
  phone = '(267) 555-0184',
  website = 'https://keystonepremierexample.com',
  booking_slug = coalesce(booking_slug, 'keystone-philly'),
  logo_url = coalesce(logo_url, 'https://picsum.photos/seed/keystone-logo/600/240'),
  inspector_photo_url = coalesce(inspector_photo_url, 'https://picsum.photos/seed/inspector-avery/500/500'),
  default_cover_photo_url = coalesce(default_cover_photo_url, 'https://picsum.photos/seed/phl-default-cover/1600/1000'),
  updated_at = now()
where p.id in (select user_id from _demo_target_user);

insert into public.services (id, user_id, name, description, base_price, duration_minutes, active, created_at)
select uuid_generate_v4(), t.user_id, s.name, s.description, s.base_price, s.duration_minutes, true, now() - (s.day_offset || ' days')::interval
from _demo_target_user t
cross join (
  values
    ('Residential Full Inspection', 'Comprehensive home inspection', 42500, 180, 90),
    ('Townhome/Condo Inspection', 'Attached unit inspection', 35500, 150, 88),
    ('Pre-Listing Inspection', 'Seller prep inspection', 39000, 165, 87),
    ('New Construction Phase Inspection', 'Frame to final walkthrough', 46500, 210, 80),
    ('11-Month Warranty Inspection', 'Builder warranty review', 34500, 150, 79),
    ('Radon Test Add-on', '48-hour monitored test', 17500, 45, 75),
    ('Sewer Scope Add-on', 'Lateral line camera inspection', 22500, 60, 73),
    ('Mold Screening', 'Visual + sample set', 28500, 75, 72),
    ('Termite/WDI Inspection', 'Wood-destroying insect report', 15500, 45, 71),
    ('Luxury Estate Inspection', 'Large estate multi-system inspection', 69500, 300, 70)
) as s(name, description, base_price, duration_minutes, day_offset);

with
first_names as (select array['Olivia','Noah','Liam','Emma','Sophia','Mason','Ava','Ethan','Mia','Lucas','Harper','Amelia','Elijah','James','Charlotte','Benjamin','Evelyn','Daniel','Logan','Scarlett'] as n),
last_names as (select array['Anderson','Bennett','Carter','Diaz','Ellis','Foster','Garcia','Hughes','Irving','Johnson','Keller','Lawson','Mitchell','Nguyen','Owens','Parker','Quinn','Roberts','Stevens','Turner'] as n),
streets as (select array['Walnut St','Chestnut St','Spruce St','Pine St','South St','Market St','Frankford Ave','Passyunk Ave','Ridge Ave','Girard Ave','Washington Ave','Locust St','Tasker St','Mifflin St','Lombard St','Poplar St','Master St','Morris St','Cedar Ave','Lansdowne Ave'] as n),
areas as (
  select * from (values
    ('Philadelphia','PA','19103'),('Philadelphia','PA','19147'),('Philadelphia','PA','19146'),('Philadelphia','PA','19125'),
    ('Ardmore','PA','19003'),('Bryn Mawr','PA','19010'),('Villanova','PA','19085'),('Radnor','PA','19087'),
    ('Conshohocken','PA','19428'),('King of Prussia','PA','19406'),('Doylestown','PA','18901'),
    ('Jenkintown','PA','19046'),('Media','PA','19063'),('Havertown','PA','19083'),('West Chester','PA','19380')
  ) as a(city, state, zip)
),
area_indexed as (select row_number() over () as rn, city, state, zip from areas)
insert into public.clients (
  id, user_id, first_name, last_name, email, phone, address, notes, tags, created_at, updated_at
)
select
  uuid_generate_v4(),
  t.user_id,
  (select n[((g % 20) + 1)] from first_names),
  (select n[(((g / 2) % 20) + 1)] from last_names),
  lower((select n[((g % 20) + 1)] from first_names) || '.' || (select n[(((g / 2) % 20) + 1)] from last_names) || g || '@example.com'),
  '(267) ' || lpad((100 + (g % 800))::text, 3, '0') || '-' || lpad((1000 + ((g * 11) % 9000))::text, 4, '0'),
  (100 + ((g * 7) % 8900))::text || ' ' || (select n[((g % 20) + 1)] from streets) || ', ' || ai.city || ', ' || ai.state || ' ' || ai.zip,
  case when g % 3 = 0 then 'Repeat buyer; prefers PDF + SMS updates.' else null end,
  case when g % 5 = 0 then '{VIP,Referral}'::text[] when g % 3 = 0 then '{Investor}'::text[] else '{Buyer}'::text[] end,
  now() - ((89 - (g % 80))::text || ' days')::interval,
  now() - ((g % 25)::text || ' days')::interval
from _demo_target_user t
join generate_series(1, 165) g on true
join area_indexed ai on ai.rn = ((g - 1) % 15) + 1;

with
first_names as (select array['Olivia','Noah','Liam','Emma','Sophia','Mason','Ava','Ethan','Mia','Lucas','Harper','Amelia','Elijah','James','Charlotte','Benjamin','Evelyn','Daniel','Logan','Scarlett'] as n),
last_names as (select array['Anderson','Bennett','Carter','Diaz','Ellis','Foster','Garcia','Hughes','Irving','Johnson','Keller','Lawson','Mitchell','Nguyen','Owens','Parker','Quinn','Roberts','Stevens','Turner'] as n),
brokerages as (select array['Compass','BHHS Fox & Roach','Keller Williams','RE/MAX','Coldwell Banker'] as n)
insert into public.agents (
  id, user_id, first_name, last_name, email, phone, brokerage, notes, tags, referral_count, created_at, updated_at
)
select
  uuid_generate_v4(),
  t.user_id,
  (select n[(((g + 40) % 20) + 1)] from first_names),
  (select n[((((g + 40) / 2) % 20) + 1)] from last_names),
  lower((select n[(((g + 40) % 20) + 1)] from first_names) || '.' || (select n[((((g + 40) / 2) % 20) + 1)] from last_names) || '@partner.example.com'),
  '(215) ' || lpad((200 + (g % 700))::text, 3, '0') || '-' || lpad((1000 + ((g * 13) % 9000))::text, 4, '0'),
  (select n[((g % 5) + 1)] from brokerages),
  case when g % 4 = 0 then 'Top Main Line referral source.' else null end,
  case when g % 4 = 0 then '{Top Referrer,VIP Partner}'::text[] else '{Agent Partner}'::text[] end,
  12 + ((g * 3) % 37),
  now() - ((85 - g)::text || ' days')::interval,
  now() - ((g % 20)::text || ' days')::interval
from _demo_target_user t
join generate_series(1, 28) g on true;

create temp table _demo_services as
select row_number() over (order by created_at, id) as rn, id, base_price, duration_minutes, name
from public.services
where user_id in (select user_id from _demo_target_user);

create temp table _demo_clients as
select row_number() over (order by created_at, id) as rn, id
from public.clients
where user_id in (select user_id from _demo_target_user);

create temp table _demo_agents as
select row_number() over (order by created_at, id) as rn, id
from public.agents
where user_id in (select user_id from _demo_target_user);

with
streets as (select array['Walnut St','Chestnut St','Spruce St','Pine St','South St','Market St','Frankford Ave','Passyunk Ave','Ridge Ave','Girard Ave','Washington Ave','Locust St','Tasker St','Mifflin St','Lombard St','Poplar St','Master St','Morris St','Cedar Ave','Lansdowne Ave'] as n),
areas as (
  select * from (values
    ('Philadelphia','PA','19103'),('Philadelphia','PA','19147'),('Philadelphia','PA','19146'),('Philadelphia','PA','19125'),
    ('Ardmore','PA','19003'),('Bryn Mawr','PA','19010'),('Villanova','PA','19085'),('Radnor','PA','19087'),
    ('Conshohocken','PA','19428'),('King of Prussia','PA','19406'),('Doylestown','PA','18901'),
    ('Jenkintown','PA','19046'),('Media','PA','19063'),('Havertown','PA','19083'),('West Chester','PA','19380')
  ) as a(city, state, zip)
),
area_indexed as (select row_number() over () as rn, city, state, zip from areas),
inspection_types as (select array['General Home Inspection','Buyer Inspection','Pre-Listing Inspection','New Construction Inspection','11-Month Warranty Inspection','Luxury Estate Inspection'] as n)
insert into public.inspections (
  id, user_id, client_id, agent_id, service_id,
  address, city, state, zip,
  scheduled_date, scheduled_time, duration_minutes,
  status, inspection_type, notes,
  square_footage, year_built, price,
  report_locked, cover_photo_url,
  created_at, updated_at
)
select
  uuid_generate_v4(),
  t.user_id,
  c.id,
  a.id,
  s.id,
  (220 + ((g * 19) % 9100))::text || ' ' || (select n[(((g * 3) % 20) + 1)] from streets),
  ai.city,
  ai.state,
  ai.zip,
  (current_date - (90 - floor((g::numeric / 96) * 90))::int),
  make_time((array[8,9,10,12,13,14,15])[((g % 7) + 1)], (array[0,30])[((g % 2) + 1)], 0),
  s.duration_minutes,
  case
    when (90 - floor((g::numeric / 96) * 90)) <= 2 then case when g % 5 = 0 then 'cancelled' else 'scheduled' end
    when (90 - floor((g::numeric / 96) * 90)) <= 8 then case when g % 6 = 0 then 'in_progress' else 'scheduled' end
    when (90 - floor((g::numeric / 96) * 90)) <= 70 then case when g % 14 = 0 then 'cancelled' else 'completed' end
    else case when g % 10 = 0 then 'cancelled' else 'completed' end
  end,
  (select n[((g % 6) + 1)] from inspection_types),
  case when g % 4 = 0 then 'Occupied property. Supra access via listing agent.' when g % 3 = 0 then 'Tenant occupied. 24hr notice required.' else null end,
  1200 + ((g * 145) % 4200),
  1920 + ((g * 3) % 103),
  s.base_price + case when (1200 + ((g * 145) % 4200)) > 3500 then 17500 when (1200 + ((g * 145) % 4200)) > 2500 then 6500 else 0 end,
  case when (
    case
      when (90 - floor((g::numeric / 96) * 90)) <= 2 then case when g % 5 = 0 then 'cancelled' else 'scheduled' end
      when (90 - floor((g::numeric / 96) * 90)) <= 8 then case when g % 6 = 0 then 'in_progress' else 'scheduled' end
      when (90 - floor((g::numeric / 96) * 90)) <= 70 then case when g % 14 = 0 then 'cancelled' else 'completed' end
      else case when g % 10 = 0 then 'cancelled' else 'completed' end
    end
  ) <> 'completed' or g % 5 = 0 then true else false end,
  case when g % 3 = 0 then 'https://picsum.photos/seed/phl-home-' || g || '/1400/900' else null end,
  now() - ((90 - floor((g::numeric / 96) * 90) + 7)::text || ' days')::interval,
  now() - (greatest((90 - floor((g::numeric / 96) * 90)) - 1, 0)::text || ' days')::interval
from _demo_target_user t
join generate_series(1, 96) g on true
join _demo_services s on s.rn = ((g - 1) % 10) + 1
join _demo_clients c on c.rn = ((g - 1) % 165) + 1
join _demo_agents a on a.rn = ((g - 1) % 28) + 1
join area_indexed ai on ai.rn = ((g - 1) % 15) + 1;

insert into public.invoices (
  id, user_id, inspection_id, client_id, amount, tax_amount, total_amount,
  status, due_date, paid_date, stripe_payment_intent_id, stripe_payment_link,
  pass_card_fee, notes, created_at, updated_at
)
select
  uuid_generate_v4(),
  i.user_id,
  i.id,
  i.client_id,
  i.price,
  0,
  i.price,
  case
    when i.status = 'completed' and (current_date - i.scheduled_date > 20) and (row_number() over (order by i.created_at) % 6 <> 0) then 'paid'
    when i.status = 'completed' and (row_number() over (order by i.created_at) % 7 = 0) then 'overdue'
    else 'pending'
  end,
  i.scheduled_date + interval '10 days',
  case
    when i.status = 'completed' and (current_date - i.scheduled_date > 20) and (row_number() over (order by i.created_at) % 6 <> 0)
      then (i.scheduled_date + (((row_number() over (order by i.created_at)) % 5) + 2) * interval '1 day')::date
    else null
  end,
  case
    when i.status = 'completed' and (current_date - i.scheduled_date > 20) and (row_number() over (order by i.created_at) % 6 <> 0)
      then 'pi_demo_' || (1000 + row_number() over (order by i.created_at))
    else null
  end,
  null,
  (row_number() over (order by i.created_at) % 4 = 0),
  case
    when i.status = 'completed' and (row_number() over (order by i.created_at) % 7 = 0)
      then 'Second reminder sent; payment expected this week.'
    else null
  end,
  i.created_at + interval '3 days',
  i.updated_at
from public.inspections i
where i.user_id in (select user_id from _demo_target_user);

insert into public.contacts_log (id, user_id, client_id, agent_id, type, notes, created_at)
select
  uuid_generate_v4(),
  t.user_id,
  c.id,
  a.id,
  (array['call','email','sms','meeting','note'])[((g % 5) + 1)]::text,
  (array[
    'Confirmed inspection window and lockbox access details.',
    'Sent pre-inspection prep checklist and utility activation reminder.',
    'Discussed major findings and contractor follow-up priorities.',
    'Agent requested expedited report delivery for settlement deadline.',
    'Client asked for add-on radon and sewer scope scheduling.'
  ])[((g % 5) + 1)],
  now() - ((g % 88)::text || ' days')::interval
from _demo_target_user t
join generate_series(1, 260) g on true
join _demo_clients c on c.rn = ((g - 1) % 165) + 1
join _demo_agents a on a.rn = ((g - 1) % 28) + 1;

insert into public.report_templates (id, user_id, name, description, sections, created_at, updated_at)
select uuid_generate_v4(), t.user_id, rt.name, rt.description, rt.sections::jsonb, now() - (rt.days_created || ' days')::interval, now() - (rt.days_updated || ' days')::interval
from _demo_target_user t
cross join (
  values
  (
    'Residential Full Inspection Template',
    'Standard company template for buyer and seller inspections.',
    '[{"id":"roof","name":"Roof","items":[{"id":"roof-1","name":"Shingles","condition":"good","recommendation":"none","comment":"Shingles show normal wear.","photo_urls":["https://picsum.photos/seed/roof-1/1200/800"]},{"id":"roof-2","name":"Flashings","condition":"fair","recommendation":"monitor","comment":"Minor wear at flashing joints.","photo_urls":["https://picsum.photos/seed/roof-2/1200/800"]}]},{"id":"systems","name":"Major Systems","items":[{"id":"sys-1","name":"Electrical Panel","condition":"good","recommendation":"none","comment":"Panel labeling is clear and organized.","photo_urls":["https://picsum.photos/seed/sys-1/1200/800"]},{"id":"sys-2","name":"HVAC","condition":"fair","recommendation":"repair","comment":"Recommend seasonal service and duct balancing.","photo_urls":["https://picsum.photos/seed/sys-2/1200/800"]}]}]',
    88,
    2
  ),
  (
    'Luxury Estate Inspection Template',
    'Expanded inspection template for high-value and large properties.',
    '[{"id":"estate-exterior","name":"Estate Exterior","items":[{"id":"estate-ext-1","name":"Pool Equipment","condition":"fair","recommendation":"repair","comment":"Pump vibration noted; service recommended.","photo_urls":["https://picsum.photos/seed/estate-1/1200/800"]}]},{"id":"estate-mechanical","name":"Mechanical Systems","items":[{"id":"estate-mech-1","name":"Generator","condition":"good","recommendation":"monitor","comment":"Runs cleanly under test load.","photo_urls":["https://picsum.photos/seed/estate-2/1200/800"]}]}]',
    70,
    5
  ),
  (
    'Townhome/Condo Template',
    'Fast-turn template optimized for urban attached units.',
    '[{"id":"condo-outer","name":"Common + Exterior Interfaces","items":[{"id":"condo-out-1","name":"Balcony","condition":"fair","recommendation":"monitor","comment":"Waterproofing is serviceable with light wear.","photo_urls":["https://picsum.photos/seed/condo-1/1200/800"]}]},{"id":"condo-inner","name":"Interior Unit","items":[{"id":"condo-in-1","name":"Bathroom Venting","condition":"poor","recommendation":"repair","comment":"Vent fan airflow is weak and noisy.","photo_urls":["https://picsum.photos/seed/condo-2/1200/800"]}]}]',
    65,
    4
  ),
  (
    '11-Month Warranty Template',
    'Builder warranty punch-list style inspection report.',
    '[{"id":"warranty-structure","name":"Structure + Envelope","items":[{"id":"war-1","name":"Settlement Cracks","condition":"fair","recommendation":"monitor","comment":"Minor shrinkage cracking observed.","photo_urls":["https://picsum.photos/seed/war-1/1200/800"]}]},{"id":"warranty-systems","name":"Systems + Finishes","items":[{"id":"war-2","name":"Electrical Trim-out","condition":"good","recommendation":"none","comment":"Switch/outlet operation normal.","photo_urls":["https://picsum.photos/seed/war-2/1200/800"]}]}]',
    50,
    1
  )
) as rt(name, description, sections, days_created, days_updated);

create temp table _demo_templates as
select row_number() over (order by created_at, id) as rn, id
from public.report_templates
where user_id in (select user_id from _demo_target_user);

with ordered_inspections as (
  select row_number() over (order by created_at, id) as rn, id
  from public.inspections
  where user_id in (select user_id from _demo_target_user)
)
update public.inspections i
set template_id = t.id
from ordered_inspections oi
join _demo_templates t on t.rn = ((oi.rn - 1) % 4) + 1
where i.id = oi.id;

insert into public.inspection_reports (id, inspection_id, template_id, status, answers, created_at, updated_at, finalized_at)
select
  uuid_generate_v4(),
  i.id,
  i.template_id,
  case when i.status = 'completed' then 'finalized' else 'draft' end,
  rt.sections,
  i.created_at,
  i.updated_at,
  case when i.status = 'completed' then i.updated_at else null end
from public.inspections i
join public.report_templates rt on rt.id = i.template_id
where i.user_id in (select user_id from _demo_target_user)
  and i.status in ('completed', 'in_progress');

commit;
