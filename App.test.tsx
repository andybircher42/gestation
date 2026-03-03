import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import App from "./App";

jest.mock("expo-status-bar", () => ({
  StatusBar: () => null,
}));

jest.mock("expo-updates", () => ({
  checkForUpdateAsync: jest.fn().mockResolvedValue({ isAvailable: false }),
  fetchUpdateAsync: jest.fn(),
  reloadAsync: jest.fn(),
}));

beforeEach(() => {
  AsyncStorage.clear();
  jest.useFakeTimers({ now: new Date(2026, 2, 2) });
});

afterEach(() => {
  jest.useRealTimers();
});

async function renderApp() {
  render(<App />);
  await act(async () => {
    await Promise.resolve();
    jest.advanceTimersByTime(2000);
    await Promise.resolve();
  });
}

describe("App", () => {
  it("shows loading screen with logo on launch", () => {
    render(<App />);
    expect(screen.getByTestId("splash-logo")).toBeTruthy();
    expect(screen.queryByText("in due time")).toBeNull();
  });

  it("renders the title after loading", async () => {
    await renderApp();

    await waitFor(() => {
      expect(screen.getByText("in due time")).toBeTruthy();
    });
  });

  it("shows HIPAA agreement on first launch", async () => {
    await renderApp();

    await waitFor(() => {
      expect(screen.getAllByText(/HIPAA/).length).toBeGreaterThan(0);
    });
  });

  it("adds an entry via the form in weeks/days mode", async () => {
    await renderApp();

    // Accept HIPAA
    await waitFor(() => {
      expect(screen.getByText("I Agree")).toBeTruthy();
    });
    fireEvent.press(screen.getByText("I Agree"));

    // Switch to weeks/days mode
    fireEvent.press(screen.getByText("Gestational Age"));

    fireEvent.changeText(screen.getByLabelText("Name"), "TestBaby");
    fireEvent.changeText(screen.getByLabelText("Weeks"), "20");
    fireEvent.changeText(screen.getByLabelText("Days"), "3");
    fireEvent.press(screen.getByText("Add"));

    await waitFor(() => {
      expect(screen.getByText("TestBaby")).toBeTruthy();
      expect(screen.getByText("20w 3d")).toBeTruthy();
    });
  });

  it("deletes an entry and shows undo toast", async () => {
    await renderApp();

    await waitFor(() => {
      expect(screen.getByText("I Agree")).toBeTruthy();
    });
    fireEvent.press(screen.getByText("I Agree"));

    // Add an entry
    fireEvent.press(screen.getByText("Gestational Age"));
    fireEvent.changeText(screen.getByLabelText("Name"), "Baby");
    fireEvent.changeText(screen.getByLabelText("Weeks"), "10");
    fireEvent.changeText(screen.getByLabelText("Days"), "0");
    fireEvent.press(screen.getByText("Add"));

    await waitFor(() => {
      expect(screen.getByText("Baby")).toBeTruthy();
    });

    // Delete it
    fireEvent.press(screen.getByText("✕"));

    await waitFor(() => {
      expect(screen.getByText(/Deleted Baby/)).toBeTruthy();
      expect(screen.getByText("Undo")).toBeTruthy();
    });
  });

  it("restores entry when undo is pressed", async () => {
    await renderApp();

    await waitFor(() => {
      expect(screen.getByText("I Agree")).toBeTruthy();
    });
    fireEvent.press(screen.getByText("I Agree"));

    // Add an entry
    fireEvent.press(screen.getByText("Gestational Age"));
    fireEvent.changeText(screen.getByLabelText("Name"), "Baby");
    fireEvent.changeText(screen.getByLabelText("Weeks"), "10");
    fireEvent.changeText(screen.getByLabelText("Days"), "0");
    fireEvent.press(screen.getByText("Add"));

    await waitFor(() => {
      expect(screen.getByText("Baby")).toBeTruthy();
    });

    // Delete and undo
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

    await waitFor(() => {
      expect(screen.getByText("I Agree")).toBeTruthy();
    });
    fireEvent.press(screen.getByText("I Agree"));

    // Add and delete
    fireEvent.press(screen.getByText("Gestational Age"));
    fireEvent.changeText(screen.getByLabelText("Name"), "Baby");
    fireEvent.changeText(screen.getByLabelText("Weeks"), "10");
    fireEvent.changeText(screen.getByLabelText("Days"), "0");
    fireEvent.press(screen.getByText("Add"));

    await waitFor(() => {
      expect(screen.getByText("Baby")).toBeTruthy();
    });

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

    await waitFor(() => {
      expect(screen.getByText("I Agree")).toBeTruthy();
    });
    fireEvent.press(screen.getByText("I Agree"));

    fireEvent.press(screen.getByText("Gestational Age"));
    fireEvent.changeText(screen.getByLabelText("Name"), "Saved");
    fireEvent.changeText(screen.getByLabelText("Weeks"), "15");
    fireEvent.changeText(screen.getByLabelText("Days"), "2");
    fireEvent.press(screen.getByText("Add"));

    await waitFor(async () => {
      const stored = await AsyncStorage.getItem("@gestation_entries");
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].name).toBe("Saved");
    });
  });
});
