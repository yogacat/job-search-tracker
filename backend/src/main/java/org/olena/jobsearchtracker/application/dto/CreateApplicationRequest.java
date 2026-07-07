package org.olena.jobsearchtracker.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.olena.jobsearchtracker.application.repository.SalaryPeriod;
import org.olena.jobsearchtracker.application.repository.Source;
import org.olena.jobsearchtracker.application.repository.WorkMode;

import java.math.BigDecimal;
import java.time.LocalDate;

// currentStatus is not accepted here: every application starts APPLIED.
public record CreateApplicationRequest(
        @NotNull Long companyId,
        @NotBlank String roleTitle,
        String postingUrl,
        String location,
        WorkMode workMode,
        @NotNull Source source,
        @NotNull LocalDate appliedOn,
        BigDecimal salaryMin,
        BigDecimal salaryMax,
        SalaryPeriod salaryPeriod,
        String notes
) {
}
