import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { ApplicationEvent, JobApplication } from "./types";
import { MOCK_APPLICATIONS } from "./mockData";

// Tiny in-memory store so the mock's add / add-event actions actually do something.
// Swap this for react-query hooks against the real backend later.

interface Store {
  applications: JobApplication[];
  addApplication: (app: Omit<JobApplication, "id" | "events">) => void;
  addEvent: (appId: string, event: Omit<ApplicationEvent, "id">) => void;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<JobApplication[]>(MOCK_APPLICATIONS);

  const value = useMemo<Store>(
    () => ({
      applications,
      addApplication: (app) =>
        setApplications((prev) => [
          {
            ...app,
            id: `a${Date.now()}`,
            events: [{ id: `e${Date.now()}`, date: app.appliedDate, type: "APPLIED" }],
          },
          ...prev,
        ]),
      addEvent: (appId, event) =>
        setApplications((prev) =>
          prev.map((a) =>
            a.id === appId
              ? { ...a, events: [...a.events, { ...event, id: `e${Date.now()}` }] }
              : a,
          ),
        ),
    }),
    [applications],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
