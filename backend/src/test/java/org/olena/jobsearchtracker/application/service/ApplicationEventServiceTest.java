package org.olena.jobsearchtracker.application.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.olena.jobsearchtracker.application.dto.CreateApplicationEventRequest;
import org.olena.jobsearchtracker.application.repository.*;
import org.olena.jobsearchtracker.common.NotFoundException;
import org.olena.jobsearchtracker.company.repository.Company;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationEventServiceTest {

    @Mock
    private ApplicationEventRepository repository;

    @Mock
    private ApplicationService applicationService;

    private ApplicationEventService service;

    @BeforeEach
    void setUp() {
        service = new ApplicationEventService(repository, applicationService);
    }

    private Company company() {
        Company company = new Company("Acme Corp", "https://acme.example.com", "Berlin", null);
        ReflectionTestUtils.setField(company, "id", 42L);
        return company;
    }

    private Application application() {
        Application application = new Application(
                company(),
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

    private ApplicationEvent applicationEvent(Application application) {
        ApplicationEvent event = new ApplicationEvent(application, LocalDate.of(2026, 7, 1), EventType.APPLIED, null);
        ReflectionTestUtils.setField(event, "id", 1L);
        return event;
    }

    @Test
    void testList_returnsAll() {
        ApplicationEvent event = applicationEvent(application());
        when(repository.findByApplicationId(1L)).thenReturn(List.of(event));

        var result = service.list(1L);
        assertEquals(List.of(event), result);
    }

    @Test
    void testGet_returnsApplicationEvent() {
        ApplicationEvent event = applicationEvent(application());
        when(repository.findById(1L)).thenReturn(Optional.of(event));

        var result = service.get(1L);
        assertEquals(event, result);
    }

    @Test
    void testGet_throwsNotFoundException() {
        when(repository.findById(1L)).thenReturn(Optional.empty());

        Exception exception = assertThrows(NotFoundException.class, () -> service.get(1L));

        assertEquals("Event 1 not found", exception.getMessage());
    }

    private CreateApplicationEventRequest createApplicationEventRequest() {
        return new CreateApplicationEventRequest(LocalDate.of(2026, 7, 10), EventType.INTERVIEW, "Phone screen");
    }

    @Test
    void testCreate_returnsApplicationEvent() {
        Application application = application();
        when(applicationService.get(1L)).thenReturn(application);
        when(repository.save(any(ApplicationEvent.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var request = createApplicationEventRequest();
        var result = service.create(1L, request);

        assertSame(application, result.getApplication());
        assertEquals(request.occurredOn(), result.getOccurredOn());
        assertEquals(request.type(), result.getEventType());
        assertEquals(request.note(), result.getNote());
    }

    @Test
    void testCreate_throwsNotFoundException_whenApplicationNotFound() {
        when(applicationService.get(1L)).thenThrow(new NotFoundException("Application 1 not found"));

        Exception exception = assertThrows(NotFoundException.class, () ->
                service.create(1L, createApplicationEventRequest()));

        assertEquals("Application 1 not found", exception.getMessage());
        verifyNoInteractions(repository);
    }

    @Test
    void testDelete_succeeds() {
        ApplicationEvent event = applicationEvent(application());
        when(repository.findById(1L)).thenReturn(Optional.of(event));

        service.delete(1L);

        verify(repository).delete(event);
    }

    @Test
    void testDelete_throwsNotFoundException_whenApplicationNotFound() {
        when(repository.findById(1L)).thenReturn(Optional.empty());

        Exception exception = assertThrows(NotFoundException.class, () -> service.delete(1L));

        assertEquals("Event 1 not found", exception.getMessage());
        verify(repository, never()).delete(any());
    }
}
