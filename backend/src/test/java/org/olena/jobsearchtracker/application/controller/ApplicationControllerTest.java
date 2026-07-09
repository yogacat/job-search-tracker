package org.olena.jobsearchtracker.application.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.Test;
import org.olena.jobsearchtracker.application.dto.CreateApplicationRequest;
import org.olena.jobsearchtracker.application.dto.UpdateApplicationRequest;
import org.olena.jobsearchtracker.application.repository.*;
import org.olena.jobsearchtracker.application.service.ApplicationService;
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

@WebMvcTest(ApplicationController.class)
class ApplicationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    @MockitoBean
    private ApplicationService service;

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
    void testList_returnsAllApplications() throws Exception {
        Application application = application(company());
        when(service.list(null)).thenReturn(List.of(application));

        mockMvc.perform(get("/api/applications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].roleTitle").value("Software Engineer"))
                .andExpect(jsonPath("$[0].company.id").value(42))
                .andExpect(jsonPath("$[0].company.name").value("Acme Corp"))
                .andExpect(jsonPath("$[0].workMode").value("REMOTE"))
                .andExpect(jsonPath("$[0].source").value("REFERRAL"))
                .andExpect(jsonPath("$[0].appliedOn").value("2026-07-01"))
                .andExpect(jsonPath("$[0].salaryMin").value(90000.00))
                .andExpect(jsonPath("$[0].salaryMax").value(110000.00))
                .andExpect(jsonPath("$[0].salaryPeriod").value("YEAR"))
                .andExpect(jsonPath("$[0].currentStatus").value("APPLIED"))
                .andExpect(jsonPath("$[0].notes").value("Referred by a friend"));
    }

    @Test
    void testList_returnsApplicationsByCompanyId() throws Exception {
        Company company = company();
        Application application = application(company);
        when(service.list(42L)).thenReturn(List.of(application));

        mockMvc.perform(get("/api/applications").param("companyId", "42"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].company.id").value(42));
    }

    @Test
    void testGet_returnsApplicationByID() throws Exception {
        Company company = company();
        Application application = application(company);
        when(service.get(42L)).thenReturn(application);

        mockMvc.perform(get("/api/applications/42"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.company.id").value(42));
    }

    @Test
    void testGet_returnsNotFoundException() throws Exception {
        when(service.get(42L)).thenThrow(new NotFoundException("Application 42 not found"));

        mockMvc.perform(get("/api/applications/42"))
                .andExpect(status().isNotFound());
    }

    private CreateApplicationRequest createApplicationRequest() {
        return new CreateApplicationRequest(
                1L,
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
    void testCreate_returnsCreatedApplication() throws Exception {
        CreateApplicationRequest request = createApplicationRequest();

        Company company = company();
        Application application = application(company);
        when(service.create(any())).thenReturn(application);

        mockMvc.perform(
                        post("/api/applications")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.company.id").value(42))
                .andExpect(jsonPath("$.appliedOn").value("2026-07-01"));
    }

    @Test
    void testCreate_returnsBadRequest_whenRoleTitleBlank() throws Exception {
        CreateApplicationRequest request = new CreateApplicationRequest(
                1L,
                "",
                "https://acme.example.com/careers/123",
                "Remote",
                WorkMode.REMOTE,
                Source.REFERRAL,
                LocalDate.of(2026, 7, 1),
                new BigDecimal("90000.00"),
                new BigDecimal("110000.00"),
                SalaryPeriod.YEAR,
                "Referred by a friend");

        mockMvc.perform(
                        post("/api/applications")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("roleTitle")));

        verifyNoInteractions(service);
    }

    private UpdateApplicationRequest updateApplicationRequest() {
        return new UpdateApplicationRequest(
                1L,
                "Senior Software Engineer",
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
    }

    @Test
    void testUpdate_returnsUpdated() throws Exception {
        UpdateApplicationRequest request = updateApplicationRequest();

        Company company = company();
        Application application = application(company);
        when(service.update(anyLong(), any())).thenReturn(application);

        mockMvc.perform(
                        put("/api/applications/42")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.company.id").value(42))
                .andExpect(jsonPath("$.appliedOn").value("2026-07-01"));
    }

    @Test
    void testUpdate_returnsNotFound() throws Exception {
        UpdateApplicationRequest request = updateApplicationRequest();

        when(service.update(anyLong(), any())).thenThrow(new NotFoundException("Application 42 not found"));

        mockMvc.perform(
                        put("/api/applications/42")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isNotFound());
    }

    @Test
    void testDelete_returnsNoContent() throws Exception {
        doNothing().when(service).delete(anyLong());

        mockMvc.perform(delete("/api/applications/42"))
                .andExpect(status().isNoContent());
    }

    @Test
    void testDelete_returnsNotFound() throws Exception {
        doThrow(new NotFoundException("Application 42 not found")).when(service).delete(anyLong());

        mockMvc.perform(delete("/api/applications/42"))
                .andExpect(status().isNotFound());
    }
}
