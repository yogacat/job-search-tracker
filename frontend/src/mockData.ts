import type { ApplicationStatus, EventType, JobApplication } from "./types";

// Seed data for the mock. Dates are around 2026-06 / 2026-07 so the "next step" accents
// (overdue / due-soon) show up against a mid-2026 "today".

const CURATED: JobApplication[] = [
  {
    id: "a1",
    company: "Zalando SE",
    role: "Frontend Engineer",
    postingUrl: "https://jobs.zalando.com/de/jobs/2481067",
    location: "Berlin",
    workMode: "HYBRID",
    source: "LinkedIn",
    appliedDate: "2026-06-12",
    salaryRange: "70–80k €",
    contactPerson: "Lena Fischer (Recruiting)",
    status: "INTERVIEW",
    nextStep: "Technical interview (React / system design)",
    nextStepDate: "2026-07-09",
    notes: "Two-round process. First call went well, they liked the Pipeline project.",
    events: [
      { id: "e1", date: "2026-06-12", type: "APPLIED", note: "Applied via LinkedIn Easy Apply" },
      { id: "e2", date: "2026-06-24", type: "SCREENING_CALL", note: "30 min HR call with Lena" },
      { id: "e3", date: "2026-07-09", type: "INTERVIEW", note: "Technical round — scheduled" },
    ],
  },
  {
    id: "a2",
    company: "N26",
    role: "Full-Stack Engineer (Java/React)",
    postingUrl: "https://n26.com/careers",
    location: "Berlin",
    workMode: "REMOTE",
    source: "Company site",
    appliedDate: "2026-06-28",
    salaryRange: "75–85k €",
    status: "SCREENING",
    nextStep: "Waiting for recruiter feedback",
    nextStepDate: "2026-07-04",
    notes: "Spring Boot + React stack — strong match with current project.",
    events: [
      { id: "e4", date: "2026-06-28", type: "APPLIED" },
      { id: "e5", date: "2026-07-01", type: "SCREENING_CALL", note: "Intro call, 25 min" },
    ],
  },
  {
    id: "a3",
    company: "Trade Republic",
    role: "Backend Engineer (Java)",
    location: "Berlin",
    workMode: "ONSITE",
    source: "StepStone",
    appliedDate: "2026-05-30",
    salaryRange: "80–90k €",
    status: "OFFER",
    nextStep: "Respond to offer",
    nextStepDate: "2026-07-11",
    notes: "Offer received! 84k base + bonus. Deadline to respond July 11.",
    events: [
      { id: "e6", date: "2026-05-30", type: "APPLIED" },
      { id: "e7", date: "2026-06-06", type: "SCREENING_CALL" },
      { id: "e8", date: "2026-06-16", type: "TASK", note: "Take-home: build a small transaction ledger" },
      { id: "e9", date: "2026-06-25", type: "INTERVIEW", note: "Onsite — 3 rounds" },
      { id: "e10", date: "2026-07-02", type: "OFFER", note: "84k base + 10% bonus" },
    ],
  },
  {
    id: "a4",
    company: "SAP",
    role: "Software Engineer, Cloud",
    location: "Walldorf",
    workMode: "HYBRID",
    source: "Referral",
    appliedDate: "2026-06-18",
    contactPerson: "Referred by M. Weber",
    status: "APPLIED",
    nextStep: "Follow up if no reply",
    nextStepDate: "2026-07-15",
    events: [{ id: "e11", date: "2026-06-18", type: "APPLIED", note: "Employee referral submitted" }],
  },
  {
    id: "a5",
    company: "Delivery Hero",
    role: "Frontend Engineer",
    location: "Berlin",
    workMode: "HYBRID",
    source: "LinkedIn",
    appliedDate: "2026-05-20",
    status: "REJECTED",
    notes: "Rejected after take-home. Feedback: wanted more TypeScript depth.",
    events: [
      { id: "e12", date: "2026-05-20", type: "APPLIED" },
      { id: "e13", date: "2026-05-28", type: "SCREENING_CALL" },
      { id: "e14", date: "2026-06-05", type: "TASK", note: "Take-home React dashboard" },
      { id: "e15", date: "2026-06-14", type: "REJECTED", note: "Rejected after review" },
    ],
  },
  {
    id: "a6",
    company: "GetYourGuide",
    role: "Software Engineer",
    location: "Berlin",
    workMode: "REMOTE",
    source: "StepStone",
    appliedDate: "2026-06-02",
    status: "GHOSTED",
    notes: "No response after 4 weeks. Treating as closed.",
    events: [{ id: "e16", date: "2026-06-02", type: "APPLIED" }],
  },
  {
    id: "a7",
    company: "HelloFresh",
    role: "Full-Stack Engineer",
    location: "Berlin",
    workMode: "HYBRID",
    source: "Company site",
    appliedDate: "2026-06-30",
    salaryRange: "72–82k €",
    status: "APPLIED",
    events: [{ id: "e17", date: "2026-06-30", type: "APPLIED" }],
  },
];

// ~20 additional generated applications so the Statistics funnel has enough volume to read.
// Each is a coherent journey (events consistent with the final status) so the list, detail
// pages, and the Sankey all stay in sync.

function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

interface Journey {
  events: EventType[];
  status: ApplicationStatus;
}

const NO_REPLY: Journey = { events: ["APPLIED"], status: "GHOSTED" };
const REJECT_AT_APPLY: Journey = { events: ["APPLIED", "REJECTED"], status: "REJECTED" };
const WITHDREW_EARLY: Journey = { events: ["APPLIED", "WITHDRAWN"], status: "WITHDRAWN" };
const SCREEN_REJECT: Journey = { events: ["APPLIED", "SCREENING_CALL", "REJECTED"], status: "REJECTED" };
const INT1_REJECT: Journey = { events: ["APPLIED", "SCREENING_CALL", "INTERVIEW", "REJECTED"], status: "REJECTED" };
const INT2_REJECT: Journey = {
  events: ["APPLIED", "SCREENING_CALL", "INTERVIEW", "INTERVIEW", "REJECTED"],
  status: "REJECTED",
};
const INT2_OFFER_DECLINED: Journey = {
  events: ["APPLIED", "SCREENING_CALL", "INTERVIEW", "INTERVIEW", "OFFER", "WITHDRAWN"],
  status: "WITHDRAWN",
};
const INT3_OFFER_ACCEPTED: Journey = {
  events: ["APPLIED", "SCREENING_CALL", "INTERVIEW", "INTERVIEW", "INTERVIEW", "OFFER"],
  status: "ACCEPTED",
};
const IN_PROGRESS_INTERVIEW: Journey = { events: ["APPLIED", "SCREENING_CALL", "INTERVIEW"], status: "INTERVIEW" };

const JOURNEYS: Journey[] = [
  NO_REPLY, NO_REPLY, NO_REPLY, NO_REPLY, NO_REPLY, NO_REPLY, NO_REPLY,
  REJECT_AT_APPLY, REJECT_AT_APPLY, REJECT_AT_APPLY, REJECT_AT_APPLY,
  WITHDREW_EARLY,
  SCREEN_REJECT, SCREEN_REJECT,
  INT1_REJECT, INT1_REJECT,
  INT2_REJECT,
  INT2_OFFER_DECLINED,
  INT3_OFFER_ACCEPTED,
  IN_PROGRESS_INTERVIEW,
];

const G_COMPANIES = [
  "Personio", "Celonis", "Contentful", "Raisin", "Solaris", "Scalable Capital", "Forto", "Choco",
  "Sennder", "Grover", "Taxfix", "Blinkist", "Zenjob", "Adjust", "Commercetools", "Camunda",
  "Mambu", "Enpal", "Klarna", "Ada Health",
];
const G_ROLES = ["Frontend Engineer", "Backend Engineer (Java)", "Full-Stack Engineer", "Software Engineer", "React Developer"];
const G_DIRECT_SOURCES = ["LinkedIn", "StepStone", "Company site", "Indeed", "Xing"];
const G_WORK_MODES = ["REMOTE", "HYBRID", "ONSITE"] as const;

const GENERATED: JobApplication[] = JOURNEYS.map((journey, i) => {
  const appliedDate = addDays("2026-03-02", i * 5);
  return {
    id: `g${i}`,
    company: G_COMPANIES[i % G_COMPANIES.length],
    role: G_ROLES[i % G_ROLES.length],
    source: i % 7 === 0 ? "Referral" : G_DIRECT_SOURCES[i % G_DIRECT_SOURCES.length],
    appliedDate,
    workMode: G_WORK_MODES[i % G_WORK_MODES.length],
    status: journey.status,
    events: journey.events.map((type, k) => ({
      id: `g${i}-${k}`,
      date: addDays(appliedDate, k * 9),
      type,
    })),
  };
});

export const MOCK_APPLICATIONS: JobApplication[] = [...CURATED, ...GENERATED];
