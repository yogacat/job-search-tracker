import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { useStore } from "../store";
import { formatDate, sentenceCase } from "../format";
import { SOURCE_LABEL, type JobApplication } from "../types";

// The Agentur für Arbeit export: one row per application. These are the exact columns the
// generated .xlsx will carry — the real file is produced by the backend (Apache POI). This
// dialog previews the sheet and offers a CSV stand-in so the mock actually downloads something.

const COLUMNS = ["Datum", "Firma", "Position", "Art der Bewerbung", "Status / Ergebnis", "Link"] as const;

function row(app: JobApplication): string[] {
  return [
    formatDate(app.appliedDate),
    app.company,
    app.role,
    SOURCE_LABEL[app.source],
    sentenceCase(app.status),
    app.postingUrl ?? "",
  ];
}

function downloadCsv(apps: JobApplication[]) {
  const esc = (v: string) => `"${v.replaceAll('"', '""')}"`;
  const lines = [COLUMNS.map(esc).join(";"), ...apps.map((a) => row(a).map(esc).join(";"))];
  const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Bewerbungen_${new Date().toISOString().slice(0, 7)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function ExportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { applications } = useStore();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 650 }}>
        Export for Agentur für Arbeit
        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 400, mt: 0.25 }}>
          One row per application — {applications.length} entries. Preview of the generated sheet:
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ border: 1, borderColor: "divider", borderRadius: 2, overflow: "auto" }}>
          <Table size="small" sx={{ "& td, & th": { fontSize: 12.5, whiteSpace: "nowrap" } }}>
            <TableHead>
              <TableRow sx={{ "& th": { fontWeight: 700, bgcolor: "action.hover", color: "text.secondary" } }}>
                {COLUMNS.map((c) => (
                  <TableCell key={c}>{c}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map((a) => (
                <TableRow key={a.id}>
                  {row(a).map((cell, i) => (
                    <TableCell key={i} sx={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {cell || "—"}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 1.5 }}>
          In the real app the backend streams a formatted <b>.xlsx</b> (Apache POI) plus a summary
          sheet. This preview downloads the same data as CSV.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ color: "text.secondary" }}>
          Close
        </Button>
        <Button variant="contained" startIcon={<FileDownloadOutlinedIcon />} onClick={() => downloadCsv(applications)}>
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
}
