# Database model

Designed together 2026-07-07. Single-user, self-hosted (Postgres + Spring Boot/JPA + Flyway,
same stack as the Zalando app). v1 = four tables: `company`, `application`, `application_event`,
`task`. `contact` and `document` are deferred until needed.

## Decisions

- **`company` is its own table** — dedupes employers, groups multiple applications to one company,
  gives contacts a home later.
- **`current_status` is a stored column on `application`**, updated by the app as events are added;
  `application_event` remains the full history. No enforced state machine for now (can add a
  transition guard later, like the Zalando `OrderStatusMachine`, if it earns its keep).
- **Follow-ups live in a `task` table** (0..n per application) rather than a single `next_step`
  field — supports multiple reminders and drives the due-soon / overdue accent on cards.
- **Enums are stored as `varchar` + a `CHECK` constraint**, mapped to Java enums with
  `@Enumerated(STRING)`. Postgres-native enums are painful to `ALTER` later.
- **Timestamps** (`created_at` / `updated_at`) on every table via the `BaseEntity` +
  JPA auditing pattern (`@CreatedDate` / `@LastModifiedDate`), not DB triggers.
- Child rows (`application_event`, `task`) `ON DELETE CASCADE`; `application → company` restricts.

## Enums

| enum | values |
|---|---|
| work_mode | `REMOTE`, `HYBRID`, `ONSITE`, `UNKNOWN` |
| source | `LINKEDIN`, `STEPSTONE`, `COMPANY_SITE`, `REFERRAL`, `INDEED`, `XING`, `OTHER` |
| salary_period | `YEAR`, `MONTH` |
| application_status | `APPLIED`, `INTERVIEW`, `OFFER`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`, `GHOSTED` |
| event_type | `APPLIED`, `INTERVIEW`, `TECHNICAL_INTERVIEW`, `TASK`, `OFFER`, `REJECTED`, `WITHDRAWN` |

No `SCREENING` status / `SCREENING_CALL` event — the real process has no screening step; the first
contact is already an interview (HR or technical).

The **funnel is a fixed set of milestones**: `Total → Interview → Technical interview → Offer →
Accepted`, with `No reply / Rejected / Withdrew` drop-offs branching off each. Intermediate steps
(extra interview rounds, a take-home `TASK`, meeting the team / CTO) are still logged as events and
shown in the per-application **timeline** — they just don't get their own funnel node. `TECHNICAL_INTERVIEW`
is the one interview sub-type kept as its own stage, on purpose (it's a different kind of challenge).

## DDL (Flyway `V1__init.sql`)

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
    work_mode       text        check (work_mode in ('REMOTE', 'HYBRID', 'ONSITE', 'UNKNOWN')),
    source          text        not null
                      check (source in ('LINKEDIN', 'STEPSTONE', 'COMPANY_SITE', 'REFERRAL', 'INDEED', 'XING', 'OTHER')),
    applied_on      date        not null,
    salary_min      numeric(10, 2),
    salary_max      numeric(10, 2),
    salary_currency char(3)     not null default 'EUR',
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

create table application_event (
    id             bigint generated always as identity primary key,
    application_id bigint      not null references application (id) on delete cascade,
    occurred_on    date        not null,
    type           text        not null
                     check (type in ('APPLIED', 'INTERVIEW', 'TECHNICAL_INTERVIEW',
                                     'TASK', 'OFFER', 'REJECTED', 'WITHDRAWN')),
    note           text,
    created_at     timestamptz not null default now()
);
create index idx_event_application on application_event (application_id);

create table task (
    id             bigint generated always as identity primary key,
    application_id bigint      not null references application (id) on delete cascade,
    title          text        not null,
    due_on         date,
    done           boolean     not null default false,
    created_at     timestamptz not null default now(),
    updated_at     timestamptz not null default now()
);
create index idx_task_application on task (application_id);
```

## JSON API contract (what the frontend expects)

camelCase. Detail endpoint returns nested `company`, plus `events` and `tasks`; the list endpoint
can omit `events`/`tasks` (or send counts) for a lighter payload.

```ts
interface Company {
  id: number;
  name: string;
  website?: string | null;
  location?: string | null;
}

interface Salary {
  min?: number | null;
  max?: number | null;
  currency: string;        // "EUR"
  period?: "YEAR" | "MONTH" | null;
}

interface ApplicationEvent {
  id: number;
  occurredOn: string;      // ISO date
  type: "APPLIED" | "INTERVIEW" | "TECHNICAL_INTERVIEW" | "TASK" | "OFFER" | "REJECTED" | "WITHDRAWN";
  note?: string | null;
}

interface Task {
  id: number;
  title: string;
  dueOn?: string | null;   // ISO date
  done: boolean;
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
  salary?: Salary | null;
  currentStatus: "APPLIED" | "INTERVIEW" | "OFFER" | "ACCEPTED" | "REJECTED" | "WITHDRAWN" | "GHOSTED";
  notes?: string | null;
  events: ApplicationEvent[];
  tasks: Task[];
}
```

### Suggested endpoints
- `GET  /api/applications` — list (nested `company`, `currentStatus`, `appliedOn`, maybe event/task counts)
- `GET  /api/applications/{id}` — full application with `events` + `tasks`
- `POST /api/applications` — create (company by id or by name → find-or-create)
- `PATCH /api/applications/{id}` — update fields / status
- `POST /api/applications/{id}/events` — append a timeline event
- `POST /api/applications/{id}/tasks` · `PATCH /api/tasks/{id}` — manage follow-ups
- `GET  /api/applications/export.xlsx` — Agentur für Arbeit sheet (Apache POI), one row per application
