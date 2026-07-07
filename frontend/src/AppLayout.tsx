import { useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import WorkOutlineIcon from "@mui/icons-material/WorkOutlineOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useColorMode } from "./colorMode";
import { ExportDialog } from "./components/ExportDialog";

const DRAWER_WIDTH = 240;

const LINKS = [
  { to: "/", label: "Applications", icon: <WorkOutlineIcon /> },
  { to: "/statistics", label: "Statistics", icon: <InsightsOutlinedIcon /> },
];

export function AppLayout() {
  const location = useLocation();
  const { mode, toggle } = useColorMode();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const nav = (
    <List sx={{ px: 1.25, py: 1.5 }}>
      {LINKS.map((link) => {
        const active = location.pathname === link.to;
        return (
          <ListItemButton
            key={link.to}
            component={Link}
            to={link.to}
            onClick={() => setMobileOpen(false)}
            selected={active}
            sx={{
              borderRadius: 2,
              mb: 0.25,
              py: 0.75,
              color: "text.secondary",
              "&:hover": { bgcolor: "action.hover" },
              "&.Mui-selected": {
                bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
                color: "primary.main",
                "&:hover": { bgcolor: (t) => alpha(t.palette.primary.main, 0.18) },
                "& .MuiListItemIcon-root": { color: "primary.main" },
              },
            }}
          >
            <ListItemIcon
              sx={{ minWidth: 34, color: active ? "primary.main" : "text.secondary", "& svg": { fontSize: 19 } }}
            >
              {link.icon}
            </ListItemIcon>
            <ListItemText
              primary={link.label}
              slotProps={{ primary: { noWrap: true, sx: { fontSize: 13.5, fontWeight: active ? 600 : 500 } } }}
            />
          </ListItemButton>
        );
      })}
    </List>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: "background.paper",
          color: "text.primary",
          borderBottom: 1,
          borderColor: "divider",
          zIndex: (t) => t.zIndex.drawer + 1,
        }}
      >
        <Toolbar variant="dense" sx={{ minHeight: 52, gap: 1 }}>
          <IconButton edge="start" sx={{ display: { sm: "none" } }} onClick={() => setMobileOpen(!mobileOpen)}>
            <MenuIcon />
          </IconButton>
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: 1.5,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              display: "grid",
              placeItems: "center",
            }}
          >
            <WorkOutlineIcon sx={{ fontSize: 15 }} />
          </Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 650, fontSize: 14.5, flexGrow: 1 }}>
            Job Search Tracker
          </Typography>
          <Tooltip title={mode === "light" ? "Switch to dark" : "Switch to light"}>
            <IconButton size="small" onClick={toggle} sx={{ color: "text.secondary" }} aria-label="Toggle color mode">
              {mode === "light" ? (
                <DarkModeOutlinedIcon sx={{ fontSize: 18 }} />
              ) : (
                <LightModeOutlinedIcon sx={{ fontSize: 18 }} />
              )}
            </IconButton>
          </Tooltip>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<FileDownloadOutlinedIcon />}
            sx={{ borderColor: "divider", color: "text.secondary" }}
            onClick={() => setExportOpen(true)}
          >
            Export .xlsx
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { xs: "block", sm: "none" }, "& .MuiDrawer-paper": { width: DRAWER_WIDTH } }}
      >
        <Toolbar variant="dense" sx={{ minHeight: 52 }} />
        {nav}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, bgcolor: "background.paper", borderRight: 1, borderColor: "divider" },
        }}
      >
        <Toolbar variant="dense" sx={{ minHeight: 52 }} />
        {nav}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3.5 }, minWidth: 0, maxWidth: 900, mx: "auto" }}>
        <Toolbar variant="dense" sx={{ minHeight: 52 }} />
        <Stack spacing={2}>
          <Outlet />
        </Stack>
      </Box>

      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
    </Box>
  );
}
