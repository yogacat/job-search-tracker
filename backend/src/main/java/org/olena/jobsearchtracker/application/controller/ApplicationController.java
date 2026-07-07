package org.olena.jobsearchtracker.application.controller;

import jakarta.validation.Valid;
import org.olena.jobsearchtracker.application.dto.ApplicationResponse;
import org.olena.jobsearchtracker.application.dto.CreateApplicationRequest;
import org.olena.jobsearchtracker.application.dto.UpdateApplicationRequest;
import org.olena.jobsearchtracker.application.service.ApplicationService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService service;

    public ApplicationController(ApplicationService service) {
        this.service = service;
    }

    @GetMapping
    public List<ApplicationResponse> list(@RequestParam(required = false) Long companyId) {
        return service.list(companyId).stream().map(ApplicationResponse::from).toList();
    }

    @GetMapping("/{id}")
    public ApplicationResponse get(@PathVariable Long id) {
        return ApplicationResponse.from(service.get(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApplicationResponse create(@Valid @RequestBody CreateApplicationRequest request) {
        return ApplicationResponse.from(service.create(request));
    }

    @PutMapping("/{id}")
    public ApplicationResponse update(@PathVariable Long id, @Valid @RequestBody UpdateApplicationRequest request) {
        return ApplicationResponse.from(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
