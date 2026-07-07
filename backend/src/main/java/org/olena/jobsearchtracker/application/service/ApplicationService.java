package org.olena.jobsearchtracker.application.service;

import org.olena.jobsearchtracker.application.dto.CreateApplicationRequest;
import org.olena.jobsearchtracker.application.dto.UpdateApplicationRequest;
import org.olena.jobsearchtracker.application.repository.*;
import org.olena.jobsearchtracker.common.NotFoundException;
import org.olena.jobsearchtracker.company.repository.Company;
import org.olena.jobsearchtracker.company.service.CompanyService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ApplicationService {
    private final ApplicationRepository repository;
    private final ApplicationEventRepository eventRepository;
    private final CompanyService companyService;

    public ApplicationService(
            ApplicationRepository repository,
            ApplicationEventRepository eventRepository,
            CompanyService companyService
    ) {
        this.repository = repository;
        this.eventRepository = eventRepository;
        this.companyService = companyService;
    }

    public List<Application> list(Long companyId) {
        return companyId != null ? repository.findByCompanyId(companyId) : repository.findAll();
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
        repository.save(application);
        eventRepository.save(new ApplicationEvent(application, request.appliedOn(), EventType.APPLIED, null));

        return application;
    }

    @Transactional
    public Application update(Long id, UpdateApplicationRequest request) {
        Application application = get(id);
        Company company = companyService.get(request.companyId());
        CurrentStatus previousStatus = application.getCurrentStatus();

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

        if (request.currentStatus() != previousStatus) {
            EventType eventType = EventType.valueOf(request.currentStatus().name());
            eventRepository.save(new ApplicationEvent(application, LocalDate.now(), eventType, null));
        }

        return application;
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(get(id));
    }
}
