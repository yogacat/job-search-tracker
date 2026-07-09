# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] — 2026-07-09

First release.

### Added
- **Applications** — list with summary stats (total / active / interviews / offers / closed) and a
  left accent bar flagging offers, due-soon/overdue next steps, and closed applications. Add and
  edit applications via dialogs.
- **Application detail** — all fields plus a dated timeline of events ("steps I had there").
- **Statistics** — status funnel (Sankey) with interview-rate and offer-rate metrics.
- **Export .xlsx** — Agentur-für-Arbeit sheet (`Datum | Firma | Position | Art der Bewerbung |
  Status/Ergebnis | Link`) streamed by the backend via Apache POI, for a chosen date range.
- Spring Boot (Java 26) backend over Postgres with Flyway migrations; React/MUI frontend.
- Docker Compose setup (Postgres + backend) and a multi-stage Dockerfile that bundles the built
  frontend into the backend jar.
- CI (backend tests, frontend lint + build), CodeQL analysis, and PR labeler workflows.
- Individual Noncommercial Use License.
- Maven wrapper (`./mvnw`) for reproducible backend builds.

[0.1.0]: https://github.com/yogacat/job-search-tracker/releases/tag/v0.1.0
