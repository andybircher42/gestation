import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import App from "./App";

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
  console.error = originalConsoleError;
});

async function renderApp() {
  render(<App />);
  await act(async () => {
    jest.advanceTimersByTime(2000);
  });
}

async function acceptHipaa() {
  await waitFor(() => {
    expect(screen.getByText("I Agree")).toBeTruthy();
  });
  fireEvent.press(screen.getByText("I Agree"));
}

async function addEntry(name: string, weeks: string, days: string) {
  fireEvent.press(screen.getByText("Gestational Age"));
  fireEvent.changeText(screen.getByLabelText("Name"), name);
  fireEvent.changeText(screen.getByLabelText("Weeks"), weeks);
  fireEvent.changeText(screen.getByLabelText("Days"), days);
  fireEvent.press(screen.getByText("Add"));
  await waitFor(() => {
    expect(screen.getByText(name)).toBeTruthy();
  });
}

describe("App", () => {
  // First render pays module-compilation cost; needs extended timeout.
  it("shows splash then renders title after loading", async () => {
    render(<App />);
    expect(screen.getByTestId("splash-logo")).toBeTruthy();
    expect(screen.queryByText("in due time")).toBeNull();

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(screen.getByText("in due time")).toBeTruthy();
    });
  }, 20_000);

  it("shows HIPAA agreement on first launch", async () => {
    await renderApp();

    await waitFor(() => {
      expect(screen.getAllByText(/HIPAA/).length).toBeGreaterThan(0);
    });
  });

  it("adds an entry via the form in weeks/days mode", async () => {
    await renderApp();
    await acceptHipaa();
    await addEntry("TestBaby", "20", "3");

    expect(screen.getByText("20w 3d")).toBeTruthy();
  });

  it("deletes an entry and shows undo toast", async () => {
    await renderApp();
    await acceptHipaa();
    await addEntry("Baby", "10", "0");

    fireEvent.press(screen.getByText("✕"));

    await waitFor(() => {
      expect(screen.getByText(/Deleted Baby/)).toBeTruthy();
      expect(screen.getByText("Undo")).toBeTruthy();
    });
  });

  it("restores entry when undo is pressed", async () => {
    await renderApp();
    await acceptHipaa();
    await addEntry("Baby", "10", "0");

    fireEvent.press(screen.getByText("✕"));

    await waitFor(() => {
      expect(screen.getByText("Undo")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Undo"));

    await waitFor(() => {
      expect(screen.getByText("Baby")).toBeTruthy();
      expect(screen.queryByLabelText("Undo toast")).toBeNull();
    });
  });

  it("undo toast auto-dismisses after 5 seconds", async () => {
    await renderApp();
    await acceptHipaa();
    await addEntry("Baby", "10", "0");

    fireEvent.press(screen.getByText("✕"));

    await waitFor(() => {
      expect(screen.getByLabelText("Undo toast")).toBeTruthy();
    });

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(screen.queryByLabelText("Undo toast")).toBeNull();
    });
  });

  it("persists entries to AsyncStorage", async () => {
    await renderApp();
    await acceptHipaa();
    await addEntry("Saved", "15", "2");

    await waitFor(async () => {
      const stored = await AsyncStorage.getItem("@gestation_entries");
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].name).toBe("Saved");
    });
  });
});
