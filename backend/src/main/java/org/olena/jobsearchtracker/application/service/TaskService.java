package org.olena.jobsearchtracker.application.service;

import org.olena.jobsearchtracker.application.dto.CreateTaskRequest;
import org.olena.jobsearchtracker.application.dto.UpdateTaskRequest;
import org.olena.jobsearchtracker.application.repository.Application;
import org.olena.jobsearchtracker.application.repository.Task;
import org.olena.jobsearchtracker.application.repository.TaskRepository;
import org.olena.jobsearchtracker.common.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Transactional(readOnly = true)
@Service
public class TaskService {
    private final TaskRepository repository;
    private final ApplicationService applicationService;

    public TaskService(TaskRepository repository, ApplicationService applicationService) {
        this.repository = repository;
        this.applicationService = applicationService;
    }

    public List<Task> list(Long applicationId) {
        return repository.findByApplicationId(applicationId);
    }

    public Task get(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Task " + id + " not found"));
    }

    @Transactional
    public Task create(Long applicationId, CreateTaskRequest request) {
        Application application = applicationService.get(applicationId);
        Task task = new Task(application, request.title(), request.dueOn(), false, request.note());
        return repository.save(task);
    }

    @Transactional
    public Task update(Long id, UpdateTaskRequest request) {
        Task task = get(id);
        task.setTitle(request.title());
        task.setDueOn(request.dueOn());
        task.setDone(request.done());
        task.setNote(request.note());
        return task;
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(get(id));
    }
}
