import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

jest.mock("expo-router", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Text, View } = require("react-native");
  const Screen = () => null;
  const StackComponent = ({ children }: { children: React.ReactNode }) => (
    <View>
      <Text testID="slot-content">Slot</Text>
      {children}
    </View>
  );
  StackComponent.Screen = Screen;
  return {
    Slot: () => <Text testID="slot-content">Slot</Text>,
    Stack: StackComponent,
  };
});

import * as storage from "@/storage";

import splashBgDark from "../../assets/splash-bg-dark.png";
import splashBgLight from "../../assets/splash-bg-light.png";
import splashLogoLight from "../../assets/splash-icon.png";
import splashLogoDark from "../../assets/splash-icon-dark.png";
import RootLayout from "../_layout";

const Updates = jest.requireMock<{
  checkForUpdateAsync: jest.Mock;
  fetchUpdateAsync: jest.Mock;
  reloadAsync: jest.Mock;
}>("expo-updates");

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

/** Pre-accept HIPAA + onboarding so the app goes straight to splash. */
async function skipToMainUI() {
  await AsyncStorage.setItem("@hipaa_agreement_accepted", "true");
  await AsyncStorage.setItem("@onboarding_complete", "true");
}

async function acceptHipaa() {
  await waitFor(() => {
    expect(screen.getByText("Got it")).toBeTruthy();
  });
  fireEvent.press(screen.getByText("Got it"));
  await act(async () => {});
}

async function completeOnboarding() {
  await waitFor(() => {
    expect(
      screen.getByText("You'll support dozens of families this year."),
    ).toBeTruthy();
  });
  // Advance past all line animations + button reveal
  act(() => {
    jest.advanceTimersByTime(7000);
  });
  await waitFor(() => {
    expect(screen.getByText("Get Started")).toBeTruthy();
  });
  fireEvent.press(screen.getByText("Get Started"));
  await act(async () => {});
}

describe("RootLayout", () => {
  // First render pays module-compilation cost; needs extended timeout.
  it("shows splash then renders slot for returning users", async () => {
    await skipToMainUI();
    render(<RootLayout />);

    // Flush init
    await act(async () => {});

    // Should be on splash (logo visible)
    expect(screen.getByTestId("splash-logo")).toBeTruthy();
    expect(screen.queryByTestId("slot-content")).toBeNull();

    // Advance past splash timer
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(screen.getByTestId("slot-content")).toBeTruthy();
    });
  }, 20_000);

  it("shows HIPAA agreement on first launch", async () => {
    render(<RootLayout />);
    await act(async () => {});

    await waitFor(() => {
      expect(screen.getByText("A quick note about privacy")).toBeTruthy();
    });

    // Should not show splash logo during welcome phase
    expect(screen.queryByTestId("splash-logo")).toBeNull();
  });

  it("shows onboarding after HIPAA acceptance", async () => {
    render(<RootLayout />);
    await act(async () => {});

    await acceptHipaa();

    await waitFor(() => {
      expect(
        screen.getByText("You'll support dozens of families this year."),
      ).toBeTruthy();
    });
  });

  it("shows splash after completing HIPAA and onboarding", async () => {
    render(<RootLayout />);
    await act(async () => {});

    await acceptHipaa();
    await completeOnboarding();

    // Should now be on splash
    await waitFor(() => {
      expect(screen.getByTestId("splash-logo")).toBeTruthy();
    });

    // Advance past splash timer
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(screen.getByTestId("slot-content")).toBeTruthy();
    });
  });

  it("skips to onboarding when agreement already accepted", async () => {
    await AsyncStorage.setItem("@hipaa_agreement_accepted", "true");
    render(<RootLayout />);
    await act(async () => {});

    await waitFor(() => {
      expect(
        screen.getByText("You'll support dozens of families this year."),
      ).toBeTruthy();
    });

    // HIPAA modal should not be visible
    expect(screen.queryByText("I Agree")).toBeNull();
  });

  it("skips onboarding when already completed after HIPAA", async () => {
    await AsyncStorage.setItem("@onboarding_complete", "true");
    render(<RootLayout />);
    await act(async () => {});

    // Accept HIPAA
    await acceptHipaa();

    // Should go straight to splash (skip onboarding)
    await waitFor(() => {
      expect(screen.getByTestId("splash-logo")).toBeTruthy();
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

    const { unmount } = render(<RootLayout />);
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    unmount();

    await act(async () => {
      resolveAgreement!(false);
    });

    const stateUpdateErrors = errorSpy.mock.calls.filter(
      (args) => typeof args[0] === "string" && args[0].includes("unmounted"),
    );
    expect(stateUpdateErrors).toHaveLength(0);
  });

  it("uses dark splash logo in dark mode", async () => {
    await skipToMainUI();
    await AsyncStorage.setItem("@theme_brightness", "dark");
    render(<RootLayout />);
    await act(async () => {});

    await waitFor(() => {
      expect(screen.getByTestId("splash-logo").props.source).toBe(
        splashLogoDark,
      );
    });
  });

  it("uses light splash logo in light mode", async () => {
    await skipToMainUI();
    await AsyncStorage.setItem("@theme_brightness", "light");
    render(<RootLayout />);
    await act(async () => {});

    await waitFor(() => {
      expect(screen.getByTestId("splash-logo").props.source).toBe(
        splashLogoLight,
      );
    });
  });

  it("uses dark splash background in dark mode", async () => {
    await skipToMainUI();
    await AsyncStorage.setItem("@theme_brightness", "dark");
    render(<RootLayout />);
    await act(async () => {});

    await waitFor(() => {
      expect(screen.getByTestId("splash-bg").props.source).toBe(splashBgDark);
    });
  });

  it("uses light splash background in light mode", async () => {
    await skipToMainUI();
    await AsyncStorage.setItem("@theme_brightness", "light");
    render(<RootLayout />);
    await act(async () => {});

    await waitFor(() => {
      expect(screen.getByTestId("splash-bg").props.source).toBe(splashBgLight);
    });
  });

  it("uses light splash background in mono mode", async () => {
    await skipToMainUI();
    await AsyncStorage.setItem("@theme_personality", "mono");
    await AsyncStorage.setItem("@theme_brightness", "light");
    render(<RootLayout />);
    await act(async () => {});

    await waitFor(() => {
      expect(screen.getByTestId("splash-bg").props.source).toBe(splashBgLight);
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

      render(<RootLayout />);

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

      render(<RootLayout />);

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

      render(<RootLayout />);

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
