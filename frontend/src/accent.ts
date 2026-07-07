import type { JobApplication } from "./types";
import { daysUntil } from "./format";
import type { AccentKey } from "./palette";

// Minimalist card highlight: cards stay flat, a 3px left accent bar carries the signal.
// Returns a semantic key; the card resolves it to a mode-aware color via palette.barColor.
// Priority order matters.
export function rowAccentKey(app: JobApplication): AccentKey | undefined {
  if (app.status === "OFFER" || app.status === "ACCEPTED") return "offer";
  if (app.nextStepDate) {
    const d = daysUntil(app.nextStepDate);
    if (d < 0) return "overdue";
    if (d <= 3) return "dueSoon";
  }
  if (app.status === "REJECTED" || app.status === "WITHDRAWN" || app.status === "GHOSTED") {
    return "closed";
  }
  return undefined;
}
