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
class ApplicationRepositoryTest {

    @Autowired
    private ApplicationRepository repository;

    @Autowired
    private CompanyRepository companyRepository;

    private Company company(String name) {
        return companyRepository.saveAndFlush(new Company(name, null, null, null));
    }

    private Application application(Company company, LocalDate appliedOn) {
        return new Application(
                company,
                "Software Engineer",
                null,
                null,
                WorkMode.REMOTE,
                Source.LINKEDIN,
                appliedOn,
                new BigDecimal("90000.00"),
                new BigDecimal("110000.00"),
                SalaryPeriod.YEAR,
                CurrentStatus.APPLIED,
                null
        );
    }

    @Test
    void testFindByCompanyId_returnsOnlyThatCompanysApplications() {
        Company acme = company("Acme Corp");
        Company globex = company("Globex");
        Application acmeApplication = repository.saveAndFlush(application(acme, LocalDate.of(2026, 1, 10)));
        repository.saveAndFlush(application(globex, LocalDate.of(2026, 1, 10)));

        List<Application> result = repository.findByCompanyId(acme.getId());

        assertThat(result).extracting(Application::getId).containsExactly(acmeApplication.getId());
    }

    @Test
    void testFindByAppliedOnBetweenOrderByAppliedOnAsc_includesBoundariesAndSortsAscending() {
        Company company = company("Acme Corp");
        LocalDate from = LocalDate.of(2026, 1, 1);
        LocalDate to = LocalDate.of(2026, 1, 31);

        Application beforeRange = repository.saveAndFlush(application(company, LocalDate.of(2025, 12, 31)));
        Application startBoundary = repository.saveAndFlush(application(company, from));
        Application middle = repository.saveAndFlush(application(company, LocalDate.of(2026, 1, 15)));
        Application endBoundary = repository.saveAndFlush(application(company, to));
        Application afterRange = repository.saveAndFlush(application(company, LocalDate.of(2026, 2, 1)));

        List<Application> result = repository.findByAppliedOnBetweenOrderByAppliedOnAsc(from, to);

        assertThat(result).extracting(Application::getId)
                .containsExactly(startBoundary.getId(), middle.getId(), endBoundary.getId())
                .doesNotContain(beforeRange.getId(), afterRange.getId());
    }
}
