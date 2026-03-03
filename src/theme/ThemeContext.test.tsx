import { Text } from "react-native";
import * as RN from "react-native";
import { render, screen } from "@testing-library/react-native";

import { darkColors, lightColors } from "@/theme/colors";

import { ThemeProvider, useTheme } from "./ThemeContext";

function TestConsumer() {
  const { colors, resolvedTheme } = useTheme();
  return (
    <>
      <Text testID="bg">{colors.background}</Text>
      <Text testID="theme">{resolvedTheme}</Text>
    </>
  );
}

describe("ThemeContext", () => {
  it("provides light colors when themeMode is light", () => {
    render(
      <ThemeProvider themeMode="light" setThemeMode={jest.fn()}>
        <TestConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("bg").props.children).toBe(
      lightColors.background,
    );
    expect(screen.getByTestId("theme").props.children).toBe("light");
  });

  it("provides dark colors when themeMode is dark", () => {
    render(
      <ThemeProvider themeMode="dark" setThemeMode={jest.fn()}>
        <TestConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("bg").props.children).toBe(darkColors.background);
    expect(screen.getByTestId("theme").props.children).toBe("dark");
  });

  it("resolves system mode using useColorScheme", () => {
    jest.spyOn(RN, "useColorScheme").mockReturnValue("dark");

    render(
      <ThemeProvider themeMode="system" setThemeMode={jest.fn()}>
        <TestConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("theme").props.children).toBe("dark");

    jest.restoreAllMocks();
  });

  it("defaults to light when system returns null", () => {
    jest.spyOn(RN, "useColorScheme").mockReturnValue(null);

    render(
      <ThemeProvider themeMode="system" setThemeMode={jest.fn()}>
        <TestConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("theme").props.children).toBe("light");

    jest.restoreAllMocks();
  });

  it("useTheme throws outside ThemeProvider", () => {
    // Suppress console.error for expected error
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<TestConsumer />)).toThrow(
      "useTheme must be used within a ThemeProvider",
    );

    spy.mockRestore();
  });
});
