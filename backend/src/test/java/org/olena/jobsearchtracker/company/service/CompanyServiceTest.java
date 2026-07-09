package org.olena.jobsearchtracker.company.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.olena.jobsearchtracker.common.NotFoundException;
import org.olena.jobsearchtracker.company.dto.CreateCompanyRequest;
import org.olena.jobsearchtracker.company.dto.UpdateCompanyRequest;
import org.olena.jobsearchtracker.company.repository.Company;
import org.olena.jobsearchtracker.company.repository.CompanyRepository;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CompanyServiceTest {

    @Mock
    private CompanyRepository repository;

    private CompanyService service;

    @BeforeEach
    void setUp() {
        service = new CompanyService(repository);
    }

    private Company company() {
        Company company = new Company("Acme Corp", "https://acme.example.com", "Berlin", "Great culture");
        ReflectionTestUtils.setField(company, "id", 42L);
        return company;
    }

    @Test
    void testList_returnsAll() {
        Company company = company();
        when(repository.findAll()).thenReturn(List.of(company));

        var result = service.list();
        assertEquals(List.of(company), result);
    }

    @Test
    void testGet_returnsCompany() {
        Company company = company();
        when(repository.findById(42L)).thenReturn(Optional.of(company));

        var result = service.get(42L);
        assertEquals(company, result);
    }

    @Test
    void testGet_throwsNotFoundException() {
        when(repository.findById(42L)).thenReturn(Optional.empty());

        Exception exception = assertThrows(NotFoundException.class, () -> service.get(42L));

        assertEquals("Company 42 not found", exception.getMessage());
    }

    private CreateCompanyRequest createCompanyRequest() {
        return new CreateCompanyRequest("Acme Corp", "https://acme.example.com", "Berlin", "Great culture");
    }

    @Test
    void testCreate_returnsCompany() {
        when(repository.save(any(Company.class))).thenAnswer(invocation -> {
            Company saved = invocation.getArgument(0);
            ReflectionTestUtils.setField(saved, "id", 99L);
            return saved;
        });

        var request = createCompanyRequest();
        var result = service.create(request);

        assertEquals(99L, result.getId());
        assertEquals(request.name(), result.getName());
        assertEquals(request.website(), result.getWebsite());
        assertEquals(request.location(), result.getLocation());
        assertEquals(request.notes(), result.getNotes());

        verify(repository).save(any(Company.class));
    }

    private UpdateCompanyRequest updateCompanyRequest() {
        return new UpdateCompanyRequest("Acme Corporation", "https://acme.example.com/new", "Munich", "Updated notes");
    }

    @Test
    void testUpdate_returnsCompany() {
        Company company = company();
        when(repository.findById(42L)).thenReturn(Optional.of(company));

        var request = updateCompanyRequest();
        var result = service.update(42L, request);

        assertSame(company, result);
        assertEquals(request.name(), result.getName());
        assertEquals(request.website(), result.getWebsite());
        assertEquals(request.location(), result.getLocation());
        assertEquals(request.notes(), result.getNotes());
    }

    @Test
    void testUpdate_throwsNotFoundException_whenCompanyNotFound() {
        when(repository.findById(42L)).thenReturn(Optional.empty());

        Exception exception = assertThrows(NotFoundException.class, () ->
                service.update(42L, updateCompanyRequest()));

        assertEquals("Company 42 not found", exception.getMessage());
    }

    @Test
    void testDelete_succeeds() {
        Company company = company();
        when(repository.findById(42L)).thenReturn(Optional.of(company));

        service.delete(42L);

        verify(repository).delete(company);
    }

    @Test
    void testDelete_throwsNotFoundException_whenCompanyNotFound() {
        when(repository.findById(42L)).thenReturn(Optional.empty());

        Exception exception = assertThrows(NotFoundException.class, () -> service.delete(42L));

        assertEquals("Company 42 not found", exception.getMessage());
        verify(repository, never()).delete(any());
    }
}
