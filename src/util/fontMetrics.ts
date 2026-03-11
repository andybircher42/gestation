import { Platform } from "react-native";

/**
 * Android renders custom fonts with tighter vertical metrics than iOS,
 * which can clip descenders (g, y, p, q) and diacritics. This helper
 * adds a small platform-specific adjustment to lineHeight values.
 */
const ANDROID_LINE_HEIGHT_EXTRA = 2;

/** Returns a platform-adjusted lineHeight for custom fonts. */
export function lineHeight(value: number): number {
  return Platform.OS === "android" ? value + ANDROID_LINE_HEIGHT_EXTRA : value;
}
