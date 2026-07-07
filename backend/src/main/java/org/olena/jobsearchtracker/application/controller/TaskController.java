package org.olena.jobsearchtracker.application.controller;

import jakarta.validation.Valid;
import org.olena.jobsearchtracker.application.dto.CreateTaskRequest;
import org.olena.jobsearchtracker.application.dto.TaskResponse;
import org.olena.jobsearchtracker.application.dto.UpdateTaskRequest;
import org.olena.jobsearchtracker.application.service.TaskService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications/{applicationId}/tasks")
public class TaskController {
    private final TaskService service;

    public TaskController(TaskService service) {
        this.service = service;
    }

    @GetMapping
    public List<TaskResponse> list(@PathVariable Long applicationId) {
        return service.list(applicationId).stream().map(TaskResponse::from).toList();
    }

    @GetMapping("/{id}")
    public TaskResponse get(@PathVariable Long applicationId, @PathVariable Long id) {
        return TaskResponse.from(service.get(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponse create(@PathVariable Long applicationId, @Valid @RequestBody CreateTaskRequest request) {
        return TaskResponse.from(service.create(applicationId, request));
    }

    @PutMapping("/{id}")
    public TaskResponse update(@PathVariable Long applicationId, @PathVariable Long id, @Valid @RequestBody UpdateTaskRequest request) {
        return TaskResponse.from(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long applicationId, @PathVariable Long id) {
        service.delete(id);
    }
}
