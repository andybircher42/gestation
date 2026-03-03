import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook } from "@testing-library/react-native";

import useThemePreference from "./useThemePreference";

beforeEach(() => {
  AsyncStorage.clear();
});

describe("useThemePreference", () => {
  it("defaults to system mode", () => {
    const { result } = renderHook(() => useThemePreference());
    expect(result.current.themeMode).toBe("system");
  });

  it("hydrates stored theme mode", async () => {
    await AsyncStorage.setItem("@theme_mode", "dark");

    const { result } = renderHook(() => useThemePreference());

    await act(async () => {
      await result.current.loadThemePreference();
    });

    expect(result.current.themeMode).toBe("dark");
  });

  it("persists theme mode when set", async () => {
    const { result } = renderHook(() => useThemePreference());

    act(() => {
      result.current.setThemeMode("light");
    });

    expect(result.current.themeMode).toBe("light");

    const stored = await AsyncStorage.getItem("@theme_mode");
    expect(stored).toBe("light");
  });

  it("falls back to system on invalid stored value", async () => {
    await AsyncStorage.setItem("@theme_mode", "invalid");

    const { result } = renderHook(() => useThemePreference());

    await act(async () => {
      await result.current.loadThemePreference();
    });

    expect(result.current.themeMode).toBe("system");
  });
});
