import React from "react";
import { Text } from "react-native";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { ThemeProvider } from "@/theme";

import ErrorBoundary from "./ErrorBoundary";

/** Component that throws on render. */
function ThrowingChild({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Test crash");
  }
  return <Text>OK</Text>;
}

/** Wraps children with ThemeProvider for testing. */
function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      personality="classic"
      brightness="light"
      layout="compact"
      setPersonality={jest.fn()}
      setBrightness={jest.fn()}
      setLayout={jest.fn()}
    >
      {children}
    </ThemeProvider>
  );
}

beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("ErrorBoundary", () => {
  it("renders children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={false} />
      </ErrorBoundary>,
      { wrapper: Wrapper },
    );

    expect(screen.getByText("OK")).toBeTruthy();
  });

  it("shows error UI when a child throws", () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
      { wrapper: Wrapper },
    );

    expect(screen.getByTestId("error-boundary")).toBeTruthy();
    expect(screen.getByText("Something went wrong")).toBeTruthy();
    expect(screen.getByText("Test crash")).toBeTruthy();
  });

  it("recovers when 'Try again' is pressed", () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
      { wrapper: Wrapper },
    );

    expect(screen.getByTestId("error-boundary")).toBeTruthy();

    // Re-render with non-throwing child before pressing retry
    rerender(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={false} />
      </ErrorBoundary>,
    );

    fireEvent.press(screen.getByLabelText("Try again"));

    expect(screen.getByText("OK")).toBeTruthy();
    expect(screen.queryByTestId("error-boundary")).toBeNull();
  });
});
