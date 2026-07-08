// Domain model for the job search tracker's UI. Applications and companies come from the real
// backend (see api.ts); events are still client-only until the backend's ApplicationEvent CRUD
// exists.

// Matches backend CurrentStatus exactly (application/repository/CurrentStatus.java).
export type ApplicationStatus =
  | "APPLIED"
  | "INTERVIEW"
  | "OFFER"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN"
  | "GHOSTED";

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
  GHOSTED: "Ghosted",
};

// A dated step in an application's timeline ("steps I had there").
export type EventType =
  | "APPLIED"
  | "FOLLOW_UP"
  | "INTERVIEW"
  | "TECHNICAL_INTERVIEW"
  | "TASK"
  | "OFFER"
  | "REJECTED"
  | "WITHDRAWN";

export type WorkMode = "REMOTE" | "HYBRID" | "ONSITE";

// "Art der Bewerbung" — matches the backend's Source enum.
export type Source = "LINKEDIN" | "STEPSTONE" | "COMPANY_SITE" | "REFERRAL" | "INDEED" | "XING" | "OTHER";

export const SOURCE_LABEL: Record<Source, string> = {
  LINKEDIN: "LinkedIn",
  STEPSTONE: "StepStone",
  COMPANY_SITE: "Company site",
  REFERRAL: "Referral",
  INDEED: "Indeed",
  XING: "Xing",
  OTHER: "Other",
};

export type SalaryPeriod = "YEAR" | "MONTH";

export interface Company {
  id: number;
  name: string;
  website?: string;
  location?: string;
}

export interface ApplicationEvent {
  id: string;
  date: string; // ISO yyyy-MM-dd
  type: EventType;
  note?: string;
}

export interface JobApplication {
  id: string;
  companyId: number;
  company: string;
  role: string;
  postingUrl?: string;
  location?: string;
  workMode?: WorkMode;
  source: Source;
  appliedDate: string; // ISO yyyy-MM-dd
  salaryMin?: number;
  salaryMax?: number;
  salaryPeriod?: SalaryPeriod;
  salaryRange?: string; // formatted for display; see formatSalaryRange
  status: ApplicationStatus;
  notes?: string;
  events: ApplicationEvent[];
}

export const ACTIVE_STATUSES: ApplicationStatus[] = ["APPLIED", "INTERVIEW", "OFFER"];
export const CLOSED_STATUSES: ApplicationStatus[] = ["ACCEPTED", "REJECTED", "WITHDRAWN", "GHOSTED"];

// Applied first, then in-progress stages, then closed outcomes at the bottom.
export const STATUS_ORDER: ApplicationStatus[] = [
  "APPLIED",
  "INTERVIEW",
  "OFFER",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
  "GHOSTED",
];
