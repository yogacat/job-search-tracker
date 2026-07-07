package org.olena.jobsearchtracker.application.service;

import org.olena.jobsearchtracker.application.dto.CreateApplicationRequest;
import org.olena.jobsearchtracker.application.dto.UpdateApplicationRequest;
import org.olena.jobsearchtracker.application.repository.Application;
import org.olena.jobsearchtracker.application.repository.ApplicationRepository;
import org.olena.jobsearchtracker.application.repository.CurrentStatus;
import org.olena.jobsearchtracker.application.repository.WorkMode;
import org.olena.jobsearchtracker.common.NotFoundException;
import org.olena.jobsearchtracker.company.repository.Company;
import org.olena.jobsearchtracker.company.service.CompanyService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ApplicationService {
    private final ApplicationRepository repository;
    private final CompanyService companyService;

    public ApplicationService(ApplicationRepository repository, CompanyService companyService) {
        this.repository = repository;
        this.companyService = companyService;
    }

    public List<Application> list() {
        return repository.findAll();
    }

    public Application get(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Application " + id + " not found"));
    }

    @Transactional
    public Application create(CreateApplicationRequest request) {
        Company company = companyService.get(request.companyId());
        Application application = new Application(
                company,
                request.roleTitle(),
                request.postingUrl(),
                request.location(),
                request.workMode() != null ? request.workMode() : WorkMode.UNKNOWN,
                request.source(),
                request.appliedOn(),
                request.salaryMin(),
                request.salaryMax(),
                request.salaryPeriod(),
                CurrentStatus.APPLIED,
                request.notes()
        );
        return repository.save(application);
    }

    @Transactional
    public Application update(Long id, UpdateApplicationRequest request) {
        Application application = get(id);
        Company company = companyService.get(request.companyId());

        application.setCompany(company);
        application.setRoleTitle(request.roleTitle());
        application.setPostingUrl(request.postingUrl());
        application.setLocation(request.location());
        application.setWorkMode(request.workMode() != null ? request.workMode() : WorkMode.UNKNOWN);
        application.setSource(request.source());
        application.setAppliedOn(request.appliedOn());
        application.setSalaryMin(request.salaryMin());
        application.setSalaryMax(request.salaryMax());
        application.setSalaryPeriod(request.salaryPeriod());
        application.setCurrentStatus(request.currentStatus());
        application.setNotes(request.notes());

        return application;
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(get(id));
    }
}
