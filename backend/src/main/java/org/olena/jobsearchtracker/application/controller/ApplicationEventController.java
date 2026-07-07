package org.olena.jobsearchtracker.application.controller;

import jakarta.validation.Valid;
import org.olena.jobsearchtracker.application.dto.ApplicationEventResponse;
import org.olena.jobsearchtracker.application.dto.CreateApplicationEventRequest;
import org.olena.jobsearchtracker.application.service.ApplicationEventService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications/{applicationId}/events")
public class ApplicationEventController {
    private final ApplicationEventService service;

    public ApplicationEventController(ApplicationEventService service) {
        this.service = service;
    }

    @GetMapping
    public List<ApplicationEventResponse> list(@PathVariable Long applicationId) {
        return service.list(applicationId).stream().map(ApplicationEventResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApplicationEventResponse create(
            @PathVariable Long applicationId,
            @Valid @RequestBody CreateApplicationEventRequest request
    ) {
        return ApplicationEventResponse.from(service.create(applicationId, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long applicationId, @PathVariable Long id) {
        service.delete(id);
    }
}
