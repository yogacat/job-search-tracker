package org.olena.jobsearchtracker.application.dto;

import org.olena.jobsearchtracker.application.repository.ApplicationEvent;
import org.olena.jobsearchtracker.application.repository.EventType;

import java.time.LocalDate;

public record ApplicationEventResponse(
        Long id,
        LocalDate occurredOn,
        EventType type,
        String note
) {
    public static ApplicationEventResponse from(ApplicationEvent event) {
        return new ApplicationEventResponse(
                event.getId(),
                event.getOccurredOn(),
                event.getEventType(),
                event.getNote()
        );
    }
}
