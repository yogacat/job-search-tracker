import { useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { useStore } from "../store";
import { SOURCE_LABEL, type SalaryPeriod, type Source, type WorkMode } from "../types";

const SOURCES = Object.entries(SOURCE_LABEL) as [Source, string][];
const WORK_MODES: { value: WorkMode; label: string }[] = [
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "ONSITE", label: "Onsite" },
];
const SALARY_PERIODS: { value: SalaryPeriod; label: string }[] = [
  { value: "YEAR", label: "per year" },
  { value: "MONTH", label: "per month" },
];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AddApplicationDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { companies, addApplication } = useStore();
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [postingUrl, setPostingUrl] = useState("");
  const [source, setSource] = useState<Source>("LINKEDIN");
  const [appliedDate, setAppliedDate] = useState(today());
  const [location, setLocation] = useState("");
  const [workMode, setWorkMode] = useState<WorkMode>("HYBRID");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [salaryPeriod, setSalaryPeriod] = useState<SalaryPeriod>("YEAR");
  const [saving, setSaving] = useState(false);

  const canSave = company.trim() !== "" && role.trim() !== "" && !saving;

  const reset = () => {
    setCompany("");
    setRole("");
    setPostingUrl("");
    setSource("LINKEDIN");
    setAppliedDate(today());
    setLocation("");
    setWorkMode("HYBRID");
    setSalaryMin("");
    setSalaryMax("");
    setSalaryPeriod("YEAR");
  };

  const save = async () => {
    setSaving(true);
    try {
      await addApplication({
        companyName: company.trim(),
        role: role.trim(),
        postingUrl: postingUrl.trim() || undefined,
        source,
        appliedDate,
        location: location.trim() || undefined,
        workMode,
        salaryMin: salaryMin ? Number(salaryMin) : undefined,
        salaryMax: salaryMax ? Number(salaryMax) : undefined,
        salaryPeriod: salaryMin || salaryMax ? salaryPeriod : undefined,
      });
      reset();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 650 }}>Add application</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <Autocomplete
            freeSolo
            options={companies.map((c) => c.name)}
            inputValue={company}
            onInputChange={(_, value) => setCompany(value)}
            renderInput={(params) => <TextField {...params} label="Company" size="small" autoFocus required />}
          />
          <TextField label="Role / position" value={role} onChange={(e) => setRole(e.target.value)} size="small" required />
          <TextField label="Job posting link" value={postingUrl} onChange={(e) => setPostingUrl(e.target.value)} size="small" placeholder="https://…" />
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
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr" }, gap: 2 }}>
            <TextField label="Salary min (optional)" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} size="small" type="number" placeholder="70000" />
            <TextField label="Salary max (optional)" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} size="small" type="number" placeholder="80000" />
            <TextField
              label="Period"
              value={salaryPeriod}
              onChange={(e) => setSalaryPeriod(e.target.value as SalaryPeriod)}
              size="small"
              select
              sx={{ gridColumn: { xs: "1 / -1", sm: "auto" } }}
            >
              {SALARY_PERIODS.map((p) => (
                <MenuItem key={p.value} value={p.value}>
                  {p.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ color: "text.secondary" }}>
          Cancel
        </Button>
        <Button onClick={save} variant="contained" disabled={!canSave}>
          Add application
        </Button>
      </DialogActions>
    </Dialog>
  );
}
