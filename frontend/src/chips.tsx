import { Box, Chip, Stack, Typography, useTheme } from "@mui/material";
import type { ApplicationStatus, EventType } from "./types";
import { sentenceCase } from "./format";
import { STATUS_DOT, EVENT_DOT, dot, soft, type SoftKey } from "./palette";

// Quiet status markers: a small colored dot + sentence-case gray text. Color carries the
// signal; the text stays neutral so rows don't shout. Colors come from the poppy palette and
// adapt to light/dark.

export function StatusDot({ color, label }: { color: string; label: string }) {
  return (
    <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", flexShrink: 0 }}>
      <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: color, flexShrink: 0 }} />
      <Typography variant="body2" sx={{ color: "text.secondary", fontSize: 12.5, whiteSpace: "nowrap" }}>
        {label}
      </Typography>
    </Stack>
  );
}

export function StatusChip({ status }: { status: ApplicationStatus }) {
  const mode = useTheme().palette.mode;
  return <StatusDot color={dot(mode, STATUS_DOT[status])} label={sentenceCase(status)} />;
}

/** Hook returning an event-type → dot color resolver for the current mode. */
export function useEventColor(): (type: EventType) => string {
  const mode = useTheme().palette.mode;
  return (type) => dot(mode, EVENT_DOT[type]);
}

// Soft labeled chip — used sparingly for the few markers that need a word rather than a dot
// (work mode, an overdue/due-soon next step).
export function SoftChip({ label, color = "gray" }: { label: string; color?: SoftKey }) {
  const mode = useTheme().palette.mode;
  const { bg, fg } = soft(mode, color);
  return (
    <Chip
      label={label}
      size="small"
      sx={{ bgcolor: bg, color: fg, fontWeight: 600, fontSize: 12, height: 22, borderRadius: 1.5 }}
    />
  );
}
