package org.olena.jobsearchtracker.application.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.olena.jobsearchtracker.application.dto.CreateApplicationRequest;
import org.olena.jobsearchtracker.application.dto.UpdateApplicationRequest;
import org.olena.jobsearchtracker.application.repository.*;
import org.olena.jobsearchtracker.common.NotFoundException;
import org.olena.jobsearchtracker.company.repository.Company;
import org.olena.jobsearchtracker.company.service.CompanyService;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {
    @Mock
    private ApplicationRepository repository;

    @Mock
    private ApplicationEventRepository eventRepository;

    @Mock
    private CompanyService companyService;

    private ApplicationService service;

    @BeforeEach
    void setUp() {
        service = new ApplicationService(repository, eventRepository, companyService);
    }

    private Application application(Company company) {
        Application application = new Application(
                company,
                "Software Engineer",
                "https://acme.example.com/careers/123",
                "Remote",
                WorkMode.REMOTE,
                Source.REFERRAL,
                LocalDate.of(2026, 7, 1),
                new BigDecimal("90000.00"),
                new BigDecimal("110000.00"),
                SalaryPeriod.YEAR,
                CurrentStatus.APPLIED,
                "Referred by a friend"
        );
        ReflectionTestUtils.setField(application, "id", 1L);
        return application;
    }

    private Company company() {
        Company company = new Company("Acme Corp", "https://acme.example.com", "Berlin", null);
        ReflectionTestUtils.setField(company, "id", 42L);
        return company;
    }

    @Test
    void testList_byCompanyId() {
        Application application = application(company());
        when(repository.findByCompanyId(1L)).thenReturn(List.of(application));

        var result = service.list(1L);
        assertEquals(List.of(application), result);
    }

    @Test
    void testList_returnsAll() {
        Application application = application(company());
        when(repository.findAll()).thenReturn(List.of(application));

        var result = service.list(null);
        assertEquals(List.of(application), result);
    }

    @Test
    void testGet_returnsApplication() {
        Application application = application(company());
        when(repository.findById(anyLong())).thenReturn(Optional.of(application));

        var result = service.get(1L);
        assertEquals(application, result);
    }

    @Test
    void testGet_throwsNotFoundException() {
        when(repository.findById(anyLong())).thenReturn(Optional.empty());

        Exception exception = assertThrows(NotFoundException.class, () -> {
            service.get(1L);
        });

        assertEquals("Application 1 not found", exception.getMessage());
    }

    private CreateApplicationRequest createApplicationRequest() {
        return new CreateApplicationRequest(
               42L,
                "Software Engineer",
                "https://acme.example.com/careers/123",
                "Remote",
                WorkMode.REMOTE,
                Source.REFERRAL,
                LocalDate.of(2026, 7, 1),
                new BigDecimal("90000.00"),
                new BigDecimal("110000.00"),
                SalaryPeriod.YEAR,
                "Referred by a friend");
    }

    @Test
    void testCreate_returnsApplication() {
        Company company = company();
        when(companyService.get(42L)).thenReturn(company);

        var request = createApplicationRequest();
        var result = service.create(createApplicationRequest());

        assertEquals(company, result.getCompany());
        assertEquals(request.roleTitle(), result.getRoleTitle());
        assertEquals(request.appliedOn(), result.getAppliedOn());
        assertEquals(CurrentStatus.APPLIED, result.getCurrentStatus());
        assertNull(result.getId());

        verify(repository).save(result);
        verify(eventRepository).save(argThat(event ->
                event.getApplication() == result
                        && event.getEventType() == EventType.APPLIED
                        && event.getOccurredOn().equals(request.appliedOn())
        ));
    }

    @Test
    void testCreate_throwsNotFoundException_whenCompanyNotFound() {
        when(companyService.get(42L)).thenThrow(new NotFoundException("Company 1 not found"));

        Exception exception = assertThrows(NotFoundException.class, () -> {
            service.create(createApplicationRequest());
        });

        assertEquals("Company 1 not found", exception.getMessage());
    }

    private UpdateApplicationRequest updateApplicationRequest(CurrentStatus currentStatus) {
        return new UpdateApplicationRequest(
                42L,
                "Senior Software Engineer",
                "https://acme.example.com/careers/456",
                "Hybrid",
                WorkMode.HYBRID,
                Source.LINKEDIN,
                LocalDate.of(2026, 7, 5),
                new BigDecimal("100000.00"),
                new BigDecimal("120000.00"),
                SalaryPeriod.YEAR,
                currentStatus,
                "Updated notes");
    }

    @Test
    void testUpdate_returnsApplication() {
        Company company = company();
        Application application = application(company);
        when(repository.findById(1L)).thenReturn(Optional.of(application));
        when(companyService.get(42L)).thenReturn(company);

        UpdateApplicationRequest request = updateApplicationRequest(CurrentStatus.APPLIED);
        var result = service.update(1L, request);

        assertSame(application, result);
        assertEquals(company, result.getCompany());
        assertEquals(request.roleTitle(), result.getRoleTitle());
        assertEquals(request.postingUrl(), result.getPostingUrl());
        assertEquals(request.location(), result.getLocation());
        assertEquals(request.workMode(), result.getWorkMode());
        assertEquals(request.source(), result.getSource());
        assertEquals(request.appliedOn(), result.getAppliedOn());
        assertEquals(request.salaryMin(), result.getSalaryMin());
        assertEquals(request.salaryMax(), result.getSalaryMax());
        assertEquals(request.salaryPeriod(), result.getSalaryPeriod());
        assertEquals(request.currentStatus(), result.getCurrentStatus());
        assertEquals(request.notes(), result.getNotes());

        verifyNoInteractions(eventRepository);
    }

    @Test
    void testUpdate_throwsNotFoundException_whenCompanyNotFound() {
        Application application = application(company());
        when(repository.findById(1L)).thenReturn(Optional.of(application));
        when(companyService.get(42L)).thenThrow(new NotFoundException("Company 42 not found"));

        Exception exception = assertThrows(NotFoundException.class, () ->
                service.update(1L, updateApplicationRequest(CurrentStatus.APPLIED)));

        assertEquals("Company 42 not found", exception.getMessage());
    }

    @Test
    void testUpdate_throwsNotFoundException_whenApplicationNotFound() {
        when(repository.findById(1L)).thenReturn(Optional.empty());

        Exception exception = assertThrows(NotFoundException.class, () ->
                service.update(1L, updateApplicationRequest(CurrentStatus.APPLIED)));

        assertEquals("Application 1 not found", exception.getMessage());
        verifyNoInteractions(companyService);
    }

    @Test
    void testUpdate_createsApplicationEventOnStatusChange() {
        Company company = company();
        Application application = application(company);
        when(repository.findById(1L)).thenReturn(Optional.of(application));
        when(companyService.get(42L)).thenReturn(company);

        var result = service.update(1L, updateApplicationRequest(CurrentStatus.INTERVIEW));

        assertEquals(CurrentStatus.INTERVIEW, result.getCurrentStatus());
        verify(eventRepository).save(argThat(event ->
                event.getApplication() == result
                        && event.getEventType() == EventType.INTERVIEW
                        && event.getOccurredOn().equals(LocalDate.now())
        ));
    }

    @Test
    void testDelete_succeeds() {
        Application application = application(company());
        when(repository.findById(1L)).thenReturn(Optional.of(application));

        service.delete(1L);

        verify(repository).delete(application);
    }

    @Test
    void testDelete_throwsNotFoundException_whenApplicationNotFound() {
        when(repository.findById(1L)).thenReturn(Optional.empty());

        Exception exception = assertThrows(NotFoundException.class, () -> service.delete(1L));

        assertEquals("Application 1 not found", exception.getMessage());
        verify(repository, never()).delete(any());
    }
}
