package org.olena.jobsearchtracker.application.dto;

import org.olena.jobsearchtracker.application.repository.*;
import org.olena.jobsearchtracker.company.dto.CompanyResponse;

import java.math.BigDecimal;
import java.time.LocalDate;

// events/tasks are left off for now -- ApplicationEvent and Task aren't built yet;
// add them here once those entities exist (see docs/database-model.md).
public record ApplicationResponse(
        Long id,
        CompanyResponse company,
        String roleTitle,
        String postingUrl,
        String location,
        WorkMode workMode,
        Source source,
        LocalDate appliedOn,
        BigDecimal salaryMin,
        BigDecimal salaryMax,
        SalaryPeriod salaryPeriod,
        CurrentStatus currentStatus,
        String notes
) {
    public static ApplicationResponse from(Application application) {
        return new ApplicationResponse(
                application.getId(),
                CompanyResponse.from(application.getCompany()),
                application.getRoleTitle(),
                application.getPostingUrl(),
                application.getLocation(),
                application.getWorkMode(),
                application.getSource(),
                application.getAppliedOn(),
                application.getSalaryMin(),
                application.getSalaryMax(),
                application.getSalaryPeriod(),
                application.getCurrentStatus(),
                application.getNotes()
        );
    }
}
