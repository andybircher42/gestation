/** Light color palette. */
const lightColors = {
  primary: "#2e78c2",
  primaryDisabled: "#7cadd4",
  primaryLightBg: "#e8f0fe",
  destructive: "#dc2626",
  devButton: "#ff6b6b",
  textPrimary: "#333",
  textSecondary: "#666",
  textTertiary: "#767676",
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
} as const;

/** Dark color palette. */
const darkColors: ColorTokens = {
  primary: "#3a84cc",
  primaryDisabled: "#2d5a88",
  primaryLightBg: "#213f60",
  destructive: "#dc2626",
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

/** Monochrome (black & white) color palette. */
const monoColors: ColorTokens = {
  primary: "#555",
  primaryDisabled: "#aaa",
  primaryLightBg: "#e8e8e8",
  destructive: "#222",
  devButton: "#777",
  textPrimary: "#111",
  textSecondary: "#444",
  textTertiary: "#767676",
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

/** Light-mode rainbow row colors (pastel shades). */
const lightRowColors = [
  "#FFF176",
  "#A5D6A7",
  "#90CAF9",
  "#B39DDB",
  "#CE93D8",
  "#EF9A9A",
  "#FFCC80",
] as const;

/** Dark-mode rainbow row colors (deep Material shades). */
const darkRowColors = [
  "#6B5010",
  "#1E4D23",
  "#1B4272",
  "#352063",
  "#4A1E62",
  "#6B1C1C",
  "#6E3410",
] as const;

/** Monochrome row colors (wider gray spread for visual rhythm). */
const monoRowColors = ["#f5f5f5", "#e0e0e0", "#cccccc", "#b8b8b8"] as const;

/** Shape of the color token object. */
export type ColorTokens = { [K in keyof typeof lightColors]: string };

export {
  darkColors,
  darkRowColors,
  lightColors,
  lightRowColors,
  monoColors,
  monoRowColors,
};
