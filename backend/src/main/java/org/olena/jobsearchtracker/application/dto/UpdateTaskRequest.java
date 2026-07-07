package org.olena.jobsearchtracker.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record UpdateTaskRequest(
        @NotBlank String title,
        LocalDate dueOn,
        @NotNull Boolean done,
        String note
) {
}
