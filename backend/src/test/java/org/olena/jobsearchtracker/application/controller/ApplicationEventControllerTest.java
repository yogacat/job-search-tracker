package org.olena.jobsearchtracker.application.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.Test;
import org.olena.jobsearchtracker.application.dto.CreateApplicationEventRequest;
import org.olena.jobsearchtracker.application.repository.*;
import org.olena.jobsearchtracker.application.service.ApplicationEventService;
import org.olena.jobsearchtracker.common.NotFoundException;
import org.olena.jobsearchtracker.company.repository.Company;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ApplicationEventController.class)
class ApplicationEventControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    @MockitoBean
    private ApplicationEventService service;

    private Company company() {
        Company company = new Company("Acme Corp", "https://acme.example.com", "Berlin", null);
        ReflectionTestUtils.setField(company, "id", 42L);
        return company;
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

    private ApplicationEvent applicationEvent() {

        ApplicationEvent event = new ApplicationEvent(
                application(company()),
                LocalDate.of(2026, 7, 1),
                EventType.APPLIED,
                "Sent an application"
        );
        ReflectionTestUtils.setField(event, "id", 1L);
        return event;
    }

    @Test
    void testList_returnsAllApplicationEvents() throws Exception {
        ApplicationEvent applicationEvent = applicationEvent();
        when(service.list(anyLong())).thenReturn(List.of(applicationEvent));

        mockMvc.perform(get("/api/applications/1/events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].occurredOn").value("2026-07-01"))
                .andExpect(jsonPath("$[0].type").value("APPLIED"))
                .andExpect(jsonPath("$[0].note").value("Sent an application"));
    }

    @Test
    void testCreate_returnsCreatedApplicationEvent() throws Exception {
        CreateApplicationEventRequest request = new CreateApplicationEventRequest(
                LocalDate.of(2026, 7, 1),
                EventType.APPLIED,
                "Sent an application"
        );

        ApplicationEvent applicationEvent = applicationEvent();
        when(service.create(anyLong(), any())).thenReturn(applicationEvent);

        mockMvc.perform(
                        post("/api/applications/1/events")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.occurredOn").value("2026-07-01"))
                .andExpect(jsonPath("$.type").value("APPLIED"))
                .andExpect(jsonPath("$.note").value("Sent an application"));
    }

    @Test
    void testCreate_returnsBadRequest_whenOccurredOnMissing() throws Exception {
        CreateApplicationEventRequest request = new CreateApplicationEventRequest(null, EventType.APPLIED, "Sent an application");

        mockMvc.perform(
                        post("/api/applications/1/events")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("occurredOn")));

        verifyNoInteractions(service);
    }

    @Test
    void testDelete_returnsNoContent() throws Exception {
        doNothing().when(service).delete(anyLong());

        mockMvc.perform(delete("/api/applications/1/events/42"))
                .andExpect(status().isNoContent());
    }

    @Test
    void testDelete_returnsNotFound() throws Exception {
        doThrow(new NotFoundException("ApplicationEvent 42 not found")).when(service).delete(anyLong());

        mockMvc.perform(delete("/api/applications/1/events/42"))
                .andExpect(status().isNotFound());
    }
}