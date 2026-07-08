import type { ApplicationStatus, Company, EventType, SalaryPeriod, Source, WorkMode } from "./types";

const BASE = "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`${init?.method ?? "GET"} ${path} failed: ${res.status} ${res.statusText}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// Mirrors backend CompanyResponse (company/dto/CompanyResponse.java).
export type CompanyDto = Company;

// Mirrors backend ApplicationResponse (application/dto/ApplicationResponse.java). Events are
// fetched separately via fetchEvents, not embedded here.
export interface ApplicationDto {
  id: number;
  company: CompanyDto;
  roleTitle: string;
  postingUrl?: string;
  location?: string;
  workMode: WorkMode | "UNKNOWN";
  source: Source;
  appliedOn: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryPeriod?: SalaryPeriod;
  currentStatus: ApplicationStatus;
  notes?: string;
}

// Mirrors backend CreateCompanyRequest.
export interface CreateCompanyRequest {
  name: string;
  website?: string;
  location?: string;
  notes?: string;
}

// Mirrors backend CreateApplicationRequest.
export interface CreateApplicationRequest {
  companyId: number;
  roleTitle: string;
  postingUrl?: string;
  location?: string;
  workMode?: WorkMode;
  source: Source;
  appliedOn: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryPeriod?: SalaryPeriod;
  notes?: string;
}

export function fetchCompanies(): Promise<CompanyDto[]> {
  return request("/companies");
}

export function createCompany(req: CreateCompanyRequest): Promise<CompanyDto> {
  return request("/companies", { method: "POST", body: JSON.stringify(req) });
}

export function fetchApplications(companyId?: number): Promise<ApplicationDto[]> {
  const qs = companyId != null ? `?companyId=${companyId}` : "";
  return request(`/applications${qs}`);
}

export function createApplication(req: CreateApplicationRequest): Promise<ApplicationDto> {
  return request("/applications", { method: "POST", body: JSON.stringify(req) });
}

// Mirrors backend UpdateApplicationRequest (PUT = full replace).
export interface UpdateApplicationRequest {
  companyId: number;
  roleTitle: string;
  postingUrl?: string;
  location?: string;
  workMode?: WorkMode;
  source: Source;
  appliedOn: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryPeriod?: SalaryPeriod;
  currentStatus: ApplicationStatus;
  notes?: string;
}

export function updateApplication(id: number, req: UpdateApplicationRequest): Promise<ApplicationDto> {
  return request(`/applications/${id}`, { method: "PUT", body: JSON.stringify(req) });
}

// Mirrors backend ApplicationEventResponse (application/dto/ApplicationEventResponse.java).
export interface ApplicationEventDto {
  id: number;
  occurredOn: string;
  type: EventType;
  note?: string;
}

// Mirrors backend CreateApplicationEventRequest.
export interface CreateApplicationEventRequest {
  occurredOn: string;
  type: EventType;
  note?: string;
}

export function fetchEvents(applicationId: number): Promise<ApplicationEventDto[]> {
  return request(`/applications/${applicationId}/events`);
}

export function createEvent(applicationId: number, req: CreateApplicationEventRequest): Promise<ApplicationEventDto> {
  return request(`/applications/${applicationId}/events`, { method: "POST", body: JSON.stringify(req) });
}

export function deleteEvent(applicationId: number, eventId: number): Promise<void> {
  return request(`/applications/${applicationId}/events/${eventId}`, { method: "DELETE" });
}
