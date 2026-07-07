import { useState } from "react";
import {
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
import type { EventType } from "../types";
import { sentenceCase } from "../format";

const EVENT_TYPES: EventType[] = [
  "APPLIED",
  "FOLLOW_UP",
  "SCREENING_CALL",
  "INTERVIEW",
  "TASK",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AddEventDialog({ appId, open, onClose }: { appId: string; open: boolean; onClose: () => void }) {
  const { addEvent } = useStore();
  const [type, setType] = useState<EventType>("INTERVIEW");
  const [date, setDate] = useState(today());
  const [note, setNote] = useState("");

  const save = () => {
    addEvent(appId, { type, date, note: note.trim() || undefined });
    setType("INTERVIEW");
    setDate(today());
    setNote("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 650 }}>Add step</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <TextField label="Type" value={type} onChange={(e) => setType(e.target.value as EventType)} size="small" select autoFocus>
            {EVENT_TYPES.map((t) => (
              <MenuItem key={t} value={t}>
                {sentenceCase(t)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} size="small" multiline minRows={2} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ color: "text.secondary" }}>
          Cancel
        </Button>
        <Button onClick={save} variant="contained">
          Add step
        </Button>
      </DialogActions>
    </Dialog>
  );
}
