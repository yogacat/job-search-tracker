package org.olena.jobsearchtracker.application.repository;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationEventRepository extends JpaRepository<ApplicationEvent, Long>  {
}
