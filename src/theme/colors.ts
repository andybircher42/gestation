/** Shape of the color token object. */
export type ColorTokens = {
  primary: string;
  primaryDisabled: string;
  primaryLightBg: string;
  destructive: string;
  devButton: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textLabel: string;
  textModal: string;
  textEntryRow: string;
  white: string;
  background: string;
  splashBackground: string;
  inputBackground: string;
  border: string;
  inputBorder: string;
  deleteButtonBg: string;
  modalOverlay: string;
  contentBackground: string;
  shadow: string;
  toastBackground: string;
  toastText: string;
};

/** A personality palette contains light and dark variants. */
export interface PersonalityPalette {
  light: { colors: ColorTokens; rowColors: readonly string[] };
  dark: { colors: ColorTokens; rowColors: readonly string[] };
}

/** Available theme personality styles. */
export type Personality =
  | "classic"
  | "warm"
  | "elegant"
  | "playful"
  | "modern"
  | "mono";

/** Available brightness modes. */
export type Brightness = "system" | "light" | "dark";

/** Available layout modes. */
export type Layout = "compact" | "cozy";

// ---------------------------------------------------------------------------
// Classic (the original blue theme)
// ---------------------------------------------------------------------------

const classicLightColors: ColorTokens = {
  primary: "#2e78c2",
  primaryDisabled: "#7cadd4",
  primaryLightBg: "#e8f0fe",
  destructive: "#dc2626",
  devButton: "#ff6b6b",
  textPrimary: "#333",
  textSecondary: "#666",
  textTertiary: "#6b6b6b",
  textLabel: "#555",
  textModal: "#444",
  textEntryRow: "#333",
  white: "#fff",
  background: "#f5f5f5",
  splashBackground: "#f3f3f1",
  inputBackground: "#fafafa",
  border: "#e0e0e0",
  inputBorder: "#ddd",
  deleteButtonBg: "#f0f0f0",
  modalOverlay: "rgba(0, 0, 0, 0.5)",
  contentBackground: "#fff",
  shadow: "#000",
  toastBackground: "#333",
  toastText: "#fff",
};

const classicDarkColors: ColorTokens = {
  primary: "#3a84cc",
  primaryDisabled: "#2d5a88",
  primaryLightBg: "#213f60",
  destructive: "#ef4444",
  devButton: "#ff6b6b",
  textPrimary: "#e0e0e0",
  textSecondary: "#b0b0b0",
  textTertiary: "#8f8f8f",
  textLabel: "#c0c0c0",
  textModal: "#d0d0d0",
  textEntryRow: "#e0e0e0",
  white: "#fff",
  background: "#121212",
  splashBackground: "#121212",
  inputBackground: "#2a2a2a",
  border: "#333",
  inputBorder: "#444",
  deleteButtonBg: "#333",
  modalOverlay: "rgba(0, 0, 0, 0.7)",
  contentBackground: "#1e1e1e",
  shadow: "#000",
  toastBackground: "#e0e0e0",
  toastText: "#1a1a1a",
};

const classicLightRowColors = [
  "#FFF176",
  "#A5D6A7",
  "#90CAF9",
  "#B39DDB",
  "#CE93D8",
  "#EF9A9A",
  "#FFCC80",
] as const;

const classicDarkRowColors = [
  "#6B5010",
  "#1E4D23",
  "#1B4272",
  "#352063",
  "#4A1E62",
  "#6B1C1C",
  "#6E3410",
] as const;

// ---------------------------------------------------------------------------
// Warm & Confident (terracotta/amber with cream backgrounds)
// ---------------------------------------------------------------------------

const warmLightColors: ColorTokens = {
  primary: "#C06020",
  primaryDisabled: "#D4A07A",
  primaryLightBg: "#FDF0E6",
  destructive: "#C43333",
  devButton: "#ff6b6b",
  textPrimary: "#3D2E22",
  textSecondary: "#6B5744",
  textTertiary: "#8B7A6B",
  textLabel: "#5A4A3A",
  textModal: "#4A3A2A",
  textEntryRow: "#3D2E22",
  white: "#fff",
  background: "#FAF5EF",
  splashBackground: "#FAF5EF",
  inputBackground: "#FFF9F3",
  border: "#E8DDD1",
  inputBorder: "#DDD0C2",
  deleteButtonBg: "#F0E8DE",
  modalOverlay: "rgba(30, 20, 10, 0.5)",
  contentBackground: "#FFFCF8",
  shadow: "#3D2E22",
  toastBackground: "#3D2E22",
  toastText: "#FAF5EF",
};

const warmDarkColors: ColorTokens = {
  primary: "#E8864A",
  primaryDisabled: "#8B5A30",
  primaryLightBg: "#3D2A1A",
  destructive: "#EF5555",
  devButton: "#ff6b6b",
  textPrimary: "#E8DDD1",
  textSecondary: "#B5A594",
  textTertiary: "#8B7A6B",
  textLabel: "#C8B8A6",
  textModal: "#D5C8B8",
  textEntryRow: "#E8DDD1",
  white: "#fff",
  background: "#1A1410",
  splashBackground: "#1A1410",
  inputBackground: "#2E241C",
  border: "#3D3028",
  inputBorder: "#4D3F34",
  deleteButtonBg: "#3D3028",
  modalOverlay: "rgba(0, 0, 0, 0.7)",
  contentBackground: "#241C16",
  shadow: "#000",
  toastBackground: "#E8DDD1",
  toastText: "#1A1410",
};

const warmLightRowColors = [
  "#FFE0A0",
  "#C8E6B0",
  "#A8D4E8",
  "#C8B8E0",
  "#E0B0D0",
  "#E8B0A8",
  "#F0C898",
] as const;

const warmDarkRowColors = [
  "#6B4810",
  "#2A4D1E",
  "#1A3A5A",
  "#3A2858",
  "#4A1E48",
  "#5A1C1C",
  "#5A3010",
] as const;

// ---------------------------------------------------------------------------
// Elegant & Premium (deep plum/burgundy with refined neutrals)
// ---------------------------------------------------------------------------

const elegantLightColors: ColorTokens = {
  primary: "#7B2D5F",
  primaryDisabled: "#B88AA6",
  primaryLightBg: "#F5ECF2",
  destructive: "#B33A3A",
  devButton: "#ff6b6b",
  textPrimary: "#2A1F2D",
  textSecondary: "#5C4D60",
  textTertiary: "#7D7080",
  textLabel: "#4A3D4E",
  textModal: "#3A2D3E",
  textEntryRow: "#2A1F2D",
  white: "#fff",
  background: "#F8F5F7",
  splashBackground: "#F8F5F7",
  inputBackground: "#FDFBFC",
  border: "#E4DDE2",
  inputBorder: "#D8D0D6",
  deleteButtonBg: "#F0EAF0",
  modalOverlay: "rgba(20, 10, 20, 0.5)",
  contentBackground: "#FFFCFE",
  shadow: "#2A1F2D",
  toastBackground: "#2A1F2D",
  toastText: "#F8F5F7",
};

const elegantDarkColors: ColorTokens = {
  primary: "#D48AB8",
  primaryDisabled: "#7A4A68",
  primaryLightBg: "#3D2235",
  destructive: "#EF5555",
  devButton: "#ff6b6b",
  textPrimary: "#E8E0E5",
  textSecondary: "#B5A8B2",
  textTertiary: "#8A7D88",
  textLabel: "#C8BCC5",
  textModal: "#D5CAD2",
  textEntryRow: "#E8E0E5",
  white: "#fff",
  background: "#1A141A",
  splashBackground: "#1A141A",
  inputBackground: "#2C222C",
  border: "#3D303D",
  inputBorder: "#4D3F4D",
  deleteButtonBg: "#3D303D",
  modalOverlay: "rgba(0, 0, 0, 0.7)",
  contentBackground: "#241C24",
  shadow: "#000",
  toastBackground: "#E8E0E5",
  toastText: "#1A141A",
};

const elegantLightRowColors = [
  "#F0D0E0",
  "#C8DCC8",
  "#C8D8F0",
  "#D8C8E8",
  "#E8C0D8",
  "#E8C0C0",
  "#E8D0B8",
] as const;

const elegantDarkRowColors = [
  "#5A2848",
  "#2A4D2A",
  "#1A3A6A",
  "#3A2858",
  "#4A1E48",
  "#5A1C1C",
  "#5A3020",
] as const;

// ---------------------------------------------------------------------------
// Playful & Joyful (coral/teal with bright, energetic accents)
// ---------------------------------------------------------------------------

const playfulLightColors: ColorTokens = {
  primary: "#E0605A",
  primaryDisabled: "#E8A8A5",
  primaryLightBg: "#FFF0EF",
  destructive: "#D43D3D",
  devButton: "#ff6b6b",
  textPrimary: "#2D2A3A",
  textSecondary: "#5A5568",
  textTertiary: "#7A7588",
  textLabel: "#4A4558",
  textModal: "#3A3548",
  textEntryRow: "#2D2A3A",
  white: "#fff",
  background: "#FFF8F5",
  splashBackground: "#FFF8F5",
  inputBackground: "#FFFCFA",
  border: "#F0E0DD",
  inputBorder: "#E8D5D0",
  deleteButtonBg: "#F8ECEA",
  modalOverlay: "rgba(20, 10, 15, 0.45)",
  contentBackground: "#FFFEFB",
  shadow: "#2D2A3A",
  toastBackground: "#2D2A3A",
  toastText: "#FFF8F5",
};

const playfulDarkColors: ColorTokens = {
  primary: "#F08078",
  primaryDisabled: "#8B4A48",
  primaryLightBg: "#3D2020",
  destructive: "#EF5555",
  devButton: "#ff6b6b",
  textPrimary: "#F0E8E5",
  textSecondary: "#C0B5B0",
  textTertiary: "#908580",
  textLabel: "#D0C5C0",
  textModal: "#E0D5D0",
  textEntryRow: "#F0E8E5",
  white: "#fff",
  background: "#1C1618",
  splashBackground: "#1C1618",
  inputBackground: "#2E2428",
  border: "#402E32",
  inputBorder: "#503E42",
  deleteButtonBg: "#402E32",
  modalOverlay: "rgba(0, 0, 0, 0.7)",
  contentBackground: "#261E22",
  shadow: "#000",
  toastBackground: "#F0E8E5",
  toastText: "#1C1618",
};

const playfulLightRowColors = [
  "#FFD8A8",
  "#A8E8C8",
  "#A8D8F8",
  "#D0B8F0",
  "#F0B8D8",
  "#F0B0B0",
  "#F8D0A0",
] as const;

const playfulDarkRowColors = [
  "#6B4810",
  "#1E5040",
  "#1A3A6A",
  "#3A2060",
  "#5A1E50",
  "#6B1C1C",
  "#6B3810",
] as const;

// ---------------------------------------------------------------------------
// Modern & Minimal (slate blue with clean, sharp neutrals)
// ---------------------------------------------------------------------------

const modernLightColors: ColorTokens = {
  primary: "#4A6FA5",
  primaryDisabled: "#8AAAD0",
  primaryLightBg: "#EEF2F8",
  destructive: "#D04040",
  devButton: "#ff6b6b",
  textPrimary: "#1A1D24",
  textSecondary: "#4A4E58",
  textTertiary: "#6A6E78",
  textLabel: "#3A3E48",
  textModal: "#2A2E38",
  textEntryRow: "#1A1D24",
  white: "#fff",
  background: "#F4F5F7",
  splashBackground: "#F4F5F7",
  inputBackground: "#FAFBFC",
  border: "#DFE1E6",
  inputBorder: "#D2D4D9",
  deleteButtonBg: "#ECEDF0",
  modalOverlay: "rgba(10, 12, 18, 0.5)",
  contentBackground: "#FFFFFF",
  shadow: "#1A1D24",
  toastBackground: "#1A1D24",
  toastText: "#F4F5F7",
};

const modernDarkColors: ColorTokens = {
  primary: "#6A9AD8",
  primaryDisabled: "#3D5A80",
  primaryLightBg: "#1E2A3D",
  destructive: "#EF5555",
  devButton: "#ff6b6b",
  textPrimary: "#E2E4E8",
  textSecondary: "#A0A4B0",
  textTertiary: "#787C88",
  textLabel: "#B8BCC5",
  textModal: "#C8CCD5",
  textEntryRow: "#E2E4E8",
  white: "#fff",
  background: "#12141A",
  splashBackground: "#12141A",
  inputBackground: "#22242C",
  border: "#30323A",
  inputBorder: "#40424A",
  deleteButtonBg: "#30323A",
  modalOverlay: "rgba(0, 0, 0, 0.7)",
  contentBackground: "#1A1C22",
  shadow: "#000",
  toastBackground: "#E2E4E8",
  toastText: "#12141A",
};

const modernLightRowColors = [
  "#E0E8F8",
  "#C8E8D8",
  "#B8D8F0",
  "#D0C8E8",
  "#E0C0D8",
  "#E8C8C8",
  "#E0D8C8",
] as const;

const modernDarkRowColors = [
  "#2A3A58",
  "#1E4838",
  "#1A3A60",
  "#302858",
  "#481E48",
  "#581C1C",
  "#483018",
] as const;

// ---------------------------------------------------------------------------
// Mono (B&W — same palette for light and dark)
// ---------------------------------------------------------------------------

const monoColors: ColorTokens = {
  primary: "#555",
  primaryDisabled: "#aaa",
  primaryLightBg: "#e8e8e8",
  destructive: "#222",
  devButton: "#777",
  textPrimary: "#111",
  textSecondary: "#444",
  textTertiary: "#6b6b6b",
  textLabel: "#333",
  textModal: "#222",
  textEntryRow: "#111",
  white: "#fff",
  background: "#f0f0f0",
  splashBackground: "#f0f0f0",
  inputBackground: "#fafafa",
  border: "#ccc",
  inputBorder: "#bbb",
  deleteButtonBg: "#e0e0e0",
  modalOverlay: "rgba(0, 0, 0, 0.5)",
  contentBackground: "#fff",
  shadow: "#000",
  toastBackground: "#222",
  toastText: "#eee",
};

const monoRowColors = ["#f5f5f5", "#e0e0e0", "#cccccc", "#b8b8b8"] as const;

// ---------------------------------------------------------------------------
// Palettes record
// ---------------------------------------------------------------------------

/** All personality palettes indexed by personality key. */
export const palettes: Record<Personality, PersonalityPalette> = {
  classic: {
    light: { colors: classicLightColors, rowColors: classicLightRowColors },
    dark: { colors: classicDarkColors, rowColors: classicDarkRowColors },
  },
  warm: {
    light: { colors: warmLightColors, rowColors: warmLightRowColors },
    dark: { colors: warmDarkColors, rowColors: warmDarkRowColors },
  },
  elegant: {
    light: { colors: elegantLightColors, rowColors: elegantLightRowColors },
    dark: { colors: elegantDarkColors, rowColors: elegantDarkRowColors },
  },
  playful: {
    light: { colors: playfulLightColors, rowColors: playfulLightRowColors },
    dark: { colors: playfulDarkColors, rowColors: playfulDarkRowColors },
  },
  modern: {
    light: { colors: modernLightColors, rowColors: modernLightRowColors },
    dark: { colors: modernDarkColors, rowColors: modernDarkRowColors },
  },
  mono: {
    light: { colors: monoColors, rowColors: monoRowColors },
    dark: { colors: monoColors, rowColors: monoRowColors },
  },
};

// ---------------------------------------------------------------------------
// Legacy aliases (kept for existing test imports)
// ---------------------------------------------------------------------------

export {
  classicDarkColors as darkColors,
  classicDarkRowColors as darkRowColors,
  classicLightColors as lightColors,
  classicLightRowColors as lightRowColors,
  monoColors,
  monoRowColors,
};
