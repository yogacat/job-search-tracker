import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import type { PaletteMode } from "@mui/material";
import { buildTheme } from "./theme";

// Light/dark toggle. Remembers the choice in localStorage; first visit follows the OS setting.

const STORAGE_KEY = "jst-color-mode";

const ColorModeContext = createContext<{ mode: PaletteMode; toggle: () => void }>({
  mode: "light",
  toggle: () => {},
});

export function useColorMode() {
  return useContext(ColorModeContext);
}

function initialMode(): PaletteMode {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PaletteMode>(initialMode);

  const value = useMemo(
    () => ({
      mode,
      toggle: () =>
        setMode((m) => {
          const next = m === "light" ? "dark" : "light";
          localStorage.setItem(STORAGE_KEY, next);
          return next;
        }),
    }),
    [mode],
  );

  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
