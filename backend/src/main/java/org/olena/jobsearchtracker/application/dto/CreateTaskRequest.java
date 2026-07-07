package org.olena.jobsearchtracker.application.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record CreateTaskRequest(
        @NotBlank String title,
        LocalDate dueOn,
        String note
) {
}
