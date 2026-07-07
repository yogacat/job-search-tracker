package org.olena.jobsearchtracker.application.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByCompanyId(Long companyId);
}
