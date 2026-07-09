# Database model

Designed together 2026-07-07; this doc reflects the schema as shipped through migration `V5`.
Single-user, self-hosted (Postgres + Spring Boot/JPA + Flyway, same stack as the Zalando app).
The shipped schema is three tables: `company`, `application`, `application_event`. `contact` and
`document` are deferred until needed.

> **Follow-ups changed shape.** The original design had a separate `task` table for follow-ups.
> It was added in `V1`, then dropped in `V5` — follow-ups are now recorded as `FOLLOW_UP`
> entries in `application_event` alongside the rest of the timeline, rather than living in their
> own table. See [Migration history](#migration-history) below.

## Decisions

- **`company` is its own table** — dedupes employers, groups multiple applications to one company,
  gives contacts a home later.
- **`current_status` is a stored column on `application`**, updated by the app as events are added;
  `application_event` remains the full history. No enforced state machine for now (can add a
  transition guard later, like the Zalando `OrderStatusMachine`, if it earns its keep).
- **Follow-ups are `FOLLOW_UP` events** in `application_event`, not a separate table — they show up
  in the per-application timeline like any other event. (The dropped `task` table's due-date/done
  tracking is not currently reimplemented.)
- **Enums are stored as `varchar` + a `CHECK` constraint**, mapped to Java enums with
  `@Enumerated(STRING)`. Postgres-native enums are painful to `ALTER` later.
- **Timestamps** (`created_at` / `updated_at`) on every table via the `BaseEntity` +
  JPA auditing pattern (`@CreatedDate` / `@LastModifiedDate`), not DB triggers.
- Child rows (`application_event`) `ON DELETE CASCADE`; `application → company` restricts.
- **No salary currency column** — EUR-only (user's real usage), so salary is just `salary_min` /
  `salary_max` / `salary_period`, no `salary_currency`.

## Enums

| enum | values |
|---|---|
| work_mode | `REMOTE`, `HYBRID`, `ONSITE`, `UNKNOWN` |
| source | `LINKEDIN`, `STEPSTONE`, `COMPANY_SITE`, `REFERRAL`, `INDEED`, `XING`, `OTHER` |
| salary_period | `YEAR`, `MONTH` |
| application_status | `APPLIED`, `INTERVIEW`, `OFFER`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`, `GHOSTED` |
| event_type | `APPLIED`, `FOLLOW_UP`, `INTERVIEW`, `TECHNICAL_INTERVIEW`, `TASK`, `OFFER`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`, `GHOSTED` |

No `SCREENING` status / `SCREENING_CALL` event — the real process has no screening step; the first
contact is already an interview (HR or technical).

The **funnel is a fixed set of milestones**: `Total → Interview → Technical interview → Offer →
Accepted`, with `No reply / Rejected / Withdrew` drop-offs branching off each. Intermediate steps
(extra interview rounds, a take-home `TASK`, meeting the team / CTO) are still logged as events and
shown in the per-application **timeline** — they just don't get their own funnel node. `TECHNICAL_INTERVIEW`
is the one interview sub-type kept as its own stage, on purpose (it's a different kind of challenge).

## DDL (current schema, `V1__init.sql` + migrations through `V5`)

```sql
create table company (
    id          bigint generated always as identity primary key,
    name        text        not null unique,
    website     text,
    location    text,
    notes       text,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

create table application (
    id              bigint generated always as identity primary key,
    company_id      bigint      not null references company (id),
    role_title      text        not null,
    posting_url     text,
    location        text,
    work_mode       text        not null default 'UNKNOWN'
                      check (work_mode in ('REMOTE', 'HYBRID', 'ONSITE', 'UNKNOWN')),
    source          text        not null
                      check (source in ('LINKEDIN', 'STEPSTONE', 'COMPANY_SITE', 'REFERRAL', 'INDEED', 'XING', 'OTHER')),
    applied_on      date        not null,
    salary_min      numeric(10, 2),
    salary_max      numeric(10, 2),
    salary_period   text        check (salary_period in ('YEAR', 'MONTH')),
    current_status  text        not null default 'APPLIED'
                      check (current_status in ('APPLIED', 'INTERVIEW', 'OFFER', 'ACCEPTED',
                                                'REJECTED', 'WITHDRAWN', 'GHOSTED')),
    notes           text,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);
create index idx_application_company on application (company_id);
create index idx_application_status on application (current_status);

-- Type CHECK shown with its final (post-V3) value set.
create table application_event (
    id             bigint generated always as identity primary key,
    application_id bigint      not null references application (id) on delete cascade,
    occurred_on    date        not null,
    type           text        not null
                     check (type in ('APPLIED', 'FOLLOW_UP', 'INTERVIEW', 'TECHNICAL_INTERVIEW',
                                     'TASK', 'OFFER', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'GHOSTED')),
    note           text,
    created_at     timestamptz not null default now()
);
create index idx_event_application on application_event (application_id);
```

## Migration history

| version | change |
|---|---|
| `V1__init` | initial `company`, `application`, `application_event`, `task` tables |
| `V2` | `application_event` type CHECK: add `ACCEPTED`, `GHOSTED` |
| `V3` | `application_event` type CHECK: add `FOLLOW_UP` |
| `V4` | `task` gains a `note` column |
| `V5` | **drop `task`** — follow-ups are tracked as `FOLLOW_UP` events instead |

## JSON API contract (what the frontend expects)

camelCase. Detail endpoint returns nested `company` plus `events`; the list endpoint can omit
`events` (or send a count) for a lighter payload.

```ts
interface Company {
  id: number;
  name: string;
  website?: string | null;
  location?: string | null;
}

interface ApplicationEvent {
  id: number;
  occurredOn: string;      // ISO date
  type: "APPLIED" | "FOLLOW_UP" | "INTERVIEW" | "TECHNICAL_INTERVIEW" | "TASK" | "OFFER" | "ACCEPTED" | "REJECTED" | "WITHDRAWN" | "GHOSTED";
  note?: string | null;
}

interface Application {
  id: number;
  company: Company;
  roleTitle: string;
  postingUrl?: string | null;
  location?: string | null;
  workMode?: "REMOTE" | "HYBRID" | "ONSITE" | "UNKNOWN" | null;
  source: "LINKEDIN" | "STEPSTONE" | "COMPANY_SITE" | "REFERRAL" | "INDEED" | "XING" | "OTHER";
  appliedOn: string;       // ISO date
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryPeriod?: "YEAR" | "MONTH" | null;  // EUR-only, so no currency field
  currentStatus: "APPLIED" | "INTERVIEW" | "OFFER" | "ACCEPTED" | "REJECTED" | "WITHDRAWN" | "GHOSTED";
  notes?: string | null;
  events: ApplicationEvent[];
}
```

### Endpoints (as implemented)
- `GET    /api/applications` — list (nested `company`, `currentStatus`, `appliedOn`)
- `GET    /api/applications/{id}` — full application with `events`
- `POST   /api/applications` — create (company by id or by name → find-or-create)
- `PUT    /api/applications/{id}` — update fields / status
- `DELETE /api/applications/{id}` — delete
- `GET    /api/applications/{id}/events` · `POST /api/applications/{id}/events` · `DELETE /api/applications/{id}/events/{eventId}` — manage timeline events
- `GET    /api/companies` · `GET /api/companies/{id}` · `POST /api/companies` · `PUT /api/companies/{id}` · `DELETE /api/companies/{id}` — company CRUD
- `GET    /api/export?from={date}&to={date}` — Agentur für Arbeit sheet (Apache POI), one row per application
