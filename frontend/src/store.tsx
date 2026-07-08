import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  createApplication,
  createCompany,
  createEvent,
  fetchApplications,
  fetchCompanies,
  fetchEvents,
  updateApplication as apiUpdateApplication,
  type ApplicationDto,
  type ApplicationEventDto,
  type CompanyDto,
} from "./api";
import { formatSalaryRange } from "./format";
import type {
  ApplicationEvent,
  ApplicationStatus,
  Company,
  JobApplication,
  SalaryPeriod,
  Source,
  WorkMode,
} from "./types";

// Fetches Company/Application/ApplicationEvent from the real backend.

export interface NewApplicationInput {
  companyName: string; // matched against existing companies by name (case-insensitive), else created
  role: string;
  postingUrl?: string;
  location?: string;
  workMode?: WorkMode;
  source: Source;
  appliedDate: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryPeriod?: SalaryPeriod;
  notes?: string;
}

export interface EditApplicationInput {
  companyId: number;
  role: string;
  postingUrl?: string;
  location?: string;
  workMode?: WorkMode;
  source: Source;
  appliedDate: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryPeriod?: SalaryPeriod;
  status: ApplicationStatus;
  notes?: string;
}

interface Store {
  applications: JobApplication[];
  companies: Company[];
  loading: boolean;
  error: string | null;
  addApplication: (input: NewApplicationInput) => Promise<void>;
  updateApplication: (appId: string, input: EditApplicationInput) => Promise<void>;
  addEvent: (appId: string, event: Omit<ApplicationEvent, "id">) => Promise<void>;
}

const StoreContext = createContext<Store | null>(null);

function dtoToEvent(dto: ApplicationEventDto): ApplicationEvent {
  return { id: String(dto.id), date: dto.occurredOn, type: dto.type, note: dto.note };
}

function dtoToJobApplication(dto: ApplicationDto, events: ApplicationEvent[] = []): JobApplication {
  return {
    id: String(dto.id),
    companyId: dto.company.id,
    company: dto.company.name,
    role: dto.roleTitle,
    postingUrl: dto.postingUrl,
    location: dto.location,
    workMode: dto.workMode === "UNKNOWN" ? undefined : dto.workMode,
    source: dto.source,
    appliedDate: dto.appliedOn,
    salaryMin: dto.salaryMin,
    salaryMax: dto.salaryMax,
    salaryPeriod: dto.salaryPeriod,
    salaryRange: formatSalaryRange(dto.salaryMin, dto.salaryMax, dto.salaryPeriod),
    status: dto.currentStatus,
    notes: dto.notes,
    events,
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<CompanyDto[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchCompanies(), fetchApplications()])
      .then(async ([companyList, applicationList]) => {
        setCompanies(companyList);
        const eventLists = await Promise.all(applicationList.map((a) => fetchEvents(a.id)));
        setApplications(applicationList.map((a, i) => dtoToJobApplication(a, eventLists[i].map(dtoToEvent))));
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const addApplication = useCallback(
    async (input: NewApplicationInput) => {
      const existing = companies.find((c) => c.name.toLowerCase() === input.companyName.trim().toLowerCase());
      const company = existing ?? (await createCompany({ name: input.companyName.trim() }));
      if (!existing) setCompanies((prev) => [...prev, company]);

      const created = await createApplication({
        companyId: company.id,
        roleTitle: input.role,
        postingUrl: input.postingUrl,
        location: input.location,
        workMode: input.workMode,
        source: input.source,
        appliedOn: input.appliedDate,
        salaryMin: input.salaryMin,
        salaryMax: input.salaryMax,
        salaryPeriod: input.salaryPeriod,
        notes: input.notes,
      });
      // Application creation auto-creates an APPLIED event server-side.
      const events = await fetchEvents(created.id);
      setApplications((prev) => [dtoToJobApplication(created, events.map(dtoToEvent)), ...prev]);
    },
    [companies],
  );

  const updateApplication = useCallback(async (appId: string, input: EditApplicationInput) => {
    const updated = await apiUpdateApplication(Number(appId), {
      companyId: input.companyId,
      roleTitle: input.role,
      postingUrl: input.postingUrl,
      location: input.location,
      workMode: input.workMode,
      source: input.source,
      appliedOn: input.appliedDate,
      salaryMin: input.salaryMin,
      salaryMax: input.salaryMax,
      salaryPeriod: input.salaryPeriod,
      currentStatus: input.status,
      notes: input.notes,
    });
    // A status change auto-creates a matching event server-side — refetch to pick it up.
    const events = await fetchEvents(updated.id);
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? dtoToJobApplication(updated, events.map(dtoToEvent)) : a)),
    );
  }, []);

  const addEvent = useCallback(async (appId: string, event: Omit<ApplicationEvent, "id">) => {
    const created = await createEvent(Number(appId), { occurredOn: event.date, type: event.type, note: event.note });
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, events: [...a.events, dtoToEvent(created)] } : a)),
    );
  }, []);

  const value = useMemo<Store>(
    () => ({
      applications,
      companies,
      loading,
      error,
      addApplication,
      updateApplication,
      addEvent,
    }),
    [applications, companies, loading, error, addApplication, updateApplication, addEvent],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
