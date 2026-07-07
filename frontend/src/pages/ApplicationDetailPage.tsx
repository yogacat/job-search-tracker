import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Link as MuiLink,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import AddIcon from "@mui/icons-material/Add";
import { Link, useParams } from "react-router-dom";
import { useStore } from "../store";
import { StatusChip, SoftChip, useEventColor } from "../chips";
import { formatDate, sentenceCase } from "../format";
import { AddEventDialog } from "../components/AddEventDialog";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.25 }}>
        {children}
      </Typography>
    </Box>
  );
}

const WORK_MODE_LABEL: Record<string, string> = { REMOTE: "Remote", HYBRID: "Hybrid", ONSITE: "Onsite" };

export function ApplicationDetailPage() {
  const { id } = useParams();
  const { applications } = useStore();
  const [addEventOpen, setAddEventOpen] = useState(false);
  const eventColor = useEventColor();
  const app = applications.find((a) => a.id === id);

  if (!app) {
    return (
      <Typography color="text.secondary">
        Application not found. <MuiLink component={Link} to="/">Back to applications</MuiLink>
      </Typography>
    );
  }

  const events = [...app.events].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <MuiLink
        component={Link}
        to="/"
        underline="none"
        sx={{ color: "text.secondary", display: "inline-flex", alignItems: "center", gap: 0.5, fontSize: 13 }}
      >
        <ArrowBackIcon sx={{ fontSize: 16 }} /> Applications
      </MuiLink>

      <Card>
        <CardContent sx={{ px: 3, py: 2.5 }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", gap: 1, flexWrap: "wrap" }}>
            <Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                <Typography variant="h5">{app.company}</Typography>
                {app.workMode && <SoftChip label={WORK_MODE_LABEL[app.workMode]} color="sand" />}
              </Stack>
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
                {app.role}
              </Typography>
            </Box>
            <StatusChip status={app.status} />
          </Stack>

          {app.postingUrl && (
            <MuiLink
              href={app.postingUrl}
              target="_blank"
              rel="noreferrer"
              sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontSize: 13, mt: 1 }}
            >
              View posting <OpenInNewIcon sx={{ fontSize: 14 }} />
            </MuiLink>
          )}

          <Divider sx={{ my: 2 }} />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" },
              gap: 2,
            }}
          >
            <Field label="Applied">{formatDate(app.appliedDate)}</Field>
            <Field label="Source">{app.source}</Field>
            <Field label="Location">{app.location ?? "—"}</Field>
            <Field label="Salary range">{app.salaryRange ?? "—"}</Field>
            <Field label="Contact">{app.contactPerson ?? "—"}</Field>
            <Field label="Next step">{app.nextStep ? `${app.nextStep}${app.nextStepDate ? ` (${formatDate(app.nextStepDate)})` : ""}` : "—"}</Field>
          </Box>

          {app.notes && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>
                Notes
              </Typography>
              <Typography variant="body2">{app.notes}</Typography>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ px: 3, py: 2.5 }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6">Timeline</Typography>
            <Button size="small" startIcon={<AddIcon />} onClick={() => setAddEventOpen(true)}>
              Add step
            </Button>
          </Stack>

          <Stack spacing={0}>
            {events.map((ev, i) => (
              <Stack key={ev.id} direction="row" spacing={1.5}>
                {/* rail */}
                <Stack sx={{ alignItems: "center" }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: eventColor(ev.type), mt: 0.5 }} />
                  {i < events.length - 1 && <Box sx={{ width: 2, flex: 1, bgcolor: "divider", my: 0.25 }} />}
                </Stack>
                <Box sx={{ pb: i < events.length - 1 ? 2 : 0, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {sentenceCase(ev.type)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {formatDate(ev.date)}
                  </Typography>
                  {ev.note && (
                    <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
                      {ev.note}
                    </Typography>
                  )}
                </Box>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <AddEventDialog appId={app.id} open={addEventOpen} onClose={() => setAddEventOpen(false)} />
    </>
  );
}
