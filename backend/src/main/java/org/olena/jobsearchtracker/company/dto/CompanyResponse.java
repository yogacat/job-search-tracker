package org.olena.jobsearchtracker.company.dto;

import org.olena.jobsearchtracker.company.repository.Company;

public record CompanyResponse(
        Long id,
        String name,
        String website,
        String location
) {
    public static CompanyResponse from(Company company) {
        return new CompanyResponse(
                company.getId(),
                company.getName(),
                company.getWebsite(),
                company.getLocation()
        );
    }
}
