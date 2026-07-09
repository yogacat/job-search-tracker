package org.olena.jobsearchtracker.export.service;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.olena.jobsearchtracker.application.repository.*;
import org.olena.jobsearchtracker.company.repository.Company;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ApplicationExportServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private ApplicationEventRepository eventRepository;

    private ApplicationExportService service;

    @BeforeEach
    void setUp() {
        service = new ApplicationExportService(applicationRepository, eventRepository);
    }

    private Company company() {
        Company company = new Company("Acme Corp", "https://acme.example.com", "Berlin", null);
        ReflectionTestUtils.setField(company, "id", 1L);
        return company;
    }

    private Application application(Company company, LocalDate appliedOn, CurrentStatus status) {
        Application application = new Application(
                company,
                "Software Engineer",
                "https://acme.example.com/careers/123",
                "Remote",
                WorkMode.REMOTE,
                Source.LINKEDIN,
                appliedOn,
                new BigDecimal("90000.00"),
                new BigDecimal("110000.00"),
                SalaryPeriod.YEAR,
                status,
                null
        );
        ReflectionTestUtils.setField(application, "id", 1L);
        return application;
    }

    private ApplicationEvent event(Application application, LocalDate occurredOn, EventType type, String note) {
        ApplicationEvent event = new ApplicationEvent(application, occurredOn, type, note);
        ReflectionTestUtils.setField(event, "id", 1L);
        return event;
    }

    private String cell(Sheet sheet, int rowIdx, int colIdx) {
        return sheet.getRow(rowIdx).getCell(colIdx).getStringCellValue();
    }

    @Test
    void testExportPeriodReport_writesNewApplicationsAndFilteredStatusUpdates() throws IOException {
        LocalDate from = LocalDate.of(2026, 1, 1);
        LocalDate to = LocalDate.of(2026, 1, 31);
        Company company = company();

        Application newApplication = application(company, LocalDate.of(2026, 1, 15), CurrentStatus.INTERVIEW);
        when(applicationRepository.findByAppliedOnBetweenOrderByAppliedOnAsc(from, to))
                .thenReturn(List.of(newApplication));

        Application oldApplication = application(company, LocalDate.of(2025, 12, 1), CurrentStatus.OFFER);
        Application applicationAppliedDuringPeriod = application(company, LocalDate.of(2026, 1, 5), CurrentStatus.INTERVIEW);

        ApplicationEvent includedEvent = event(oldApplication, LocalDate.of(2026, 1, 10), EventType.OFFER, "Great interview");
        ApplicationEvent includedEventNoNote = event(oldApplication, LocalDate.of(2026, 1, 11), EventType.REJECTED, null);
        ApplicationEvent excludedByAppliedType = event(oldApplication, LocalDate.of(2026, 1, 12), EventType.APPLIED, null);
        ApplicationEvent excludedByNotBeforePeriod = event(applicationAppliedDuringPeriod, LocalDate.of(2026, 1, 20), EventType.INTERVIEW, null);

        when(eventRepository.findByOccurredOnBetweenOrderByOccurredOnAsc(from, to))
                .thenReturn(List.of(includedEvent, includedEventNoNote, excludedByAppliedType, excludedByNotBeforePeriod));

        byte[] bytes = service.exportPeriodReport(from, to);

        try (XSSFWorkbook workbook = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
            assertEquals(2, workbook.getNumberOfSheets());

            Sheet newApplicationsSheet = workbook.getSheetAt(0);
            assertEquals("Neue Bewerbungen", newApplicationsSheet.getSheetName());
            assertEquals("Datum", cell(newApplicationsSheet, 0, 0));
            assertEquals("Firma", cell(newApplicationsSheet, 0, 1));
            assertEquals("Position", cell(newApplicationsSheet, 0, 2));
            assertEquals("Status / Ergebnis", cell(newApplicationsSheet, 0, 3));
            assertEquals(1, newApplicationsSheet.getLastRowNum());
            assertEquals("15.01.2026", cell(newApplicationsSheet, 1, 0));
            assertEquals("Acme Corp", cell(newApplicationsSheet, 1, 1));
            assertEquals("Software Engineer", cell(newApplicationsSheet, 1, 2));
            assertEquals("Interview", cell(newApplicationsSheet, 1, 3));

            Sheet updatesSheet = workbook.getSheetAt(1);
            assertEquals("Status-Updates", updatesSheet.getSheetName());
            assertEquals("Datum der Änderung", cell(updatesSheet, 0, 0));
            assertEquals("Firma", cell(updatesSheet, 0, 1));
            assertEquals("Position", cell(updatesSheet, 0, 2));
            assertEquals("Beworben am", cell(updatesSheet, 0, 3));
            assertEquals("Neuer Status", cell(updatesSheet, 0, 4));
            assertEquals("Notiz", cell(updatesSheet, 0, 5));

            // only includedEvent and includedEventNoNote survive the "before period" + "not APPLIED" filters
            assertEquals(2, updatesSheet.getLastRowNum());

            assertEquals("10.01.2026", cell(updatesSheet, 1, 0));
            assertEquals("Acme Corp", cell(updatesSheet, 1, 1));
            assertEquals("Software Engineer", cell(updatesSheet, 1, 2));
            assertEquals("01.12.2025", cell(updatesSheet, 1, 3));
            assertEquals("Offer", cell(updatesSheet, 1, 4));
            assertEquals("Great interview", cell(updatesSheet, 1, 5));

            assertEquals("11.01.2026", cell(updatesSheet, 2, 0));
            assertEquals("Rejected", cell(updatesSheet, 2, 4));
            assertEquals("", cell(updatesSheet, 2, 5));
        }
    }

    @Test
    void testExportPeriodReport_writesHeaderOnlySheets_whenNoData() throws IOException {
        LocalDate from = LocalDate.of(2026, 1, 1);
        LocalDate to = LocalDate.of(2026, 1, 31);

        when(applicationRepository.findByAppliedOnBetweenOrderByAppliedOnAsc(from, to)).thenReturn(List.of());
        when(eventRepository.findByOccurredOnBetweenOrderByOccurredOnAsc(from, to)).thenReturn(List.of());

        byte[] bytes = service.exportPeriodReport(from, to);

        try (XSSFWorkbook workbook = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
            assertEquals(2, workbook.getNumberOfSheets());
            assertEquals(0, workbook.getSheetAt(0).getLastRowNum());
            assertEquals(0, workbook.getSheetAt(1).getLastRowNum());
        }
    }
}
