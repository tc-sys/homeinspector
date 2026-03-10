# Specthub Workflow Wireframes

This document defines first-pass product wireframes for the core home inspector workflows.

Conventions:
- `[]` interactive element
- `()` status / metadata
- `----` section boundary
- Left-to-right layouts are desktop-first
- Stacked layouts show mobile intent

## 1. Lead Intake

### Goal
Capture inbound opportunity, attach referral source, convert to booked inspection.

### Desktop
```text
+----------------------------------------------------------------------------------+
| Header: Leads | [New Lead] [Import] [Filters] [Search]                           |
+----------------------------------------------------------------------------------+
| Pipeline Summary                                                                  |
| [New] 24   [Quoted] 11   [Awaiting Response] 7   [Booked] 19                     |
+----------------------------------------------------------------------------------+
| Left: Lead List                              | Right: Lead Detail                |
|----------------------------------------------|-----------------------------------|
| John Carter                                  | John Carter                       |
| 1420 Spruce St, Philadelphia                 | (Buyer lead) (Compass referral)   |
| (New) (Today 10:24 AM)                       |-----------------------------------|
|----------------------------------------------| Contact                           |
| Dana Ellis                                   | Email / Phone                     |
| 19 Valley Rd, Bryn Mawr                      |-----------------------------------|
| (Quoted) (Yesterday)                         | Property                          |
|----------------------------------------------| Address / Sq Ft / Year Built      |
| ...                                          |-----------------------------------|
|                                              | Requested Services                |
|                                              | [General Inspection] [Radon]      |
|                                              |-----------------------------------|
|                                              | Referral Source                   |
|                                              | Agent / Brokerage / Campaign      |
|                                              |-----------------------------------|
|                                              | Notes Timeline                    |
|                                              | - called back                     |
|                                              | - quote sent                      |
|                                              |-----------------------------------|
|                                              | [Create Quote] [Convert to Book]  |
+----------------------------------------------------------------------------------+
```

### Mobile
```text
+----------------------------------+
| Leads              [Search] [+]  |
+----------------------------------+
| Summary chips                    |
| [New 24] [Quoted 11] [Booked 19] |
+----------------------------------+
| John Carter                      |
| 1420 Spruce St                   |
| (New) (Today)                    |
|----------------------------------|
| Dana Ellis                       |
| 19 Valley Rd                     |
| (Quoted)                         |
+----------------------------------+
| Tap card -> detail drawer/page   |
+----------------------------------+
```

## 2. Scheduling

### Goal
Assign inspector, avoid conflicts, account for travel, send confirmation.

### Desktop
```text
+----------------------------------------------------------------------------------+
| Scheduler | [Day] [Week] [Map] [Dispatcher] [Book Inspection]                    |
+----------------------------------------------------------------------------------+
| Filters: [Inspector v] [Service v] [Area v] [Conflict Only]                      |
+----------------------------------------------------------------------------------+
| Left: Unscheduled / Requests                 | Right: Calendar + Route           |
|----------------------------------------------|-----------------------------------|
| Pending Requests                              | 8 AM   [Job A] [Drive] [Job B]   |
| - Carter / Philly / Buyer inspection         | 9 AM                              |
| - Ellis / Ardmore / Warranty                 | 10 AM                             |
|----------------------------------------------|-----------------------------------|
| Booking Form                                  | Mini map                          |
| Address                                       | A -> B route                      |
| Date / Time                                   | Travel = 28 min                   |
| Inspector                                     |-----------------------------------|
| Template                                      | Conflict warnings                 |
| Services / Price                              | - overlaps existing job           |
| Client / Agent                                | - 45 min drive buffer too short   |
|----------------------------------------------|-----------------------------------|
| [Save Draft] [Book + Confirm]                |                                   |
+----------------------------------------------------------------------------------+
```

### Mobile
```text
+----------------------------------+
| Schedule          [Calendar] [+] |
+----------------------------------+
| Today / Upcoming list            |
| 9:00 Carter - Philly             |
| 1:30 Ellis - Ardmore             |
|----------------------------------|
| [Book Inspection] sticky button  |
+----------------------------------+
| Booking flow = stepped form      |
| 1 Property -> 2 Time -> 3 People |
| -> 4 Services -> 5 Confirm       |
+----------------------------------+
```

## 3. Pre-Inspection Intake

### Goal
Make the job inspection-ready before the inspector arrives.

### Desktop
```text
+----------------------------------------------------------------------------------+
| Job Prep: 1420 Spruce St                                      (Scheduled)        |
+----------------------------------------------------------------------------------+
| Checklist Progress: 6 / 9 complete                                               |
+----------------------------------------------------------------------------------+
| Left: Prep Checklist                          | Right: Communication + Docs       |
|----------------------------------------------|-----------------------------------|
| [x] Inspection agreement signed              | Agreement PDF                     |
| [x] Client confirmed attendance              | Prep email                        |
| [ ] Utilities confirmed on                   | SMS reminders                     |
| [ ] Lockbox code captured                    | Reminder history                  |
| [x] Payment method on file                   |-----------------------------------|
| [ ] Occupancy notes captured                 | Access Notes                      |
| [ ] Seller disclosure received               | Lockbox / alarm / pets            |
|----------------------------------------------|-----------------------------------|
| Intake Form                                  | Contacts                          |
| Occupied? / Vacant?                          | Client / Agent / Listing contact  |
| Utilities?                                   |-----------------------------------|
| Alarm / Pets / Gate / HOA                    | [Send Reminder] [Request Docs]    |
+----------------------------------------------------------------------------------+
```

## 4. On-Site Inspection

### Goal
Let the inspector move quickly on phone, capture findings, photos, and major issues.

### Mobile-First
```text
+----------------------------------+
| Roof                  4/18 items |
| [Save] [Offline/Draft status]    |
+----------------------------------+
| Section chips                    |
| [Roof] [Exterior] [Electrical]   |
+----------------------------------+
| Shingles                         |
| [Good] [Fair] [Poor] [N/I]       |
| [None] [Monitor] [Repair]        |
| [Replace] [Safety]               |
|----------------------------------|
| Comment                          |
| [textarea....................]   |
| [Phrase] [Phrase] [Dictate]      |
| [Add Photo] [Markup]             |
|----------------------------------|
| Photo strip                      |
| [img] [img] [img]                |
|----------------------------------|
| [Prev Item]          [Next Item] |
+----------------------------------+
```

### Desktop Companion
```text
+----------------------------------------------------------------------------------+
| Inspection Workspace: 1420 Spruce St | Progress 42% | Issues 9 | Photos 27       |
+----------------------------------------------------------------------------------+
| Left: Sections                                | Center: Active Item              |
| Roof (4/18)                                   | Item answer controls             |
| Exterior (6/21)                               | Comment / quick phrases          |
| Structure (2/15)                              | Photos / annotations             |
| Electrical (0/17)                             |                                   |
|-----------------------------------------------| Right: Summary panel             |
| [Major Defects] [Safety Hazards] [Deferred]   | flagged items / missing items    |
+----------------------------------------------------------------------------------+
```

## 5. Report Writing / QA

### Goal
Review field data, refine narratives, validate completeness, finalize.

### Desktop
```text
+----------------------------------------------------------------------------------+
| Report Review | Draft autosaved 2:14 PM | [Finalize] [Generate PDF]             |
+----------------------------------------------------------------------------------+
| Left: Findings by Section                      | Right: QA / Summary               |
|-----------------------------------------------|-----------------------------------|
| Roof                                           | Missing photos: 2                 |
| - Shingles (Poor / Repair)                    | Missing comments: 1               |
| - Flashing (Fair / Monitor)                   | Safety hazards: 3                 |
|-----------------------------------------------|-----------------------------------|
| Exterior                                       | Executive summary builder         |
| ...                                            | - major defects                   |
|                                                | - monitor items                   |
|-----------------------------------------------|-----------------------------------|
| Active finding editor                          | Release controls                  |
| Condition / Recommendation / Comment           | [Finalize report]                 |
| Photo ordering                                 | [Send to QA reviewer]             |
+----------------------------------------------------------------------------------+
```

## 6. Report Delivery

### Goal
Release clean report, notify parties, provide portal access.

### Desktop
```text
+----------------------------------------------------------------------------------+
| Deliver Report: 1420 Spruce St                                                     |
+----------------------------------------------------------------------------------+
| Left: Delivery Options                         | Right: Recipient Preview         |
|-----------------------------------------------|-----------------------------------|
| [x] Client portal access                      | Client: John Carter              |
| [x] Email PDF copy                            | john@example.com                 |
| [x] Notify agent                              | agent@example.com                |
| [ ] Delay until payment                       |-----------------------------------|
|-----------------------------------------------| Message preview                  |
| Report version                                | Subject / email body / SMS       |
| Finalized at / viewed status                  |-----------------------------------|
|-----------------------------------------------| Access log                       |
| [Send Now] [Schedule Send]                    | not sent / viewed / downloaded   |
+----------------------------------------------------------------------------------+
```

## 7. Payment Collection

### Goal
Collect deposit or final payment, reduce overdue invoices.

### Desktop
```text
+----------------------------------------------------------------------------------+
| Invoice 1042 | Pending | $525.00                                [Send] [Mark Paid]|
+----------------------------------------------------------------------------------+
| Left: Invoice Summary                          | Right: Payment Actions           |
|-----------------------------------------------|-----------------------------------|
| Client / Property                              | Stripe payment link              |
| Service line items                             | [Create Payment Link]            |
| Tax / total                                    | [Send Invoice Email]             |
| Due date                                       | [Charge Saved Method]            |
|-----------------------------------------------|-----------------------------------|
| Timeline                                       | Reminder automation              |
| - invoice sent                                 | T+3 days / T+7 days / overdue    |
| - reminder delivered                           |-----------------------------------|
| - viewed                                       | [Enable reminders]               |
+----------------------------------------------------------------------------------+
```

## 8. Agent Follow-Up

### Goal
Support the negotiation process and strengthen referral relationships.

### Desktop
```text
+----------------------------------------------------------------------------------+
| Agent Follow-Up: Keller Williams / Dana Ellis                                      |
+----------------------------------------------------------------------------------+
| Left: Related Jobs                             | Right: Relationship Workspace    |
|-----------------------------------------------|-----------------------------------|
| 1420 Spruce St (report delivered)             | Referral score / last 90 days    |
| 19 Valley Rd (inspection tomorrow)            | Revenue / closed jobs            |
| ...                                           |-----------------------------------|
|-----------------------------------------------| Follow-up actions                |
| Repair Request Builder                        | [Send summary]                   |
| [Safety items] [Major defects] [Custom list]  | [Send repair request]            |
|-----------------------------------------------| [Schedule check-in]              |
| Notes / calls / meetings                      |-----------------------------------|
+----------------------------------------------------------------------------------+
```

## 9. Client Portal / Support

### Goal
Give clients one place to manage the job after booking and after delivery.

### Desktop / Mobile Hybrid
```text
+----------------------------------------------------------------------------------+
| Client Portal: 1420 Spruce St                                (Report Available)   |
+----------------------------------------------------------------------------------+
| Timeline: Booked -> Confirmed -> Inspected -> Report Delivered -> Paid            |
+----------------------------------------------------------------------------------+
| Cards                                                                             |
| [View Report] [Download PDF] [Pay Invoice] [Manage Appointment] [Ask Question]    |
+----------------------------------------------------------------------------------+
| Report Summary                            | Support Panel                         |
| Major defects: 4                          | Message support                       |
| Safety items: 2                           | Office contact                        |
| Systems inspected                         | FAQ / next steps                      |
+----------------------------------------------------------------------------------+
```

## 10. Business Operations

### Goal
Let the owner run the company, not just individual jobs.

### Desktop
```text
+----------------------------------------------------------------------------------+
| Operations Dashboard                                                               |
+----------------------------------------------------------------------------------+
| KPI Row                                                                           |
| [Revenue MTD] [Jobs This Week] [Avg Ticket] [Overdue] [Lead->Book Rate]          |
+----------------------------------------------------------------------------------+
| Left: Workload                              | Center: Revenue + Sources          |
|---------------------------------------------|------------------------------------|
| Inspector utilization                        | Referral source leaderboard        |
| open jobs / late reports / QA queue          | brokerage / campaign / repeat      |
|---------------------------------------------|------------------------------------|
| Right: Alerts + Tasks                                                             |
| - reports older than 24h                                                           |
| - unpaid invoices older than 7d                                                    |
| - low-converting lead source                                                       |
| - inspectors overbooked                                                            |
+----------------------------------------------------------------------------------+
```

## Role-Specific Home Screens

### Solo Inspector
```text
Today | Next job | Draft reports | Unpaid invoices | Recent clients
```

### Dispatcher / Admin
```text
Unscheduled leads | Today calendar | Agreement issues | Confirmations due
```

### Multi-Inspector Owner
```text
Revenue | Team load | QA queue | Referral leaderboard | Exceptions
```

## Recommended Navigation Model

### Primary App Nav
```text
Dashboard
Leads
Schedule
Inspections
Reports
Invoices
Clients
Agents
Operations
Settings
```

### Inspection Detail Secondary Nav
```text
Overview | Prep | On-Site Report | Delivery | Invoice | Activity
```

## Delivery Priority

If these are turned into implementation work, the best order is:

1. Lead Intake
2. Scheduling
3. Pre-Inspection Intake
4. On-Site Inspection Workspace
5. Report Writing / QA
6. Report Delivery
7. Payment Collection
8. Agent Follow-Up
9. Client Portal
10. Business Operations
