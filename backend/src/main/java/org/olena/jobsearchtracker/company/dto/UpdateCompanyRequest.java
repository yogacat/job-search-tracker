package org.olena.jobsearchtracker.company.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateCompanyRequest(@NotBlank String name,
                                   String website,
                                   String location,
                                   String notes) {
}
