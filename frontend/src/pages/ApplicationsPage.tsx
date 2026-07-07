import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Link as MuiLink,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Link } from "react-router-dom";
import { useStore } from "../store";
import { ACTIVE_STATUSES, type JobApplication } from "../types";
import { StatusChip, SoftChip } from "../chips";
import { rowAccentKey } from "../accent";
import { barColor } from "../palette";
import { formatDate, relativeDay, daysUntil } from "../format";
import { AddApplicationDialog } from "../components/AddApplicationDialog";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Box sx={{ textAlign: "center", minWidth: 56 }}>
      <Typography sx={{ fontWeight: 650, fontSize: 20, fontVariantNumeric: "tabular-nums" }}>{value}</Typography>
      <Typography variant="caption" sx={{ color: "text.secondary", letterSpacing: "0.05em", fontWeight: 600 }}>
        {label.toUpperCase()}
      </Typography>
    </Box>
  );
}

const WORK_MODE_LABEL: Record<string, string> = { REMOTE: "Remote", HYBRID: "Hybrid", ONSITE: "Onsite" };

export function ApplicationsPage() {
  const { applications } = useStore();
  const [addOpen, setAddOpen] = useState(false);

  const stats = useMemo(() => {
    const by = (s: string) => applications.filter((a) => a.status === s).length;
    return {
      total: applications.length,
      active: applications.filter((a) => ACTIVE_STATUSES.includes(a.status)).length,
      interviews: by("INTERVIEW"),
      offers: by("OFFER") + by("ACCEPTED"),
      rejected: by("REJECTED") + by("GHOSTED") + by("WITHDRAWN"),
    };
  }, [applications]);

  return (
    <>
      <Stack
        direction="row"
        sx={{ justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 1.5, mb: 0.5 }}
      >
        <Box>
          <Typography variant="h5">Applications</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
            {stats.active} active &middot; {stats.total} total
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
          Add application
        </Button>
      </Stack>

      <Card>
        <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
          <Stack direction="row" sx={{ justifyContent: "space-around", flexWrap: "wrap", gap: 1 }}>
            <Stat label="Total" value={stats.total} />
            <Stat label="Active" value={stats.active} />
            <Stat label="Interviews" value={stats.interviews} />
            <Stat label="Offers" value={stats.offers} />
            <Stat label="Closed" value={stats.rejected} />
          </Stack>
        </CardContent>
      </Card>

      {applications.map((app) => (
        <ApplicationCard key={app.id} app={app} />
      ))}

      <AddApplicationDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}

function ApplicationCard({ app }: { app: JobApplication }) {
  const mode = useTheme().palette.mode;
  const accentKey = rowAccentKey(app);
  const accent = accentKey ? barColor(mode, accentKey) : undefined;
  const overdue = app.nextStepDate ? daysUntil(app.nextStepDate) < 0 : false;
  const dueSoon = app.nextStepDate ? daysUntil(app.nextStepDate) >= 0 && daysUntil(app.nextStepDate) <= 3 : false;

  return (
    <Card sx={accent ? { borderLeft: `3px solid ${accent}` } : undefined}>
      <CardContent sx={{ px: 2.5, py: 2, "&:last-child": { pb: 2 } }}>
        <MuiLink component={Link} to={`/applications/${app.id}`} underline="none" color="inherit">
          <Stack
            direction="row"
            sx={{ justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1 }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                <Typography sx={{ fontWeight: 650, fontSize: 15 }}>{app.company}</Typography>
                {app.workMode && <SoftChip label={WORK_MODE_LABEL[app.workMode]} color="sand" />}
              </Stack>
              <Typography variant="body2" sx={{ color: "text.secondary", fontSize: 13 }}>
                {app.role}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5 }}>
                Applied {formatDate(app.appliedDate)} &middot; {app.source}
                {app.location ? ` · ${app.location}` : ""}
              </Typography>
            </Box>
            <Stack spacing={0.75} sx={{ alignItems: "flex-end" }}>
              <StatusChip status={app.status} />
              {app.salaryRange && (
                <Typography variant="caption" sx={{ color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>
                  {app.salaryRange}
                </Typography>
              )}
            </Stack>
          </Stack>
        </MuiLink>

        {app.nextStep && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                <Box component="span" sx={{ color: "text.primary", fontWeight: 600 }}>
                  Next:
                </Box>{" "}
                {app.nextStep}
              </Typography>
              {app.nextStepDate && (
                <SoftChip
                  label={`${formatDate(app.nextStepDate)} · ${relativeDay(app.nextStepDate)}`}
                  color={overdue ? "crimson" : dueSoon ? "gold" : "gray"}
                />
              )}
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
}
