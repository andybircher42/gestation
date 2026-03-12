import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import * as storage from "@/storage";

import App from "./App";

const Updates = jest.requireMock<{
  checkForUpdateAsync: jest.Mock;
  fetchUpdateAsync: jest.Mock;
  reloadAsync: jest.Mock;
}>("expo-updates");
import headerLogoLight from "./assets/icon.png";
import headerLogoDark from "./assets/icon-dark.png";
import splashBgDark from "./assets/splash-bg-dark.png";
import splashBgLight from "./assets/splash-bg-light.png";
import splashLogoLight from "./assets/splash-icon.png";
import splashLogoDark from "./assets/splash-icon-dark.png";

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

async function renderApp() {
  render(<App />);
  // Flush async init so splash timer starts
  await act(async () => {});
  await act(async () => {
    jest.advanceTimersByTime(2000);
  });
}

async function renderAppWithTheme(mode: string) {
  await AsyncStorage.setItem("@theme_mode", mode);
  render(<App />);
  await act(async () => {});
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

async function completeOnboarding() {
  // Flush acceptAgreement promise, then advance past the splash pause
  await act(async () => {});
  await act(async () => {
    jest.advanceTimersByTime(2000);
  });
  await waitFor(() => {
    expect(
      screen.getByText("You'll support dozens of families this year."),
    ).toBeTruthy();
  });
  act(() => {
    jest.advanceTimersByTime(7000);
  });
  await waitFor(() => {
    expect(screen.getByText("Get Started")).toBeTruthy();
  });
  fireEvent.press(screen.getByText("Get Started"));
}

/** Pre-accept HIPAA + onboarding so the app goes straight to main UI. */
async function skipToMainUI() {
  await AsyncStorage.setItem("@hipaa_agreement_accepted", "true");
  await AsyncStorage.setItem("@onboarding_complete", "true");
}

async function addEntry(name: string, weeks: string, days: string) {
  fireEvent.press(screen.getByLabelText("Add someone new"));
  fireEvent.press(screen.getByText("Gestational Age"));
  fireEvent.changeText(screen.getByLabelText("Name"), name);
  fireEvent.changeText(screen.getByLabelText("Weeks"), weeks);
  fireEvent.changeText(screen.getByLabelText("Days"), days);
  fireEvent.press(screen.getByLabelText("Add this person"));
  await waitFor(() => {
    expect(screen.getByText(name)).toBeTruthy();
  });
}

describe("App", () => {
  // First render pays module-compilation cost; needs extended timeout.
  it("shows splash then renders title after loading", async () => {
    await skipToMainUI();
    render(<App />);
    expect(screen.getByTestId("splash-logo")).toBeTruthy();
    expect(screen.queryByText("in due time")).toBeNull();

    // Flush init so splash timer starts, then advance past it
    await act(async () => {});
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(screen.getByText("in due time")).toBeTruthy();
    });
  }, 20_000);

  it("shows HIPAA agreement over splash on first launch", async () => {
    await renderApp();

    // Should still be on splash (splash-bg visible)
    expect(screen.getByTestId("splash-bg")).toBeTruthy();
    await waitFor(() => {
      expect(screen.getAllByText(/HIPAA/).length).toBeGreaterThan(0);
    });
  });

  it("shows onboarding over splash after HIPAA acceptance", async () => {
    await renderApp();
    await acceptHipaa();

    // Flush acceptAgreement promise chain
    await act(async () => {});

    // Should still be on splash during the pause
    expect(screen.getByTestId("splash-bg")).toBeTruthy();

    // Advance past the splash pause
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    await waitFor(() => {
      expect(
        screen.getByText("You'll support dozens of families this year."),
      ).toBeTruthy();
    });
  });

  it("skips onboarding when already completed", async () => {
    await AsyncStorage.setItem("@onboarding_complete", "true");
    await renderApp();
    await acceptHipaa();

    // Flush acceptAgreement promise, then advance past post-HIPAA splash timer
    await act(async () => {});
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(screen.getByLabelText("Add someone new")).toBeTruthy();
    });
    expect(
      screen.queryByText("You'll support dozens of families this year."),
    ).toBeNull();
  });

  it("adds an entry via the form in weeks/days mode", async () => {
    await renderApp();
    await acceptHipaa();
    await completeOnboarding();
    await addEntry("TestBaby", "20", "3");

    expect(screen.getByText("20w 3d")).toBeTruthy();
  });

  it("deletes an entry and shows undo toast", async () => {
    await renderApp();
    await acceptHipaa();
    await completeOnboarding();
    await addEntry("Baby", "10", "0");

    fireEvent.press(screen.getByLabelText("Remove Baby"));

    await waitFor(() => {
      expect(screen.getByText(/Removed Baby/)).toBeTruthy();
      expect(screen.getByText("Undo")).toBeTruthy();
    });
  });

  it("restores entry when undo is pressed", async () => {
    await renderApp();
    await acceptHipaa();
    await completeOnboarding();
    await addEntry("Baby", "10", "0");

    fireEvent.press(screen.getByLabelText("Remove Baby"));

    await waitFor(() => {
      expect(screen.getByText("Undo")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Undo"));

    await waitFor(() => {
      expect(screen.getByText("Baby")).toBeTruthy();
      expect(screen.queryByTestId("undo-toast")).toBeNull();
    });
  });

  it("undo toast auto-dismisses after 5 seconds", async () => {
    await renderApp();
    await acceptHipaa();
    await completeOnboarding();
    await addEntry("Baby", "10", "0");

    fireEvent.press(screen.getByLabelText("Remove Baby"));

    await waitFor(() => {
      expect(screen.getByTestId("undo-toast")).toBeTruthy();
    });

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(screen.queryByTestId("undo-toast")).toBeNull();
    });
  });

  it("does not update state after unmount", async () => {
    let resolveAgreement: (v: boolean) => void;
    jest.spyOn(storage, "checkAgreement").mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveAgreement = resolve;
        }),
    );

    const errorSpy = jest.spyOn(console, "error");

    const { unmount } = render(<App />);
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    unmount();

    // Resolve after unmount — should not trigger state updates
    await act(async () => {
      resolveAgreement!(false);
    });

    const stateUpdateErrors = errorSpy.mock.calls.filter(
      (args) => typeof args[0] === "string" && args[0].includes("unmounted"),
    );
    expect(stateUpdateErrors).toHaveLength(0);
  });

  it("persists entries to AsyncStorage", async () => {
    await renderApp();
    await acceptHipaa();
    await completeOnboarding();
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
    await skipToMainUI();
    await renderAppWithTheme("dark");

    await waitFor(() => {
      expect(screen.getByText("in due time")).toBeTruthy();
    });

    const header = screen.getByTestId("header-logo");
    expect(header.props.source).toBe(headerLogoDark);
  });

  it("uses light logos in light mode", async () => {
    await skipToMainUI();
    await renderAppWithTheme("light");

    await waitFor(() => {
      expect(screen.getByText("in due time")).toBeTruthy();
    });

    const header = screen.getByTestId("header-logo");
    expect(header.props.source).toBe(headerLogoLight);
  });

  it("uses light logos in mono mode", async () => {
    await skipToMainUI();
    await renderAppWithTheme("mono");

    await waitFor(() => {
      expect(screen.getByText("in due time")).toBeTruthy();
    });

    const header = screen.getByTestId("header-logo");
    expect(header.props.source).toBe(headerLogoLight);
  });

  it("uses dark splash logo in dark mode", async () => {
    await AsyncStorage.setItem("@theme_mode", "dark");
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId("splash-logo").props.source).toBe(
        splashLogoDark,
      );
    });
  });

  it("uses light splash logo in light mode", async () => {
    await AsyncStorage.setItem("@theme_mode", "light");
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId("splash-logo").props.source).toBe(
        splashLogoLight,
      );
    });
  });

  it("uses dark splash background in dark mode", async () => {
    await AsyncStorage.setItem("@theme_mode", "dark");
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId("splash-bg").props.source).toBe(splashBgDark);
    });
  });

  it("uses light splash background in light mode", async () => {
    await AsyncStorage.setItem("@theme_mode", "light");
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId("splash-bg").props.source).toBe(splashBgLight);
    });
  });

  it("uses light splash background in mono mode", async () => {
    await AsyncStorage.setItem("@theme_mode", "mono");
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId("splash-bg").props.source).toBe(splashBgLight);
    });
  });

  it("uses dark app background in dark mode", async () => {
    await skipToMainUI();
    await renderAppWithTheme("dark");

    await waitFor(() => {
      expect(screen.getByTestId("app-bg").props.source).toBe(splashBgDark);
    });
  });

  it("uses light app background in light mode", async () => {
    await skipToMainUI();
    await renderAppWithTheme("light");

    await waitFor(() => {
      expect(screen.getByTestId("app-bg").props.source).toBe(splashBgLight);
    });
  });

  it("uses light app background in mono mode", async () => {
    await skipToMainUI();
    await renderAppWithTheme("mono");

    await waitFor(() => {
      expect(screen.getByTestId("app-bg").props.source).toBe(splashBgLight);
    });
  });

  describe("OTA update during splash", () => {
    beforeEach(() => {
      (globalThis as unknown as Record<string, boolean>).__DEV__ = false;
      Updates.checkForUpdateAsync.mockReset();
      Updates.fetchUpdateAsync.mockReset();
      Updates.reloadAsync.mockReset();
    });

    afterEach(() => {
      (globalThis as unknown as Record<string, boolean>).__DEV__ = true;
    });

    it("reloads if update is fetched while still on splash screen", async () => {
      await skipToMainUI();
      Updates.checkForUpdateAsync.mockResolvedValue({ isAvailable: true });
      Updates.fetchUpdateAsync.mockResolvedValue({});
      Updates.reloadAsync.mockResolvedValue(undefined);

      render(<App />);

      await waitFor(() => {
        expect(Updates.reloadAsync).toHaveBeenCalled();
      });
    });

    it("does not reload if update finishes after splash screen ends", async () => {
      await skipToMainUI();
      let resolveFetch!: () => void;
      Updates.checkForUpdateAsync.mockResolvedValue({ isAvailable: true });
      Updates.fetchUpdateAsync.mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveFetch = resolve;
          }),
      );

      render(<App />);

      await waitFor(() => {
        expect(Updates.fetchUpdateAsync).toHaveBeenCalled();
      });

      // Advance past splash screen before resolving the fetch
      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      await act(async () => {
        resolveFetch();
      });

      expect(Updates.reloadAsync).not.toHaveBeenCalled();
    });

    it("does not fetch or reload when no update is available", async () => {
      await skipToMainUI();
      Updates.checkForUpdateAsync.mockResolvedValue({ isAvailable: false });

      render(<App />);

      await waitFor(() => {
        expect(Updates.checkForUpdateAsync).toHaveBeenCalled();
      });

      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      expect(Updates.fetchUpdateAsync).not.toHaveBeenCalled();
      expect(Updates.reloadAsync).not.toHaveBeenCalled();
    });
  });
});
