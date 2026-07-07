CREATE TABLE company (
    id         BIGSERIAL PRIMARY KEY,
    name       TEXT        NOT NULL UNIQUE,
    website    TEXT,
    location   TEXT,
    notes      TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE application (
    id              BIGSERIAL PRIMARY KEY,
    company_id      BIGINT      NOT NULL REFERENCES company (id),
    role_title      TEXT        NOT NULL,
    posting_url     TEXT,
    location        TEXT,
    work_mode       TEXT        NOT NULL DEFAULT 'UNKNOWN'
                      CHECK (work_mode IN ('REMOTE', 'HYBRID', 'ONSITE', 'UNKNOWN')),
    source          TEXT        NOT NULL
                      CHECK (source IN ('LINKEDIN', 'STEPSTONE', 'COMPANY_SITE', 'REFERRAL',
                                        'INDEED', 'XING', 'OTHER')),
    applied_on      DATE        NOT NULL,
    salary_min      NUMERIC(10, 2),
    salary_max      NUMERIC(10, 2),
    salary_period   TEXT        CHECK (salary_period IN ('YEAR', 'MONTH')),
    current_status  TEXT        NOT NULL DEFAULT 'APPLIED'
                      CHECK (current_status IN ('APPLIED', 'INTERVIEW', 'OFFER', 'ACCEPTED',
                                                'REJECTED', 'WITHDRAWN', 'GHOSTED')),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_application_company ON application (company_id);
CREATE INDEX idx_application_status ON application (current_status);

CREATE TABLE application_event (
    id             BIGSERIAL PRIMARY KEY,
    -- Children cascade: deleting an application removes its timeline and tasks.
    application_id BIGINT      NOT NULL REFERENCES application (id) ON DELETE CASCADE,
    occurred_on    DATE        NOT NULL,
    type           TEXT        NOT NULL
                     CHECK (type IN ('APPLIED', 'INTERVIEW', 'TECHNICAL_INTERVIEW',
                                     'TASK', 'OFFER', 'REJECTED', 'WITHDRAWN')),
    note           TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_event_application ON application_event (application_id);

CREATE TABLE task (
    id             BIGSERIAL PRIMARY KEY,
    application_id BIGINT      NOT NULL REFERENCES application (id) ON DELETE CASCADE,
    title          TEXT        NOT NULL,
    due_on         DATE,
    done           BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_task_application ON task (application_id);
