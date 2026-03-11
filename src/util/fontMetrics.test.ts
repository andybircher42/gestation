import { Platform } from "react-native";

import { lineHeight } from "./fontMetrics";

describe("lineHeight", () => {
  const originalOS = Platform.OS;

  afterEach(() => {
    (Platform as { OS: string }).OS = originalOS;
  });

  it("returns the value unchanged on iOS", () => {
    (Platform as { OS: string }).OS = "ios";
    expect(lineHeight(28)).toBe(28);
  });

  it("adds 2px on Android to prevent clipping with custom fonts", () => {
    (Platform as { OS: string }).OS = "android";
    expect(lineHeight(28)).toBe(30);
  });

  it("works with various lineHeight values on Android", () => {
    (Platform as { OS: string }).OS = "android";
    expect(lineHeight(18)).toBe(20);
    expect(lineHeight(22)).toBe(24);
  });
});
