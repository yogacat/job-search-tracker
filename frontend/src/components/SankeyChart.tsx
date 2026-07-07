import { useMemo } from "react";
import { Box, useTheme } from "@mui/material";
import { sankey, sankeyJustify, sankeyLinkHorizontal } from "d3-sankey";
import type { SankeyGraph, SankeyNode, SankeyLink } from "d3-sankey";
import type { PaletteMode } from "@mui/material";
import { dot } from "../palette";
import type { FunnelLink, FunnelNode, NodeCategory } from "../lib/funnel";

// A themed horizontal Sankey. Node/link colors come from the poppy palette by category, so the
// funnel reads at a glance: blue = intake, gold = interview stages, olive/green = offers &
// accepted, crimson = drop-offs.

function categoryColor(mode: PaletteMode, category: NodeCategory): string {
  switch (category) {
    case "source":
      return dot(mode, "blue");
    case "stage":
      return dot(mode, "gold");
    case "offer":
      return dot(mode, "olive");
    case "success":
      return dot(mode, "oliveDeep");
    case "reject":
      return dot(mode, "crimson");
    case "neutral":
    default:
      return dot(mode, "gray");
  }
}

const WIDTH = 920;
const HEIGHT = 520;

type SNode = SankeyNode<FunnelNode, FunnelLink>;
type SLink = SankeyLink<FunnelNode, FunnelLink>;

export function SankeyChart({ nodes, links }: { nodes: FunnelNode[]; links: FunnelLink[] }) {
  const theme = useTheme();
  const mode = theme.palette.mode;

  const graph = useMemo<SankeyGraph<FunnelNode, FunnelLink>>(() => {
    const generator = sankey<FunnelNode, FunnelLink>()
      .nodeWidth(13)
      .nodePadding(18)
      .nodeAlign(sankeyJustify)
      .extent([
        [1, 6],
        [WIDTH - 1, HEIGHT - 6],
      ]);
    // d3-sankey mutates its input, so hand it fresh copies.
    return generator({
      nodes: nodes.map((n) => ({ ...n })),
      links: links.map((l) => ({ ...l })),
    });
  }, [nodes, links]);

  const linkPath = sankeyLinkHorizontal<FunnelNode, FunnelLink>();

  return (
    <Box sx={{ width: "100%", overflow: "hidden" }}>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" preserveAspectRatio="xMinYMin meet" role="img" aria-label="Application funnel">
        <g fill="none">
          {graph.links.map((link, i) => {
            const target = link.target as SNode;
            return (
              <path
                key={i}
                d={linkPath(link as SLink) ?? undefined}
                stroke={categoryColor(mode, target.category)}
                strokeOpacity={mode === "light" ? 0.4 : 0.5}
                strokeWidth={Math.max(1, link.width ?? 1)}
              />
            );
          })}
        </g>
        <g>
          {graph.nodes.map((node, i) => {
            const n = node as SNode;
            const x0 = n.x0 ?? 0;
            const x1 = n.x1 ?? 0;
            const y0 = n.y0 ?? 0;
            const y1 = n.y1 ?? 0;
            const leftHalf = x0 < WIDTH / 2;
            const color = categoryColor(mode, n.category);
            return (
              <g key={i}>
                <rect x={x0} y={y0} width={x1 - x0} height={Math.max(1, y1 - y0)} fill={color} rx={1.5} />
                <text
                  x={leftHalf ? x1 + 7 : x0 - 7}
                  y={(y0 + y1) / 2}
                  dy="0.35em"
                  textAnchor={leftHalf ? "start" : "end"}
                  fontSize={12.5}
                  fontWeight={500}
                  fill={theme.palette.text.primary}
                >
                  {n.name}
                  <tspan fill={theme.palette.text.secondary} fontWeight={400}>{`  ${n.value ?? 0}`}</tspan>
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </Box>
  );
}
