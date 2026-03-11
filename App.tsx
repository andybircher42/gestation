import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DevSettings,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { StatusBar } from "expo-status-bar";
import * as Updates from "expo-updates";

import {
  AppInfoModal,
  DevToolbar,
  EntryFormModal,
  EntryList,
  HipaaAgreementModal,
  InfoToast,
  ThemePickerModal,
  UndoToast,
} from "@/components";
import { type EntryFormModalHandle } from "@/components/EntryFormModal";
import { useEntries, useThemePreference } from "@/hooks";
import {
  acceptAgreement,
  checkAgreement,
  getOrCreateDeviceId,
  resetAgreement,
} from "@/storage";
import { ColorTokens, ThemeProvider, useTheme } from "@/theme";

import headerLogoLight from "./assets/icon.png";
import headerLogoDark from "./assets/icon-dark.png";
import splashBgDark from "./assets/splash-bg-dark.png";
import splashBgLight from "./assets/splash-bg-light.png";
import splashLogoLight from "./assets/splash-icon.png";
import splashLogoDark from "./assets/splash-icon-dark.png";

const SPLASH_DURATION_MS = 2000;
const APP_LABEL = (Constants.expoConfig?.extra?.appLabel as string) ?? "";

if (!__DEV__) {
  void import("vexo-analytics").then(({ vexo }) =>
    vexo("5febe5d7-f01f-4716-ba33-d3c0b33794c8"),
  );
}

/** Root component that wraps AppContent with ThemeProvider. */
export default function App() {
  const { themeMode, setThemeMode, loadThemePreference } = useThemePreference();

  return (
    <ThemeProvider themeMode={themeMode} setThemeMode={setThemeMode}>
      <AppContent loadThemePreference={loadThemePreference} />
    </ThemeProvider>
  );
}

interface AppContentProps {
  loadThemePreference: () => Promise<void>;
}

/** Main app content that consumes theme context. */
function AppContent({ loadThemePreference }: AppContentProps) {
  const { colors, resolvedTheme, themeMode, setThemeMode } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [showAgreement, setShowAgreement] = useState(false);
  const [agreementLoaded, setAgreementLoaded] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showAppInfo, setShowAppInfo] = useState(false);
  const [pickerAnchor, setPickerAnchor] = useState({ top: 0, right: 0 });
  const settingsRef = useRef<View>(null);
  const formModalRef = useRef<EntryFormModalHandle>(null);
  const isLoadingRef = useRef(true);
  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  const isDark = resolvedTheme === "dark";
  const splashLogo = isDark ? splashLogoDark : splashLogoLight;
  const splashBg = isDark ? splashBgDark : splashBgLight;
  const headerLogo = isDark ? headerLogoDark : headerLogoLight;

  const openThemePicker = useCallback(() => {
    settingsRef.current?.measureInWindow((_x, y, _width, height) => {
      setPickerAnchor({ top: y + height + 4, right: 12 });
      setShowThemePicker(true);
    });
  }, []);

  const {
    entries,
    deletedEntry,
    discardedCount,
    saveError,
    load,
    add,
    remove,
    removeAll,
    seed,
    undo,
    dismissUndo,
    dismissDiscarded,
    dismissSaveError,
  } = useEntries();

  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const [accepted, , , deviceId] = await Promise.all([
        checkAgreement().catch((e) => {
          console.error("Failed to check agreement", e);
          return false;
        }),
        load().catch((e) => console.error("Failed to load entries", e)),
        loadThemePreference().catch((e) =>
          console.error("Failed to load theme preference", e),
        ),
        getOrCreateDeviceId().catch((e) => {
          console.error("Failed to get device ID", e);
          return undefined;
        }),
      ]);
      if (!mounted) {
        return;
      }
      if (!accepted) {
        setShowAgreement(true);
      }
      setAgreementLoaded(true);

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
  }, [load, loadThemePreference]);

  const handleAcceptAgreement = () => {
    acceptAgreement()
      .then(() => setShowAgreement(false))
      .catch((e) => console.error("Failed to save agreement", e));
  };

  const handleResetAgreement = () => {
    resetAgreement()
      .then(() => {
        setShowAgreement(true);
        if (__DEV__) {
          DevSettings.reload();
        }
      })
      .catch((e) => console.error("Failed to reset agreement", e));
  };

  if (isLoading) {
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

  return (
    <ImageBackground
      source={splashBg}
      resizeMode="cover"
      style={styles.container}
      testID="app-bg"
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Image
            source={headerLogo}
            style={styles.headerLogo}
            resizeMode="contain"
            accessible={false}
            testID="header-logo"
          />
          <Text style={styles.title} accessibilityRole="header">
            in due time
          </Text>
          {APP_LABEL !== "" && <Text style={styles.appLabel}>{APP_LABEL}</Text>}
          <Pressable
            ref={settingsRef}
            onPress={openThemePicker}
            accessibilityLabel="Theme settings"
            accessibilityRole="button"
            hitSlop={10}
          >
            <Ionicons
              name="settings-outline"
              size={24}
              color={colors.textPrimary}
            />
          </Pressable>
          {__DEV__ && (
            <DevToolbar
              onSeedData={seed}
              onResetAgreement={handleResetAgreement}
            />
          )}
        </View>

        <EntryList
          entries={entries}
          onDelete={remove}
          onDeleteAll={removeAll}
          onAddPress={() => formModalRef.current?.open()}
        />
        <EntryFormModal ref={formModalRef} onAdd={add} />
        <HipaaAgreementModal
          visible={showAgreement && agreementLoaded}
          onAccept={handleAcceptAgreement}
        />
        <ThemePickerModal
          visible={showThemePicker}
          currentMode={themeMode}
          onSelect={setThemeMode}
          onClose={() => setShowThemePicker(false)}
          onAppInfo={() => setShowAppInfo(true)}
          anchor={pickerAnchor}
        />
        <AppInfoModal
          visible={showAppInfo}
          onClose={() => setShowAppInfo(false)}
        />

        {deletedEntry && (
          <UndoToast
            entry={deletedEntry.entry}
            onUndo={undo}
            onDismiss={dismissUndo}
          />
        )}

        {discardedCount > 0 && !deletedEntry && (
          <InfoToast
            message={
              discardedCount === 1
                ? "We removed someone whose data was unreadable"
                : `We removed ${discardedCount} people whose data was unreadable`
            }
            onDismiss={dismissDiscarded}
          />
        )}

        {saveError && !deletedEntry && discardedCount === 0 && (
          <InfoToast
            message="Your changes might not be saved. Try again or restart the app."
            onDismiss={dismissSaveError}
          />
        )}

        <StatusBar style={resolvedTheme === "dark" ? "light" : "dark"} />
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

/** Creates styles based on the active color palette. */
function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
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
    container: {
      flex: 1,
    },
    keyboardView: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: (Constants.statusBarHeight ?? 0) + 16,
      paddingBottom: 16,
      paddingHorizontal: 20,
      backgroundColor: colors.contentBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 10,
      zIndex: 10,
      overflow: "visible",
    },
    headerLogo: {
      width: 36,
      height: 36,
    },
    title: {
      flex: 1,
      fontSize: 24,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    appLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
      backgroundColor: colors.primaryLightBg,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      overflow: "hidden",
    },
  });
}
