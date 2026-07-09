package org.olena.jobsearchtracker.export.controller;

import org.junit.jupiter.api.Test;
import org.olena.jobsearchtracker.export.service.ApplicationExportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ExportController.class)
class ExportControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ApplicationExportService service;

    @Test
    void testExport_succeeds() throws Exception {
        byte [] bytes = new byte[] {123};
        when(service.exportPeriodReport(any(), any())).thenReturn(bytes);

        LocalDate from = LocalDate.of(2026, 1, 1);
        LocalDate to = LocalDate.of(2026, 1, 31);

        mockMvc.perform(get("/api/export")
                        .param("from", from.toString())
                        .param("to", to.toString()))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"Bewerbungen_2026-01-01_2026-01-31.xlsx\""))
                .andExpect(content().contentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .andExpect(content().bytes(bytes));
    }

}