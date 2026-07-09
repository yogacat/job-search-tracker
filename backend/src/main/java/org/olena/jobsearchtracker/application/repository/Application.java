package org.olena.jobsearchtracker.application.repository;

import jakarta.persistence.*;
import lombok.*;
import org.olena.jobsearchtracker.common.BaseEntity;
import org.olena.jobsearchtracker.company.repository.Company;

import java.math.BigDecimal;
import java.time.LocalDate;

@ToString
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Entity
@Table(name = "application")
public class Application extends BaseEntity {

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(name = "role_title", nullable = false)
    private String roleTitle;

    @Column(name = "posting_url")
    private String postingUrl;

    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "work_mode", nullable = false)
    private WorkMode workMode = WorkMode.UNKNOWN;

    @Enumerated(EnumType.STRING)
    @Column(name = "source", nullable = false)
    private Source source = Source.OTHER;

    @Column(name = "applied_on", nullable = false)
    private LocalDate appliedOn;

    @Column(name = "salary_min", precision = 10, scale = 2)
    private BigDecimal salaryMin;

    @Column(name = "salary_max", precision = 10, scale = 2)
    private BigDecimal salaryMax;

    @Enumerated(EnumType.STRING)
    @Column(name = "salary_period")
    private SalaryPeriod salaryPeriod;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_status", nullable = false)
    private CurrentStatus currentStatus = CurrentStatus.APPLIED;

    private String notes;
}
