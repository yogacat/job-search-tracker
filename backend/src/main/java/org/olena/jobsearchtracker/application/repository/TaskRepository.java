package org.olena.jobsearchtracker.application.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByApplicationId(Long applicationId);
}
