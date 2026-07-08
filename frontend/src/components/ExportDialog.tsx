import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { useStore } from "../store";
import { exportUrl } from "../api";
import { formatDate, sentenceCase } from "../format";
import type { ApplicationEvent, JobApplication } from "../types";

// The Agentur für Arbeit export covers a date range (from/to) — the report is submitted roughly
// every two months. It carries two groups of rows, mirroring the two sheets the backend (Apache
// POI) generates: applications newly submitted in the range, and status changes on applications
// submitted before the range, so a caseworker can see both new effort and how earlier
// applications turned out.

const NEW_COLUMNS = ["Datum", "Firma", "Position", "Status / Ergebnis"] as const;
const UPDATE_COLUMNS = ["Datum der Änderung", "Firma", "Position", "Beworben am", "Neuer Status", "Notiz"] as const;

interface UpdateRow {
  app: JobApplication;
  event: ApplicationEvent;
}

function newApplicationRow(app: JobApplication): string[] {
  return [formatDate(app.appliedDate), app.company, app.role, sentenceCase(app.status)];
}

function updateRow({ app, event }: UpdateRow): string[] {
  return [
    formatDate(event.date),
    app.company,
    app.role,
    formatDate(app.appliedDate),
    sentenceCase(event.type),
    event.note ?? "",
  ];
}

function defaultFrom(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 2);
  return d.toISOString().slice(0, 10);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function PreviewTable({ columns, rows }: { columns: readonly string[]; rows: string[][] }) {
  return (
    <Box sx={{ border: 1, borderColor: "divider", borderRadius: 2, overflow: "auto" }}>
      <Table size="small" sx={{ "& td, & th": { fontSize: 12.5, whiteSpace: "nowrap" } }}>
        <TableHead>
          <TableRow sx={{ "& th": { fontWeight: 700, bgcolor: "action.hover", color: "text.secondary" } }}>
            {columns.map((c) => (
              <TableCell key={c}>{c}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={columns.length} sx={{ color: "text.secondary", fontStyle: "italic" }}>
                None in this range
              </TableCell>
            </TableRow>
          )}
          {rows.map((cells, i) => (
            <TableRow key={i}>
              {cells.map((cell, j) => (
                <TableCell key={j} sx={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {cell || "—"}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

export function ExportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { applications } = useStore();
  const [from, setFrom] = useState(defaultFrom());
  const [to, setTo] = useState(today());

  const newApplications = useMemo(
    () => applications.filter((a) => a.appliedDate >= from && a.appliedDate <= to),
    [applications, from, to],
  );

  const updates = useMemo(() => {
    const rows: UpdateRow[] = [];
    for (const app of applications) {
      if (app.appliedDate >= from) continue;
      for (const event of app.events) {
        if (event.type === "APPLIED") continue;
        if (event.date >= from && event.date <= to) rows.push({ app, event });
      }
    }
    return rows.sort((a, b) => a.event.date.localeCompare(b.event.date));
  }, [applications, from, to]);

  const invalidRange = from > to;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 650 }}>
        Export for Agentur für Arbeit
        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 400, mt: 0.25 }}>
          Pick the reporting period. New applications and status changes on earlier applications
          are shown separately, matching the two sheets in the generated file.
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stack direction="row" spacing={2} sx={{ mb: 2.5 }}>
          <TextField
            label="From"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            size="small"
            error={invalidRange}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="To"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            size="small"
            error={invalidRange}
            helperText={invalidRange ? "From must be before To" : undefined}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Stack>

        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Neue Bewerbungen — {newApplications.length} entries
        </Typography>
        <PreviewTable columns={NEW_COLUMNS} rows={newApplications.map(newApplicationRow)} />

        <Typography variant="subtitle2" sx={{ mt: 2.5, mb: 1 }}>
          Status-Updates — {updates.length} entries
        </Typography>
        <PreviewTable columns={UPDATE_COLUMNS} rows={updates.map(updateRow)} />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ color: "text.secondary" }}>
          Close
        </Button>
        <Button
          variant="contained"
          startIcon={<FileDownloadOutlinedIcon />}
          disabled={invalidRange}
          component="a"
          href={exportUrl(from, to)}
          onClick={onClose}
        >
          Download .xlsx
        </Button>
      </DialogActions>
    </Dialog>
  );
}
