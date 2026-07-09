package org.olena.jobsearchtracker.company.repository;

import org.junit.jupiter.api.Test;
import org.olena.jobsearchtracker.config.JpaAuditingConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@DataJpaTest
@Import(JpaAuditingConfig.class)
class CompanyRepositoryTest {

    @Autowired
    private CompanyRepository repository;

    @Test
    void testSave_persistsCompany() {
        Company company = new Company("Acme Corp", "https://acme.example.com", "Berlin", "Great culture");

        Company saved = repository.save(company);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
    }

    @Test
    void testSave_throwsOnDuplicateName() {
        repository.saveAndFlush(new Company("Acme Corp", null, null, null));

        assertThrows(DataIntegrityViolationException.class, () ->
                repository.saveAndFlush(new Company("Acme Corp", null, null, null)));
    }

    @Test
    void testFindById_returnsSavedCompany() {
        Company saved = repository.saveAndFlush(new Company("Acme Corp", "https://acme.example.com", "Berlin", null));

        var found = repository.findById(saved.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Acme Corp");
    }
}
