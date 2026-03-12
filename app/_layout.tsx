import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Image, ImageBackground, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Updates from "expo-updates";

import { HipaaAgreementModal, OnboardingOverlay } from "@/components";
import { useThemePreference } from "@/hooks";
import {
  acceptAgreement,
  checkAgreement,
  checkOnboardingComplete,
  getOrCreateDeviceId,
} from "@/storage";
import { ThemeProvider, useTheme } from "@/theme";

import splashBgDark from "../assets/splash-bg-dark.png";
import splashBgLight from "../assets/splash-bg-light.png";
import splashLogoLight from "../assets/splash-icon.png";
import splashLogoDark from "../assets/splash-icon-dark.png";

const SPLASH_DURATION_MS = 2000;

if (!__DEV__) {
  void import("vexo-analytics")
    .then(({ vexo }) => vexo("0c9372e4-1c7e-4051-a9aa-48801f7cef4b"))
    .catch((e) => Alert.alert("Vexo Init Failed", String(e?.message ?? e)));
}

/** Root layout that wraps all routes with providers. */
export default function RootLayout() {
  const {
    personality,
    brightness,
    setPersonality,
    setBrightness,
    loadThemePreference,
  } = useThemePreference();

  return (
    <SafeAreaProvider>
      <ThemeProvider
        personality={personality}
        brightness={brightness}
        setPersonality={setPersonality}
        setBrightness={setBrightness}
      >
        <RootGate loadThemePreference={loadThemePreference} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

interface RootGateProps {
  loadThemePreference: () => Promise<void>;
}

type GatePhase = "init" | "welcome" | "splash" | "ready";

/**
 * Handles the full init sequence: check agreement/onboarding → welcome
 * (if needed) → splash → home. No route navigation during init to avoid
 * visual hiccups.
 */
function RootGate({ loadThemePreference }: RootGateProps) {
  const { resolvedTheme } = useTheme();
  const [phase, setPhase] = useState<GatePhase>("init");
  const [showAgreement, setShowAgreement] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const onboardingDoneRef = useRef(false);
  const isLoadingRef = useRef(true);

  const isDark = resolvedTheme === "dark";
  const splashLogo = isDark ? splashLogoDark : splashLogoLight;
  const splashBg = isDark ? splashBgDark : splashBgLight;

  useEffect(() => {
    let mounted = true;

    async function init() {
      const [accepted, , , deviceId, onboardingDone] = await Promise.all([
        checkAgreement().catch((e) => {
          console.error("Failed to check agreement", e);
          return false;
        }),
        loadThemePreference().catch((e) =>
          console.error("Failed to load theme preference", e),
        ),
        // Placeholder for entry loading — done in home screen
        Promise.resolve(),
        getOrCreateDeviceId().catch((e) => {
          console.error("Failed to get device ID", e);
          return undefined;
        }),
        checkOnboardingComplete().catch((e) => {
          console.error("Failed to check onboarding", e);
          return false;
        }),
      ]);

      if (!mounted) {
        return;
      }

      onboardingDoneRef.current = !!onboardingDone;

      if (!accepted) {
        setShowAgreement(true);
        setPhase("welcome");
      } else if (!onboardingDone) {
        setShowOnboarding(true);
        setPhase("welcome");
      } else {
        // Returning user — go straight to splash
        setPhase("splash");
      }

      if (!__DEV__) {
        if (deviceId) {
          void import("vexo-analytics").then(({ identifyDevice }) =>
            identifyDevice(deviceId),
          );
        }
        Updates.checkForUpdateAsync()
          .then(async (update) => {
            if (update.isAvailable) {
              await Updates.fetchUpdateAsync();
              if (isLoadingRef.current) {
                await Updates.reloadAsync();
              }
            }
          })
          .catch((e) => console.error("Failed to check for updates", e));
      }
    }

    void init();

    return () => {
      mounted = false;
    };
  }, [loadThemePreference]);

  // Start splash timer when entering splash phase
  useEffect(() => {
    if (phase !== "splash") {
      return;
    }
    const timer = setTimeout(() => {
      isLoadingRef.current = false;
      setPhase("ready");
    }, SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  const handleAcceptAgreement = useCallback(() => {
    acceptAgreement()
      .then(() => {
        setShowAgreement(false);
        if (onboardingDoneRef.current) {
          setPhase("splash");
        } else {
          setShowOnboarding(true);
        }
      })
      .catch((e) => console.error("Failed to save agreement", e));
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false);
    setPhase("splash");
  }, []);

  // Init + welcome: show background with optional modals
  if (phase === "init" || phase === "welcome") {
    return (
      <ImageBackground
        source={splashBg}
        resizeMode="cover"
        style={styles.splashContainer}
        testID="splash-bg"
      >
        <HipaaAgreementModal
          visible={showAgreement}
          onAccept={handleAcceptAgreement}
        />
        <OnboardingOverlay
          visible={showOnboarding && !showAgreement}
          onComplete={handleOnboardingComplete}
        />
        <StatusBar style="auto" />
      </ImageBackground>
    );
  }

  // Splash: show logo with timed transition to ready
  if (phase === "splash") {
    return (
      <ImageBackground
        source={splashBg}
        resizeMode="cover"
        style={styles.splashContainer}
        testID="splash-bg"
      >
        <Image
          source={splashLogo}
          style={styles.splashLogo}
          resizeMode="contain"
          testID="splash-logo"
        />
        <StatusBar style="auto" />
      </ImageBackground>
    );
  }

  // Ready: render the matched route (home screen)
  return <Slot />;
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  splashLogo: {
    width: "70%",
    maxWidth: 320,
    aspectRatio: 280 / 160,
  },
});
