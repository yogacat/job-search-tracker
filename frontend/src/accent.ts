import type { JobApplication } from "./types";
import type { AccentKey } from "./palette";

// Minimalist card highlight: cards stay flat, a 3px left accent bar carries the signal.
// Returns a semantic key; the card resolves it to a mode-aware color via palette.barColor.
// Priority order matters.
//
// TODO: overdue/dueSoon accents (previously driven by nextStepDate) are on hold until the
// backend models a "next step" concept (plain field vs. derived from Task — undecided).
export function rowAccentKey(app: JobApplication): AccentKey | undefined {
  if (app.status === "OFFER" || app.status === "ACCEPTED") return "offer";
  if (app.status === "REJECTED" || app.status === "WITHDRAWN" || app.status === "GHOSTED") {
    return "closed";
  }
  return undefined;
}
