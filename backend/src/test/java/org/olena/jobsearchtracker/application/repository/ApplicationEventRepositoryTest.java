package org.olena.jobsearchtracker.application.repository;

import org.junit.jupiter.api.Test;
import org.olena.jobsearchtracker.company.repository.Company;
import org.olena.jobsearchtracker.company.repository.CompanyRepository;
import org.olena.jobsearchtracker.config.JpaAuditingConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.context.annotation.Import;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Import(JpaAuditingConfig.class)
class ApplicationEventRepositoryTest {

    @Autowired
    private ApplicationEventRepository repository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private CompanyRepository companyRepository;

    private Application application() {
        return application("Acme Corp");
    }

    private Application application(String companyName) {
        Company company = companyRepository.saveAndFlush(new Company(companyName, null, null, null));
        return applicationRepository.saveAndFlush(new Application(
                company,
                "Software Engineer",
                null,
                null,
                WorkMode.REMOTE,
                Source.LINKEDIN,
                LocalDate.of(2026, 1, 1),
                new BigDecimal("90000.00"),
                new BigDecimal("110000.00"),
                SalaryPeriod.YEAR,
                CurrentStatus.APPLIED,
                null
        ));
    }

    private ApplicationEvent event(Application application, LocalDate occurredOn, EventType type) {
        return new ApplicationEvent(application, occurredOn, type, null);
    }

    @Test
    void testFindByApplicationId_returnsOnlyThatApplicationsEvents() {
        Application applicationA = application("Acme Corp");
        Application applicationB = application("Globex");
        ApplicationEvent eventA = repository.saveAndFlush(event(applicationA, LocalDate.of(2026, 1, 5), EventType.APPLIED));
        repository.saveAndFlush(event(applicationB, LocalDate.of(2026, 1, 5), EventType.APPLIED));

        List<ApplicationEvent> result = repository.findByApplicationId(applicationA.getId());

        assertThat(result).extracting(ApplicationEvent::getId).containsExactly(eventA.getId());
    }

    @Test
    void testFindByOccurredOnBetweenOrderByOccurredOnAsc_includesBoundariesAndSortsAscending() {
        Application application = application();
        LocalDate from = LocalDate.of(2026, 1, 1);
        LocalDate to = LocalDate.of(2026, 1, 31);

        ApplicationEvent beforeRange = repository.saveAndFlush(event(application, LocalDate.of(2025, 12, 31), EventType.APPLIED));
        ApplicationEvent startBoundary = repository.saveAndFlush(event(application, from, EventType.APPLIED));
        ApplicationEvent middle = repository.saveAndFlush(event(application, LocalDate.of(2026, 1, 15), EventType.INTERVIEW));
        ApplicationEvent endBoundary = repository.saveAndFlush(event(application, to, EventType.OFFER));
        ApplicationEvent afterRange = repository.saveAndFlush(event(application, LocalDate.of(2026, 2, 1), EventType.ACCEPTED));

        List<ApplicationEvent> result = repository.findByOccurredOnBetweenOrderByOccurredOnAsc(from, to);

        assertThat(result).extracting(ApplicationEvent::getId)
                .containsExactly(startBoundary.getId(), middle.getId(), endBoundary.getId())
                .doesNotContain(beforeRange.getId(), afterRange.getId());
    }
}
