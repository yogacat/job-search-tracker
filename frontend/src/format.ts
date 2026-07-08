// German-locale formatting — the export is for the Agentur für Arbeit, so dates read dd.MM.yyyy.

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

/** Whole days from today to the given ISO date (negative = in the past). */
export function daysUntil(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(iso + "T00:00:00");
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

/** "in 3 days" / "today" / "2 days ago" */
export function relativeDay(iso: string): string {
  const d = daysUntil(iso);
  if (d === 0) return "today";
  if (d === 1) return "tomorrow";
  if (d === -1) return "yesterday";
  return d > 0 ? `in ${d} days` : `${-d} days ago`;
}

const NUMBER_FORMAT = new Intl.NumberFormat("de-DE");

/** "70,000–80,000 €/yr", "80,000 €/mo", or undefined if neither bound is set. */
export function formatSalaryRange(
  min: number | undefined,
  max: number | undefined,
  period: "YEAR" | "MONTH" | undefined,
): string | undefined {
  if (min == null && max == null) return undefined;
  const range = min != null && max != null && min !== max
    ? `${NUMBER_FORMAT.format(min)}–${NUMBER_FORMAT.format(max)} €`
    : `${NUMBER_FORMAT.format((min ?? max)!)} €`;
  return period ? `${range}/${period === "YEAR" ? "yr" : "mo"}` : range;
}

function sentenceCase(value: string): string {
  const lower = value.replaceAll("_", " ").toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export { sentenceCase };
