import { useCallback, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Brightness, Personality } from "@/theme";

const PERSONALITY_KEY = "@theme_personality";
const BRIGHTNESS_KEY = "@theme_brightness";
/** Legacy key from the single-axis theme system. */
const LEGACY_MODE_KEY = "@theme_mode";

const VALID_PERSONALITIES: Personality[] = [
  "classic",
  "warm",
  "elegant",
  "playful",
  "modern",
  "mono",
];
const VALID_BRIGHTNESSES: Brightness[] = ["system", "light", "dark"];

/**
 * Manages theme preference persistence via AsyncStorage.
 * Call `loadThemePreference()` during app init to hydrate from storage.
 *
 * Migrates from the legacy single `@theme_mode` key to the two-axis
 * `@theme_personality` + `@theme_brightness` system on first load.
 */
export default function useThemePreference() {
  const [personality, setPersonalityState] = useState<Personality>("classic");
  const [brightness, setBrightnessState] = useState<Brightness>("system");

  /** Hydrates theme preferences from AsyncStorage. Call once during app initialization. */
  const loadThemePreference = useCallback(async () => {
    const [storedPersonality, storedBrightness, legacyMode] = await Promise.all(
      [
        AsyncStorage.getItem(PERSONALITY_KEY),
        AsyncStorage.getItem(BRIGHTNESS_KEY),
        AsyncStorage.getItem(LEGACY_MODE_KEY),
      ],
    );

    // Already migrated — use new keys
    if (storedPersonality || storedBrightness) {
      if (
        storedPersonality &&
        VALID_PERSONALITIES.includes(storedPersonality as Personality)
      ) {
        setPersonalityState(storedPersonality as Personality);
      }
      if (
        storedBrightness &&
        VALID_BRIGHTNESSES.includes(storedBrightness as Brightness)
      ) {
        setBrightnessState(storedBrightness as Brightness);
      }
      return;
    }

    // Migrate from legacy single-key system
    if (legacyMode) {
      let migratedPersonality: Personality = "classic";
      let migratedBrightness: Brightness = "system";

      if (legacyMode === "mono") {
        migratedPersonality = "mono";
        migratedBrightness = "system";
      } else if (legacyMode === "light") {
        migratedBrightness = "light";
      } else if (legacyMode === "dark") {
        migratedBrightness = "dark";
      }
      // "system" maps to classic+system (defaults)

      setPersonalityState(migratedPersonality);
      setBrightnessState(migratedBrightness);

      // Persist migration and clean up legacy key
      await Promise.all([
        AsyncStorage.setItem(PERSONALITY_KEY, migratedPersonality),
        AsyncStorage.setItem(BRIGHTNESS_KEY, migratedBrightness),
        AsyncStorage.removeItem(LEGACY_MODE_KEY),
      ]);
    }
  }, []);

  /** Updates personality in state and persists to AsyncStorage. */
  const setPersonality = useCallback((p: Personality) => {
    setPersonalityState(p);
    AsyncStorage.setItem(PERSONALITY_KEY, p).catch((e) =>
      console.error("Failed to save theme personality", e),
    );
  }, []);

  /** Updates brightness in state and persists to AsyncStorage. */
  const setBrightness = useCallback((b: Brightness) => {
    setBrightnessState(b);
    AsyncStorage.setItem(BRIGHTNESS_KEY, b).catch((e) =>
      console.error("Failed to save theme brightness", e),
    );
  }, []);

  return {
    personality,
    brightness,
    setPersonality,
    setBrightness,
    loadThemePreference,
  };
}
