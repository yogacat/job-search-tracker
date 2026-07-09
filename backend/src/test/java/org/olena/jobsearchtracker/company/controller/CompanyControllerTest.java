package org.olena.jobsearchtracker.company.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.Test;
import org.olena.jobsearchtracker.common.NotFoundException;
import org.olena.jobsearchtracker.company.dto.CreateCompanyRequest;
import org.olena.jobsearchtracker.company.dto.UpdateCompanyRequest;
import org.olena.jobsearchtracker.company.repository.Company;
import org.olena.jobsearchtracker.company.service.CompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CompanyController.class)
class CompanyControllerTest {
    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    @MockitoBean
    private CompanyService service;

    private Company company() {
        Company company = new Company("Acme Corp", "https://acme.example.com", "Berlin", null);
        ReflectionTestUtils.setField(company, "id", 42L);
        return company;
    }

    @Test
    void testList_returnsAllCompanies() throws Exception {
        when(service.list()).thenReturn(List.of(company()));

        mockMvc.perform(get("/api/companies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(42))
                .andExpect(jsonPath("$[0].name").value("Acme Corp"))
                .andExpect(jsonPath("$[0].website").value("https://acme.example.com"))
                .andExpect(jsonPath("$[0].location").value("Berlin"));
    }

    @Test
    void testGet_returnsApplicationByID() throws Exception {
        when(service.get(42L)).thenReturn(company());

        mockMvc.perform(get("/api/companies/42"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(42))
                .andExpect(jsonPath("$.name").value("Acme Corp"));
    }

    @Test
    void testGet_returnsNotFoundException() throws Exception {
        when(service.get(42L)).thenThrow(new NotFoundException("Company 42 not found"));

        mockMvc.perform(get("/api/companies/42"))
                .andExpect(status().isNotFound());
    }

    private CreateCompanyRequest createCompanyRequest() {
        return new CreateCompanyRequest(
                "Acme Corp",
                "https://acme.example.com",
                "Berlin",
                null);
    }

    @Test
    void testCreate_returnsCreatedCompany() throws Exception {
        CreateCompanyRequest request = createCompanyRequest();
        when(service.create(any())).thenReturn(company());

        mockMvc.perform(
                        post("/api/companies")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(42))
                .andExpect(jsonPath("$.name").value("Acme Corp"));
    }

    @Test
    void testCreate_returnsBadRequest_whenNameBlank() throws Exception {
        CreateCompanyRequest request = new CreateCompanyRequest("", "https://acme.example.com", "Berlin", null);

        mockMvc.perform(
                        post("/api/companies")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("name")));

        verifyNoInteractions(service);
    }

    @Test
    void testCreate_returnsConflict_whenNameAlreadyExists() throws Exception {
        CreateCompanyRequest request = createCompanyRequest();
        when(service.create(any())).thenThrow(new DataIntegrityViolationException("duplicate key value violates unique constraint"));

        mockMvc.perform(
                        post("/api/companies")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("That name is already in use."));
    }

    private UpdateCompanyRequest updateCompanyRequest() {
        return new UpdateCompanyRequest(
                "Acme Corp",
                "https://acme.example.com",
                "Berlin",
                null
        );
    }

    @Test
    void testUpdate_returnsUpdated() throws Exception {
        UpdateCompanyRequest request = updateCompanyRequest();

        when(service.update(anyLong(), any())).thenReturn(company());

        mockMvc.perform(
                        put("/api/companies/42")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(42))
                .andExpect(jsonPath("$.name").value("Acme Corp"));
    }

    @Test
    void testUpdate_returnsNotFound() throws Exception {
        UpdateCompanyRequest request = updateCompanyRequest();

        when(service.update(anyLong(), any())).thenThrow(new NotFoundException("Application 42 not found"));

        mockMvc.perform(
                        put("/api/companies/42")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isNotFound());
    }

    @Test
    void testUpdate_returnsBadRequest_whenNameBlank() throws Exception {
        UpdateCompanyRequest request = new UpdateCompanyRequest("", "https://acme.example.com", "Berlin", null);

        mockMvc.perform(
                        put("/api/companies/42")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("name")));

        verifyNoInteractions(service);
    }

    @Test
    void testUpdate_returnsConflict_whenNameAlreadyExists() throws Exception {
        UpdateCompanyRequest request = updateCompanyRequest();
        when(service.update(anyLong(), any())).thenThrow(new DataIntegrityViolationException("duplicate key value violates unique constraint"));

        mockMvc.perform(
                        put("/api/companies/42")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("That name is already in use."));
    }

    @Test
    void testDelete_returnsNoContent() throws Exception {
        doNothing().when(service).delete(anyLong());

        mockMvc.perform(delete("/api/companies/42"))
                .andExpect(status().isNoContent());
    }

    @Test
    void testDelete_returnsNotFound() throws Exception {
        doThrow(new NotFoundException("Company 42 not found")).when(service).delete(anyLong());

        mockMvc.perform(delete("/api/companies/42"))
                .andExpect(status().isNotFound());
    }
}