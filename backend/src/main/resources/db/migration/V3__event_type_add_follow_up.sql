ALTER TABLE application_event DROP CONSTRAINT application_event_type_check;

ALTER TABLE application_event
    ADD CONSTRAINT application_event_type_check
    CHECK (type IN ('APPLIED', 'FOLLOW_UP', 'INTERVIEW', 'TECHNICAL_INTERVIEW', 'TASK', 'OFFER',
                     'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'GHOSTED'));
