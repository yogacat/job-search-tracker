import type { PaletteMode } from "@mui/material";
import type { ApplicationStatus, EventType } from "./types";

// Poppy-field palette (from the reference photo): a warm scheme where the coral accent is the
// brand color and the rest carry status meaning. Every color has a light and a dark variant so
// dots/bars stay legible in both modes.

export const POPPY = {
  crimson: "#c41e4a",
  coralPink: "#f26d7d",
  salmon: "#f5896f",
  sand: "#efd98a",
  olive: "#9cb82f",
} as const;

type DotKey = "blue" | "salmon" | "gold" | "olive" | "oliveDeep" | "crimson" | "coral" | "gray";

const DOT: Record<PaletteMode, Record<DotKey, string>> = {
  light: {
    blue: "#6b93d6",
    salmon: "#ef7f66",
    gold: "#d69e2e",
    olive: "#7ba30f",
    oliveDeep: "#5e7f0a",
    crimson: "#c41e4a",
    coral: "#fa5252",
    gray: "#9ca3af",
  },
  dark: {
    blue: "#7aa5e0",
    salmon: "#f9a58f",
    gold: "#ebc65c",
    olive: "#a9c94b",
    oliveDeep: "#8fb524",
    crimson: "#f4809f",
    coral: "#ff8787",
    gray: "#9aa1ab",
  },
};

export function dot(mode: PaletteMode, key: DotKey): string {
  return DOT[mode][key];
}

// Status → dot color. Pipeline warms as it advances; terminal states go neutral gray.
export const STATUS_DOT: Record<ApplicationStatus, DotKey> = {
  APPLIED: "blue",
  SCREENING: "salmon",
  INTERVIEW: "gold",
  OFFER: "olive",
  ACCEPTED: "oliveDeep",
  REJECTED: "gray",
  WITHDRAWN: "gray",
  GHOSTED: "gray",
};

export const EVENT_DOT: Record<EventType, DotKey> = {
  APPLIED: "blue",
  FOLLOW_UP: "gray",
  SCREENING_CALL: "salmon",
  INTERVIEW: "gold",
  TASK: "coral",
  OFFER: "olive",
  REJECTED: "gray",
  WITHDRAWN: "gray",
};

// Left accent-bar signal on cards. Kept distinct from the coral brand accent so "needs
// attention" reads on its own: crimson = overdue, gold = due soon, olive = offer, gray = closed.
export type AccentKey = "overdue" | "dueSoon" | "offer" | "closed";
const ACCENT_DOT: Record<AccentKey, DotKey> = {
  overdue: "crimson",
  dueSoon: "gold",
  offer: "olive",
  closed: "gray",
};

export function barColor(mode: PaletteMode, key: AccentKey): string {
  return dot(mode, ACCENT_DOT[key]);
}

// Soft labeled chips (work mode, due-date pills). bg + matching darker fg per mode.
export type SoftKey = "gray" | "sand" | "gold" | "crimson";

const SOFT: Record<PaletteMode, Record<SoftKey, { bg: string; fg: string }>> = {
  light: {
    gray: { bg: "#f1f0ec", fg: "#5f5e5a" },
    sand: { bg: "#f6ecca", fg: "#8a6d14" },
    gold: { bg: "#fbe6bf", fg: "#8a5a0b" },
    crimson: { bg: "#fbdbe3", fg: "#a01235" },
  },
  dark: {
    gray: { bg: "#262b32", fg: "#c2c7cf" },
    sand: { bg: "#3a3320", fg: "#ecd591" },
    gold: { bg: "#3a2e17", fg: "#f0c766" },
    crimson: { bg: "#3a1f27", fg: "#f6a0b4" },
  },
};

export function soft(mode: PaletteMode, key: SoftKey): { bg: string; fg: string } {
  return SOFT[mode][key];
}
