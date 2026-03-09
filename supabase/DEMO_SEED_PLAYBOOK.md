# Demo Seed Playbook (Philadelphia Large Firm)

This project supports a hybrid demo strategy:
- Built-in dataset (`lib/demo.ts`) for zero-dependency reliability.
- Optional Supabase DB seed for persistent demos.

## 1) Configure demo runtime
In Vercel/local env vars:

- `NEXT_PUBLIC_DEMO_MODE=true`
- `DEMO_SOURCE=db` (use `builtin` for the in-app generated dataset)
- `DEMO_SCENARIO=phl_large_firm_90d`

## 2) Seed Supabase demo data
1. Open Supabase SQL Editor.
2. Run `supabase/schema.sql` (if not already applied).
3. Run `supabase/seed_demo_phl.sql`.

The seed script:
- populates ~3 months of Philadelphia-area operations,
- creates dense inspections/invoices/contacts,
- updates profile branding for demo polish,
- replaces prior demo rows for the demo user.

## 3) One-command reseed (CLI option)
If you use Supabase CLI locally:

```bash
supabase db push && supabase db reset --linked --no-seed && supabase db query < supabase/seed_demo_phl.sql
```

Use this right before a sales demo to reset to a known-good baseline.

## 4) Quick verification checklist
- Dashboard shows high activity and recent events.
- Inspections list has dense status mix (completed/in-progress/scheduled/cancelled).
- Invoices show paid/pending/overdue distribution.
- Report templates are present and non-empty.
- Schedule calendar is populated.
