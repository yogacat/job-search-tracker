package org.olena.jobsearchtracker.application.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByCompanyId(Long companyId);

    List<Application> findByAppliedOnBetweenOrderByAppliedOnAsc(LocalDate from, LocalDate to);
}
