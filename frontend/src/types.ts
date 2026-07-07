// Domain model for the job search tracker. The backend (written separately) is expected to
// expose these shapes; the mock frontend seeds them locally.

export type ApplicationStatus =
  | "APPLIED"
  | "SCREENING"
  | "INTERVIEW"
  | "OFFER"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN"
  | "GHOSTED";

// A dated step in an application's timeline ("steps I had there").
export type EventType =
  | "APPLIED"
  | "FOLLOW_UP"
  | "SCREENING_CALL"
  | "INTERVIEW"
  | "TASK"
  | "OFFER"
  | "REJECTED"
  | "WITHDRAWN";

export type WorkMode = "REMOTE" | "HYBRID" | "ONSITE";

export interface ApplicationEvent {
  id: string;
  date: string; // ISO yyyy-MM-dd
  type: EventType;
  note?: string;
}

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  postingUrl?: string;
  location?: string;
  workMode?: WorkMode;
  source: string; // "Art der Bewerbung" — LinkedIn, StepStone, company site, referral…
  appliedDate: string; // ISO yyyy-MM-dd
  salaryRange?: string;
  contactPerson?: string;
  status: ApplicationStatus;
  nextStep?: string; // free-text "what's next"
  nextStepDate?: string; // ISO yyyy-MM-dd
  notes?: string;
  events: ApplicationEvent[];
}

export const ACTIVE_STATUSES: ApplicationStatus[] = ["APPLIED", "SCREENING", "INTERVIEW", "OFFER"];
export const CLOSED_STATUSES: ApplicationStatus[] = ["ACCEPTED", "REJECTED", "WITHDRAWN", "GHOSTED"];
