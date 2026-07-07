package org.olena.jobsearchtracker.application.service;

import org.olena.jobsearchtracker.application.dto.CreateApplicationEventRequest;
import org.olena.jobsearchtracker.application.repository.Application;
import org.olena.jobsearchtracker.application.repository.ApplicationEvent;
import org.olena.jobsearchtracker.application.repository.ApplicationEventRepository;
import org.olena.jobsearchtracker.common.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Transactional(readOnly = true)
@Service
public class ApplicationEventService {
    private final ApplicationEventRepository repository;
    private final ApplicationService applicationService;

    public ApplicationEventService(ApplicationEventRepository repository, ApplicationService applicationService) {
        this.repository = repository;
        this.applicationService = applicationService;
    }

    public List<ApplicationEvent> list(Long applicationId) {
        return repository.findByApplicationId(applicationId);
    }

    public ApplicationEvent get(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Event " + id + " not found"));
    }

    @Transactional
    public ApplicationEvent create(Long applicationId, CreateApplicationEventRequest request) {
        Application application = applicationService.get(applicationId);
        ApplicationEvent event = new ApplicationEvent(application, request.occurredOn(), request.type(), request.note());
        return repository.save(event);
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(get(id));
    }
}
