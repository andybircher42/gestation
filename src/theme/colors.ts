/** Light color palette. */
const lightColors = {
  primary: "#4a90d9",
  primaryDisabled: "#a0c4e8",
  primaryLightBg: "#e8f0fe",
  destructive: "#ef4444",
  devButton: "#ff6b6b",
  textPrimary: "#333",
  textSecondary: "#666",
  textTertiary: "#999",
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
  toastBackground: "#333",
  toastText: "#fff",
} as const;

/** Dark color palette. */
const darkColors: ColorTokens = {
  primary: "#5a9fe6",
  primaryDisabled: "#3a6a9e",
  primaryLightBg: "#1a2a3e",
  destructive: "#ef4444",
  devButton: "#ff6b6b",
  textPrimary: "#e0e0e0",
  textSecondary: "#b0b0b0",
  textTertiary: "#808080",
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
  toastBackground: "#e0e0e0",
  toastText: "#1a1a1a",
};

/** Light-mode rainbow row colors (pastel shades). */
const lightRowColors = [
  "#EF9A9A",
  "#FFCC80",
  "#FFF176",
  "#A5D6A7",
  "#90CAF9",
  "#B39DDB",
  "#CE93D8",
] as const;

/** Dark-mode rainbow row colors (deep Material shades). */
const darkRowColors = [
  "#C62828",
  "#E65100",
  "#F9A825",
  "#2E7D32",
  "#1565C0",
  "#4527A0",
  "#6A1B9A",
] as const;

/** Shape of the color token object. */
export type ColorTokens = typeof lightColors;

export { darkColors, darkRowColors,lightColors, lightRowColors };
