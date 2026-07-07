# Job Search Tracker

Track roles you're applying to — status, the steps at each company (screening, interview,
task, offer, rejection), and what's next — then export a one-row-per-application list for the
**Agentur für Arbeit** as proof of your Eigenbemühungen.

Single-user, self-hosted, same shape as the Zalando Pipeline app (Spring Boot backend +
React/MUI frontend). The backend is written separately.

## Frontend (UI mock)

MUI mock wired to in-memory seed data — no backend required. It reuses the Zalando app's
design system (teal accent, quiet status dots, 3px left accent bar, Inter + tabular numerals).

```bash
cd frontend
npm install
npm run dev        # http://localhost:5174
```

### What the mock shows
- **Applications** — list with summary stats (total / active / interviews / offers / closed),
  a left accent bar that flags offers (green), due-soon next steps (orange) and overdue (red),
  and closed applications (gray). Add applications via the dialog.
- **Application detail** — all fields plus a dated **timeline** ("steps I had there"); add steps.
- **Statistics** — status funnel with interview-rate / offer-rate metrics.
- **Export .xlsx** (top-right) — previews the exact Agentur-für-Arbeit sheet
  (`Datum | Firma | Position | Art der Bewerbung | Status/Ergebnis | Link`) and downloads a CSV
  stand-in. The real backend streams a formatted `.xlsx` via Apache POI.

## Suggested backend shape (for reference)
- `JobApplication` + `ApplicationEvent` entities (see `frontend/src/types.ts` for fields).
- `ApplicationStatusMachine` for legal transitions (`APPLIED → SCREENING → INTERVIEW → OFFER →
  ACCEPTED`, with `REJECTED / WITHDRAWN / GHOSTED` reachable from anywhere).
- `GET /api/applications/export.xlsx` — Apache POI, one row per application + a summary sheet.
