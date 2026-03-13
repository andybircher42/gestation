import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook } from "@testing-library/react-native";

import useThemePreference from "./useThemePreference";

beforeEach(() => {
  void AsyncStorage.clear();
});

describe("useThemePreference", () => {
  it("defaults to classic personality, system brightness, and compact layout", () => {
    const { result } = renderHook(() => useThemePreference());
    expect(result.current.personality).toBe("classic");
    expect(result.current.brightness).toBe("system");
    expect(result.current.layout).toBe("compact");
  });

  it("hydrates stored personality and brightness", async () => {
    await AsyncStorage.setItem("@theme_personality", "warm");
    await AsyncStorage.setItem("@theme_brightness", "dark");
    const { result } = renderHook(() => useThemePreference());
    await act(async () => {
      await result.current.loadThemePreference();
    });
    expect(result.current.personality).toBe("warm");
    expect(result.current.brightness).toBe("dark");
  });

  it("hydrates mono personality", async () => {
    await AsyncStorage.setItem("@theme_personality", "mono");
    await AsyncStorage.setItem("@theme_brightness", "light");
    const { result } = renderHook(() => useThemePreference());
    await act(async () => {
      await result.current.loadThemePreference();
    });
    expect(result.current.personality).toBe("mono");
    expect(result.current.brightness).toBe("light");
  });

  it("persists personality when set", async () => {
    const { result } = renderHook(() => useThemePreference());

    act(() => {
      result.current.setPersonality("warm");
    });

    expect(result.current.personality).toBe("warm");
    const stored = await AsyncStorage.getItem("@theme_personality");
    expect(stored).toBe("warm");
  });

  it("persists brightness when set", async () => {
    const { result } = renderHook(() => useThemePreference());

    act(() => {
      result.current.setBrightness("dark");
    });

    expect(result.current.brightness).toBe("dark");
    const stored = await AsyncStorage.getItem("@theme_brightness");
    expect(stored).toBe("dark");
  });

  it("hydrates stored layout", async () => {
    await AsyncStorage.setItem("@theme_layout", "cozy");
    const { result } = renderHook(() => useThemePreference());
    await act(async () => {
      await result.current.loadThemePreference();
    });
    expect(result.current.layout).toBe("cozy");
  });

  it("persists layout when set", async () => {
    const { result } = renderHook(() => useThemePreference());

    act(() => {
      result.current.setLayout("cozy");
    });

    expect(result.current.layout).toBe("cozy");
    const stored = await AsyncStorage.getItem("@theme_layout");
    expect(stored).toBe("cozy");
  });

  it("falls back to defaults on invalid stored values", async () => {
    await AsyncStorage.setItem("@theme_personality", "invalid");
    await AsyncStorage.setItem("@theme_brightness", "invalid");
    const { result } = renderHook(() => useThemePreference());
    await act(async () => {
      await result.current.loadThemePreference();
    });
    expect(result.current.personality).toBe("classic");
    expect(result.current.brightness).toBe("system");
  });

  describe("legacy migration", () => {
    it("migrates legacy 'mono' to mono+system", async () => {
      await AsyncStorage.setItem("@theme_mode", "mono");
      const { result } = renderHook(() => useThemePreference());
      await act(async () => {
        await result.current.loadThemePreference();
      });
      expect(result.current.personality).toBe("mono");
      expect(result.current.brightness).toBe("system");

      // Verify migration persisted new keys
      expect(await AsyncStorage.getItem("@theme_personality")).toBe("mono");
      expect(await AsyncStorage.getItem("@theme_brightness")).toBe("system");
      // Verify legacy key removed
      expect(await AsyncStorage.getItem("@theme_mode")).toBeNull();
    });

    it("migrates legacy 'dark' to classic+dark", async () => {
      await AsyncStorage.setItem("@theme_mode", "dark");
      const { result } = renderHook(() => useThemePreference());
      await act(async () => {
        await result.current.loadThemePreference();
      });
      expect(result.current.personality).toBe("classic");
      expect(result.current.brightness).toBe("dark");
    });

    it("migrates legacy 'light' to classic+light", async () => {
      await AsyncStorage.setItem("@theme_mode", "light");
      const { result } = renderHook(() => useThemePreference());
      await act(async () => {
        await result.current.loadThemePreference();
      });
      expect(result.current.personality).toBe("classic");
      expect(result.current.brightness).toBe("light");
    });

    it("migrates legacy 'system' to classic+system", async () => {
      await AsyncStorage.setItem("@theme_mode", "system");
      const { result } = renderHook(() => useThemePreference());
      await act(async () => {
        await result.current.loadThemePreference();
      });
      expect(result.current.personality).toBe("classic");
      expect(result.current.brightness).toBe("system");
    });

    it("does not migrate if new keys already exist", async () => {
      await AsyncStorage.setItem("@theme_mode", "dark");
      await AsyncStorage.setItem("@theme_personality", "warm");
      await AsyncStorage.setItem("@theme_brightness", "light");
      const { result } = renderHook(() => useThemePreference());
      await act(async () => {
        await result.current.loadThemePreference();
      });
      // Should use new keys, not legacy
      expect(result.current.personality).toBe("warm");
      expect(result.current.brightness).toBe("light");
    });
  });
});
