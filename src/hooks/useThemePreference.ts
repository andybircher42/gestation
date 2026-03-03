import { useCallback, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemeMode } from "@/theme/ThemeContext";

const STORAGE_KEY = "@theme_mode";
const VALID_MODES: ThemeMode[] = ["system", "light", "dark"];

/**
 * Manages theme preference persistence via AsyncStorage.
 * Call `loadThemePreference()` during app init to hydrate from storage.
 */
export default function useThemePreference() {
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");

  /** Hydrates theme mode from AsyncStorage. Call once during app initialization. */
  const loadThemePreference = useCallback(async () => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored && VALID_MODES.includes(stored as ThemeMode)) {
      setThemeModeState(stored as ThemeMode);
    }
  }, []);

  /** Updates theme mode in state and persists to AsyncStorage. */
  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(STORAGE_KEY, mode).catch((e) =>
      console.error("Failed to save theme preference", e),
    );
  }, []);

  return { themeMode, setThemeMode, loadThemePreference };
}
