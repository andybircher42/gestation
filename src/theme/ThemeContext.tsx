import { createContext, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";

import {
  ColorTokens,
  darkColors,
  darkRowColors,
  lightColors,
  lightRowColors,
} from "@/theme/colors";

/** User-selected theme mode. */
export type ThemeMode = "system" | "light" | "dark";

interface ThemeContextValue {
  colors: ColorTokens;
  rowColors: readonly string[];
  resolvedTheme: "light" | "dark";
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  children: React.ReactNode;
}

/** Provides resolved theme colors to the component tree. */
export function ThemeProvider({
  themeMode,
  setThemeMode,
  children,
}: ThemeProviderProps) {
  const systemScheme = useColorScheme();

  const resolvedTheme: "light" | "dark" =
    themeMode === "system"
      ? systemScheme === "dark"
        ? "dark"
        : "light"
      : themeMode;

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: resolvedTheme === "dark" ? darkColors : lightColors,
      rowColors: resolvedTheme === "dark" ? darkRowColors : lightRowColors,
      resolvedTheme,
      themeMode,
      setThemeMode,
    }),
    [resolvedTheme, themeMode, setThemeMode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/** Returns the current theme colors and mode. Must be used inside ThemeProvider. */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
