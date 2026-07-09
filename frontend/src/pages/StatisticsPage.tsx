import { useMemo } from "react";
import { Box, Card, CardContent, Stack, Typography, useTheme } from "@mui/material";
import { useStore } from "../store";
import type { ApplicationStatus } from "../types";
import { dot } from "../palette";
import { buildFunnel } from "../lib/funnel";
import { SankeyChart } from "../components/SankeyChart";

const LEGEND: { label: string; key: Parameters<typeof dot>[1] }[] = [
  { label: "Intake", key: "blue" },
  { label: "Interview stages", key: "gold" },
  { label: "Offer", key: "olive" },
  { label: "Accepted", key: "oliveDeep" },
  { label: "Drop-off", key: "crimson" },
  { label: "Withdrew / declined", key: "gray" },
];

export function StatisticsPage() {
  const { applications } = useStore();
  const mode = useTheme().palette.mode;

  const funnel = useMemo(() => buildFunnel(applications), [applications]);

  const { total, interviewRate, offerRate } = useMemo(() => {
    const by = (s: ApplicationStatus) => applications.filter((a) => a.status === s).length;
    const reachedInterview = applications.filter((a) =>
      a.events.some((e) => e.type === "INTERVIEW" || e.type === "TECHNICAL_INTERVIEW"),
    ).length;
    const t = applications.length;
    return {
      total: t,
      interviewRate: t ? Math.round((reachedInterview / t) * 100) : 0,
      offerRate: t ? Math.round(((by("OFFER") + by("ACCEPTED")) / t) * 100) : 0,
    };
  }, [applications]);

  return (
    <>
      <Typography variant="h5">Statistics</Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
        <Metric label="Total applications" value={String(total)} />
        <Metric label="Interview rate" value={`${interviewRate}%`} />
        <Metric label="Offer rate" value={`${offerRate}%`} />
      </Box>

      <Card>
        <CardContent sx={{ px: { xs: 1.5, sm: 3 }, py: 2.5 }}>
          <Stack
            direction="row"
            sx={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1, mb: 1.5, px: { xs: 1, sm: 0 } }}
          >
            <Typography variant="h6">Application funnel</Typography>
            <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", rowGap: 0.5 }}>
              {LEGEND.map((item) => (
                <Stack key={item.label} direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: 0.5, bgcolor: dot(mode, item.key) }} />
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {item.label}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
          <SankeyChart nodes={funnel.nodes} links={funnel.links} />
        </CardContent>
      </Card>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent sx={{ px: { xs: 1.5, sm: 2.5 }, py: 2, "&:last-child": { pb: 2 } }}>
        <Typography sx={{ fontWeight: 700, fontSize: 26, fontVariantNumeric: "tabular-nums" }}>{value}</Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}
