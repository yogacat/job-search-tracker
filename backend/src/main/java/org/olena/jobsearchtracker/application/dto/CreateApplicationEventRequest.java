package org.olena.jobsearchtracker.application.dto;

import jakarta.validation.constraints.NotNull;
import org.olena.jobsearchtracker.application.repository.EventType;

import java.time.LocalDate;

public record CreateApplicationEventRequest(
        @NotNull LocalDate occurredOn,
        @NotNull EventType type,
        String note
) {
}
