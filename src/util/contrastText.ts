/**
 * Returns "#ffffff" or "#1a1a1a" depending on which has better contrast
 * against the given hex background color. Uses WCAG relative luminance.
 */
export function contrastText(hexColor: string): "#ffffff" | "#1a1a1a" {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // sRGB to linear
  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  const luminance =
    0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

  // Threshold ~0.4 favors readability on mid-tones
  return luminance > 0.4 ? "#1a1a1a" : "#ffffff";
}
