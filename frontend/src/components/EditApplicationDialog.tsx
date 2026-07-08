import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useStore } from "../store";
import {
  SOURCE_LABEL,
  STATUS_LABEL,
  type ApplicationStatus,
  type JobApplication,
  type SalaryPeriod,
  type Source,
  type WorkMode,
} from "../types";

const SOURCES = Object.entries(SOURCE_LABEL) as [Source, string][];
const STATUSES = Object.entries(STATUS_LABEL) as [ApplicationStatus, string][];
const WORK_MODES: { value: WorkMode; label: string }[] = [
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "ONSITE", label: "Onsite" },
];
const SALARY_PERIODS: { value: SalaryPeriod; label: string }[] = [
  { value: "YEAR", label: "per year" },
  { value: "MONTH", label: "per month" },
];

export function EditApplicationDialog({
  app,
  open,
  onClose,
}: {
  app: JobApplication;
  open: boolean;
  onClose: () => void;
}) {
  const { updateApplication } = useStore();
  const [role, setRole] = useState(app.role);
  const [postingUrl, setPostingUrl] = useState(app.postingUrl ?? "");
  const [source, setSource] = useState<Source>(app.source);
  const [appliedDate, setAppliedDate] = useState(app.appliedDate);
  const [location, setLocation] = useState(app.location ?? "");
  const [workMode, setWorkMode] = useState<WorkMode | "">(app.workMode ?? "");
  const [salaryMin, setSalaryMin] = useState(app.salaryMin != null ? String(app.salaryMin) : "");
  const [salaryMax, setSalaryMax] = useState(app.salaryMax != null ? String(app.salaryMax) : "");
  const [salaryPeriod, setSalaryPeriod] = useState<SalaryPeriod>(app.salaryPeriod ?? "YEAR");
  const [status, setStatus] = useState<ApplicationStatus>(app.status);
  const [notes, setNotes] = useState(app.notes ?? "");
  const [saving, setSaving] = useState(false);

  const canSave = role.trim() !== "" && !saving;

  const save = async () => {
    setSaving(true);
    try {
      await updateApplication(app.id, {
        companyId: app.companyId,
        role: role.trim(),
        postingUrl: postingUrl.trim() || undefined,
        location: location.trim() || undefined,
        workMode: workMode || undefined,
        source,
        appliedDate,
        salaryMin: salaryMin ? Number(salaryMin) : undefined,
        salaryMax: salaryMax ? Number(salaryMax) : undefined,
        salaryPeriod: salaryMin || salaryMax ? salaryPeriod : undefined,
        status,
        notes: notes.trim() || undefined,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 650 }}>Edit application</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {app.company}
          </Typography>
          <TextField label="Role / position" value={role} onChange={(e) => setRole(e.target.value)} size="small" autoFocus required />
          <TextField label="Job posting link" value={postingUrl} onChange={(e) => setPostingUrl(e.target.value)} size="small" placeholder="https://…" />
          <TextField label="Status" value={status} onChange={(e) => setStatus(e.target.value as ApplicationStatus)} size="small" select>
            {STATUSES.map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <TextField label="Source (Art der Bewerbung)" value={source} onChange={(e) => setSource(e.target.value as Source)} size="small" select>
              {SOURCES.map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Applied on"
              type="date"
              value={appliedDate}
              onChange={(e) => setAppliedDate(e.target.value)}
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField label="Location" value={location} onChange={(e) => setLocation(e.target.value)} size="small" />
            <TextField label="Work mode" value={workMode} onChange={(e) => setWorkMode(e.target.value as WorkMode)} size="small" select>
              {WORK_MODES.map((m) => (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
            <TextField label="Salary min (optional)" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} size="small" type="number" />
            <TextField label="Salary max (optional)" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} size="small" type="number" />
            <TextField label="Period" value={salaryPeriod} onChange={(e) => setSalaryPeriod(e.target.value as SalaryPeriod)} size="small" select>
              {SALARY_PERIODS.map((p) => (
                <MenuItem key={p.value} value={p.value}>
                  {p.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <TextField label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} size="small" multiline minRows={2} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ color: "text.secondary" }}>
          Cancel
        </Button>
        <Button onClick={save} variant="contained" disabled={!canSave}>
          Save changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
