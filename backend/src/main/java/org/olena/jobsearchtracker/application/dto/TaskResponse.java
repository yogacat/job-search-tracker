package org.olena.jobsearchtracker.application.dto;

import org.olena.jobsearchtracker.application.repository.Task;

import java.time.LocalDate;

public record TaskResponse(
        Long id,
        ApplicationResponse application,
        String title,
        LocalDate dueOn,
        Boolean isDone,
        String note
) {

    public static TaskResponse from(Task task) {
        return new TaskResponse(
                task.getId(),
                ApplicationResponse.from(task.getApplication()),
                task.getTitle(),
                task.getDueOn(),
                task.isDone(),
                task.getNote()
        );
    }
}
