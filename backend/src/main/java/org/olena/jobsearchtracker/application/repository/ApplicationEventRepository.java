package org.olena.jobsearchtracker.application.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ApplicationEventRepository extends JpaRepository<ApplicationEvent, Long> {
    List<ApplicationEvent> findByApplicationId(Long applicationId);

    List<ApplicationEvent> findByOccurredOnBetweenOrderByOccurredOnAsc(LocalDate from, LocalDate to);
}
