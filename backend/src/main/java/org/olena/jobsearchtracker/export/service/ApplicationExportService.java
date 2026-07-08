package org.olena.jobsearchtracker.export.service;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.olena.jobsearchtracker.application.repository.Application;
import org.olena.jobsearchtracker.application.repository.ApplicationEvent;
import org.olena.jobsearchtracker.application.repository.ApplicationEventRepository;
import org.olena.jobsearchtracker.application.repository.ApplicationRepository;
import org.olena.jobsearchtracker.application.repository.EventType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

/**
 * Builds the periodic Agentur für Arbeit report: one sheet of applications newly submitted in the
 * period, and a second sheet of status changes on applications submitted before the period (so a
 * caseworker can see both new effort and how earlier applications turned out).
 */
@Service
@Transactional(readOnly = true)
public class ApplicationExportService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd.MM.yyyy");

    private final ApplicationRepository applicationRepository;
    private final ApplicationEventRepository eventRepository;

    public ApplicationExportService(ApplicationRepository applicationRepository, ApplicationEventRepository eventRepository) {
        this.applicationRepository = applicationRepository;
        this.eventRepository = eventRepository;
    }

    public byte[] exportPeriodReport(LocalDate from, LocalDate to) {
        List<Application> newApplications = applicationRepository.findByAppliedOnBetweenOrderByAppliedOnAsc(from, to);
        List<ApplicationEvent> updates = eventRepository.findByOccurredOnBetweenOrderByOccurredOnAsc(from, to).stream()
                .filter(e -> e.getApplication().getAppliedOn().isBefore(from))
                .filter(e -> e.getEventType() != EventType.APPLIED)
                .toList();

        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            CellStyle headerStyle = headerStyle(workbook);

            writeNewApplicationsSheet(workbook, headerStyle, newApplications);
            writeUpdatesSheet(workbook, headerStyle, updates);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    private void writeNewApplicationsSheet(XSSFWorkbook workbook, CellStyle headerStyle, List<Application> applications) {
        String[] columns = {"Datum", "Firma", "Position", "Art der Bewerbung", "Status / Ergebnis", "Link"};
        Sheet sheet = workbook.createSheet("Neue Bewerbungen");
        writeHeader(sheet, headerStyle, columns);

        int rowIdx = 1;
        for (Application app : applications) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(app.getAppliedOn().format(DATE_FMT));
            row.createCell(1).setCellValue(app.getCompany().getName());
            row.createCell(2).setCellValue(app.getRoleTitle());
            row.createCell(3).setCellValue(sentenceCase(app.getSource().name()));
            row.createCell(4).setCellValue(sentenceCase(app.getCurrentStatus().name()));
            row.createCell(5).setCellValue(app.getPostingUrl() != null ? app.getPostingUrl() : "");
        }
        autoSizeColumns(sheet, columns.length);
    }

    private void writeUpdatesSheet(XSSFWorkbook workbook, CellStyle headerStyle, List<ApplicationEvent> updates) {
        String[] columns = {"Datum der Änderung", "Firma", "Position", "Beworben am", "Neuer Status", "Notiz"};
        Sheet sheet = workbook.createSheet("Status-Updates");
        writeHeader(sheet, headerStyle, columns);

        int rowIdx = 1;
        for (ApplicationEvent event : updates) {
            Application app = event.getApplication();
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(event.getOccurredOn().format(DATE_FMT));
            row.createCell(1).setCellValue(app.getCompany().getName());
            row.createCell(2).setCellValue(app.getRoleTitle());
            row.createCell(3).setCellValue(app.getAppliedOn().format(DATE_FMT));
            row.createCell(4).setCellValue(sentenceCase(event.getEventType().name()));
            row.createCell(5).setCellValue(event.getNote() != null ? event.getNote() : "");
        }
        autoSizeColumns(sheet, columns.length);
    }

    private void writeHeader(Sheet sheet, CellStyle headerStyle, String[] columns) {
        Row header = sheet.createRow(0);
        for (int i = 0; i < columns.length; i++) {
            Cell cell = header.createCell(i);
            cell.setCellValue(columns[i]);
            cell.setCellStyle(headerStyle);
        }
    }

    private void autoSizeColumns(Sheet sheet, int columnCount) {
        for (int i = 0; i < columnCount; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private CellStyle headerStyle(Workbook workbook) {
        Font boldFont = workbook.createFont();
        boldFont.setBold(true);
        CellStyle style = workbook.createCellStyle();
        style.setFont(boldFont);
        return style;
    }

    private String sentenceCase(String value) {
        String lower = value.replace('_', ' ').toLowerCase(Locale.ROOT);
        return Character.toUpperCase(lower.charAt(0)) + lower.substring(1);
    }
}
