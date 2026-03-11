import AsyncStorage from "@react-native-async-storage/async-storage";
import { render, screen, waitFor } from "@testing-library/react-native";

import App from "./App";

jest.mock("expo-font", () => ({
  loadAsync: jest.fn().mockResolvedValue(undefined),
  isLoaded: jest.fn().mockReturnValue(true),
}));

jest.mock("@react-navigation/native", () => {
  const actual = jest.requireActual<typeof import("@react-navigation/native")>(
    "@react-navigation/native",
  );
  return {
    ...actual,
    NavigationContainer: ({ children }: { children: React.ReactNode }) =>
      children,
  };
});

jest.mock("@react-navigation/native-stack", () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({
      children,
    }: {
      children: React.ReactNode;
      initialRouteName?: string;
      screenOptions?: unknown;
    }) => children,
    Screen: ({
      component: Component,
      name,
    }: {
      component: React.ComponentType<unknown>;
      name: string;
    }) => (name === "Launch" ? <Component /> : null),
  }),
}));

const originalConsoleError = console.error;

beforeEach(() => {
  void AsyncStorage.clear();
  jest.useFakeTimers({ now: new Date(2026, 2, 2) });
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("not wrapped in act")) {
      return;
    }
    originalConsoleError(...args);
  };
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
  console.error = originalConsoleError;
});

describe("App", () => {
  it("renders the launch screen with app title", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("In Due Time")).toBeTruthy();
    });
  });

  it("shows HIPAA disclaimer on first launch", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Important Notice")).toBeTruthy();
      expect(screen.getByText("I Agree")).toBeTruthy();
    });
  });
});
