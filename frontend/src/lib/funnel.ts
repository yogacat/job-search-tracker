import type { JobApplication } from "../types";

// Derives a Sankey funnel from the applications: each application walks the stages it actually
// reached (source -> total -> phone screen -> interviews -> offer) and exits at a terminal node
// (no reply / rejected / withdrew / declined / accepted). Link values are how many applications
// took that edge.

export type NodeCategory = "source" | "stage" | "offer" | "success" | "reject" | "neutral";

export interface FunnelNode {
  name: string;
  category: NodeCategory;
}

export interface FunnelLink {
  source: number;
  target: number;
  value: number;
}

const CATEGORY: Record<string, NodeCategory> = {
  "Applied directly": "source",
  "Via recruiter": "source",
  "Total applications": "source",
  "Phone screen": "stage",
  "First interview": "stage",
  "Second interview": "stage",
  "Third interview": "stage",
  Offer: "offer",
  Accepted: "success",
  "No reply": "reject",
  Rejected: "reject",
  Withdrew: "neutral",
  Declined: "neutral",
};

// Vertical ordering within columns - keeps positive outcomes low, drop-offs grouped.
const ORDER = [
  "Applied directly",
  "Via recruiter",
  "Total applications",
  "No reply",
  "Phone screen",
  "First interview",
  "Second interview",
  "Third interview",
  "Rejected",
  "Withdrew",
  "Offer",
  "Declined",
  "Accepted",
];

const INTERVIEW_NAMES = ["First interview", "Second interview", "Third interview"];
// No node name contains a pipe, so it is a safe key delimiter (names contain spaces).
const SEP = "|";

function terminalNode(app: JobApplication, reachedOffer: boolean): string | null {
  switch (app.status) {
    case "GHOSTED":
      return "No reply";
    case "REJECTED":
      return "Rejected";
    case "WITHDRAWN":
      return reachedOffer ? "Declined" : "Withdrew";
    case "ACCEPTED":
      return "Accepted";
    default:
      // OFFER pending, or still in progress (APPLIED / SCREENING / INTERVIEW) - the flow just
      // reaches the current stage and stops there.
      return null;
  }
}

function pathFor(app: JobApplication): string[] {
  const path: string[] = [];
  path.push(app.source.toLowerCase().includes("referral") ? "Via recruiter" : "Applied directly");
  path.push("Total applications");

  const types = app.events.map((e) => e.type);
  if (types.includes("SCREENING_CALL")) path.push("Phone screen");

  const interviews = types.filter((t) => t === "INTERVIEW").length;
  for (let k = 0; k < Math.min(interviews, INTERVIEW_NAMES.length); k++) path.push(INTERVIEW_NAMES[k]);

  const reachedOffer = types.includes("OFFER") || app.status === "OFFER" || app.status === "ACCEPTED";
  if (reachedOffer) path.push("Offer");

  const terminal = terminalNode(app, reachedOffer);
  if (terminal) path.push(terminal);

  return path;
}

export function buildFunnel(apps: JobApplication[]): { nodes: FunnelNode[]; links: FunnelLink[] } {
  const linkCounts = new Map<string, number>();
  const seen = new Set<string>();

  for (const app of apps) {
    const path = pathFor(app);
    for (const name of path) seen.add(name);
    for (let k = 0; k < path.length - 1; k++) {
      const key = path[k] + SEP + path[k + 1];
      linkCounts.set(key, (linkCounts.get(key) ?? 0) + 1);
    }
  }

  const names = [...seen].sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
  const index = new Map(names.map((name, i) => [name, i]));
  const nodes: FunnelNode[] = names.map((name) => ({ name, category: CATEGORY[name] ?? "neutral" }));

  const links: FunnelLink[] = [];
  for (const [key, value] of linkCounts) {
    const [s, t] = key.split(SEP);
    links.push({ source: index.get(s)!, target: index.get(t)!, value });
  }

  return { nodes, links };
}
