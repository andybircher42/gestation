import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, fireEvent, screen, waitFor } from "@testing-library/react-native";

import headerLogoLight from "../../assets/icon.png";
import headerLogoDark from "../../assets/icon-dark.png";
import splashBgDark from "../../assets/splash-bg-dark.png";
import splashBgLight from "../../assets/splash-bg-light.png";
import renderWithTheme from "../../src/test/renderWithTheme";
import HomeScreen from "../index";

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

async function renderHome() {
  renderWithTheme(<HomeScreen />);
  // Wait for async init (entry loading, etc.) to settle
  await waitFor(() => {
    expect(screen.getByText("in due time")).toBeTruthy();
  });
}

async function renderHomeWithTheme(
  brightness: "light" | "dark",
  personality:
    | "classic"
    | "warm"
    | "elegant"
    | "playful"
    | "modern"
    | "mono" = "classic",
) {
  renderWithTheme(<HomeScreen />, { brightness, personality });
  await act(async () => {});
}

async function addEntry(name: string, weeks: string, days: string) {
  fireEvent.press(screen.getByLabelText("Add someone new"));
  fireEvent.changeText(screen.getByLabelText("Name"), name);
  fireEvent.changeText(
    screen.getByLabelText("Due date or gestational age"),
    `${weeks}w${days}d`,
  );
  fireEvent.press(screen.getByLabelText("Add this person"));
  await waitFor(() => {
    expect(screen.getByText(name)).toBeTruthy();
  });
}

describe("HomeScreen", () => {
  it("renders the title", async () => {
    await renderHome();

    expect(screen.getByText("in due time")).toBeTruthy();
  });

  it("adds an entry via the form in weeks/days mode", async () => {
    await renderHome();
    await addEntry("Jordan", "20", "3");

    expect(screen.getByText("20w 3d")).toBeTruthy();
  });

  it("shows entry detail modal when entry is tapped", async () => {
    await renderHome();
    await addEntry("Baby", "10", "0");

    fireEvent.press(screen.getByLabelText("View details for Baby"));

    await waitFor(() => {
      expect(screen.getByText("Gestational age")).toBeTruthy();
      expect(screen.getByText("Due date")).toBeTruthy();
    });
  });

  it("persists entries to AsyncStorage", async () => {
    await renderHome();
    await addEntry("Saved", "15", "2");

    await waitFor(async () => {
      const stored = await AsyncStorage.getItem("@gestation_entries");
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].name).toBe("Saved");
    });
  });

  it("uses dark logos in dark mode", async () => {
    await renderHomeWithTheme("dark");

    const header = screen.getByTestId("header-logo");
    expect(header.props.source).toBe(headerLogoDark);
  });

  it("uses light logos in light mode", async () => {
    await renderHomeWithTheme("light");

    const header = screen.getByTestId("header-logo");
    expect(header.props.source).toBe(headerLogoLight);
  });

  it("uses light logos in mono mode", async () => {
    await renderHomeWithTheme("light", "mono");

    const header = screen.getByTestId("header-logo");
    expect(header.props.source).toBe(headerLogoLight);
  });

  it("uses dark app background in dark mode", async () => {
    await renderHomeWithTheme("dark");

    expect(screen.getByTestId("app-bg").props.source).toBe(splashBgDark);
  });

  it("uses light app background in light mode", async () => {
    await renderHomeWithTheme("light");

    expect(screen.getByTestId("app-bg").props.source).toBe(splashBgLight);
  });

  it("uses light app background in mono mode", async () => {
    await renderHomeWithTheme("light", "mono");

    expect(screen.getByTestId("app-bg").props.source).toBe(splashBgLight);
  });
});
