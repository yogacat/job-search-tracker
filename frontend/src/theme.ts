import { createTheme, type PaletteMode, type Theme } from "@mui/material/styles";

// Minimalist system carried over from the Zalando app, re-themed around the poppy palette:
// a coral accent used sparingly, hairline borders, Inter + tabular numerals. Both light and
// dark are first-class — see palette.ts for the status colors.

export function buildTheme(mode: PaletteMode): Theme {
  const light = mode === "light";
  return createTheme({
    palette: {
      mode,
      primary: light
        ? { main: "#fa5252", dark: "#e03131", light: "#ff8787", contrastText: "#ffffff" }
        : { main: "#ff8787", dark: "#fa5252", light: "#ffb3b3", contrastText: "#0d0f12" },
      text: light
        ? { primary: "#151a20", secondary: "#6b7280" }
        : { primary: "#e6e8eb", secondary: "#9aa1ab" },
      divider: light ? "#e7e9ec" : "#262b32",
      background: light
        ? { default: "#fafafa", paper: "#ffffff" }
        : { default: "#0d0f12", paper: "#16191e" },
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: "'Inter', -apple-system, 'Segoe UI', 'Helvetica', 'Arial', sans-serif",
      fontSize: 13.5,
      h5: { fontSize: 20, fontWeight: 650, letterSpacing: "-0.02em" },
      h6: { fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em" },
      body2: { fontSize: 13.5 },
      caption: { fontSize: 11.5 },
    },
    components: {
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: ({ theme }) => ({
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.palette.mode === "light" ? "0 1px 2px rgba(16, 24, 40, 0.04)" : "none",
            transition: "box-shadow 120ms ease, border-color 120ms ease",
            "&:hover":
              theme.palette.mode === "light"
                ? { boxShadow: "0 2px 6px rgba(16, 24, 40, 0.07)" }
                : { borderColor: "#333a44" },
          }),
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 8, textTransform: "none", fontWeight: 600, boxShadow: "none" },
        },
      },
      MuiChip: { styleOverrides: { root: { fontWeight: 500 } } },
    },
  });
}
