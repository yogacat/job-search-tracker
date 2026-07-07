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
} from "@mui/material";
import { useStore } from "../store";
import type { WorkMode } from "../types";

const SOURCES = ["LinkedIn", "StepStone", "Company site", "Referral", "Indeed", "Xing", "Other"];
const WORK_MODES: { value: WorkMode; label: string }[] = [
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "ONSITE", label: "Onsite" },
];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AddApplicationDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addApplication } = useStore();
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [postingUrl, setPostingUrl] = useState("");
  const [source, setSource] = useState("LinkedIn");
  const [appliedDate, setAppliedDate] = useState(today());
  const [location, setLocation] = useState("");
  const [workMode, setWorkMode] = useState<WorkMode>("HYBRID");
  const [salaryRange, setSalaryRange] = useState("");

  const canSave = company.trim() !== "" && role.trim() !== "";

  const reset = () => {
    setCompany("");
    setRole("");
    setPostingUrl("");
    setSource("LinkedIn");
    setAppliedDate(today());
    setLocation("");
    setWorkMode("HYBRID");
    setSalaryRange("");
  };

  const save = () => {
    addApplication({
      company: company.trim(),
      role: role.trim(),
      postingUrl: postingUrl.trim() || undefined,
      source,
      appliedDate,
      location: location.trim() || undefined,
      workMode,
      salaryRange: salaryRange.trim() || undefined,
      status: "APPLIED",
    });
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 650 }}>Add application</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <TextField label="Company" value={company} onChange={(e) => setCompany(e.target.value)} size="small" autoFocus required />
          <TextField label="Role / position" value={role} onChange={(e) => setRole(e.target.value)} size="small" required />
          <TextField label="Job posting link" value={postingUrl} onChange={(e) => setPostingUrl(e.target.value)} size="small" placeholder="https://…" />
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <TextField label="Source (Art der Bewerbung)" value={source} onChange={(e) => setSource(e.target.value)} size="small" select>
              {SOURCES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
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
          <TextField label="Salary range (optional)" value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)} size="small" placeholder="70–80k €" />
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
