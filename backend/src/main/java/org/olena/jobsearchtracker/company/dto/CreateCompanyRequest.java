package org.olena.jobsearchtracker.company.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateCompanyRequest(@NotBlank String name,
                                   String website,
                                   String location,
                                   String notes) {
}
