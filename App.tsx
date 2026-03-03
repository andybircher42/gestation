import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
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
  DevToolbar,
  EntryForm,
  EntryList,
  HipaaAgreementModal,
  InfoToast,
  ThemePickerModal,
  UndoToast,
} from "@/components";
import { useEntries, useThemePreference } from "@/hooks";
import { acceptAgreement, checkAgreement, resetAgreement } from "@/storage";
import { ColorTokens, ThemeProvider, useTheme } from "@/theme";

import headerLogo from "./assets/icon.png";
import splashLogo from "./assets/splash-icon.png";

const SPLASH_DURATION_MS = 2000;
const APP_LABEL = (Constants.expoConfig?.extra?.appLabel as string) ?? "";

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
  const [pickerAnchor, setPickerAnchor] = useState({ top: 0, right: 0 });
  const settingsRef = useRef<View>(null);

  const openThemePicker = useCallback(() => {
    settingsRef.current?.measureInWindow((x, y, width, height) => {
      setPickerAnchor({ top: y + height + 4, right: 12 });
      setShowThemePicker(true);
    });
  }, []);
  const {
    entries,
    deletedEntry,
    discardedCount,
    load,
    add,
    remove,
    removeAll,
    seed,
    undo,
    dismissUndo,
    dismissDiscarded,
  } = useEntries();

  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function init() {
      const [accepted] = await Promise.all([
        checkAgreement().catch((e) => {
          console.error("Failed to check agreement", e);
          return true;
        }),
        load().catch((e) => console.error("Failed to load entries", e)),
        loadThemePreference().catch((e) =>
          console.error("Failed to load theme preference", e),
        ),
      ]);
      if (!accepted) {
        setShowAgreement(true);
      }
      setAgreementLoaded(true);

      if (!__DEV__) {
        Updates.checkForUpdateAsync()
          .then(async (update) => {
            if (update.isAvailable) {
              await Updates.fetchUpdateAsync();
              await Updates.reloadAsync();
            }
          })
          .catch((e) => console.error("Failed to check for updates", e));
      }
    }
    void init();
  }, [load, loadThemePreference]);

  const handleAcceptAgreement = () => {
    acceptAgreement()
      .then(() => setShowAgreement(false))
      .catch((e) => console.error("Failed to save agreement", e));
  };

  const handleResetAgreement = () => {
    resetAgreement()
      .then(() => setShowAgreement(true))
      .catch((e) => console.error("Failed to reset agreement", e));
  };

  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <Image
          source={splashLogo}
          style={styles.splashLogo}
          resizeMode="contain"
          testID="splash-logo"
        />
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <Image
          source={headerLogo}
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <Text style={styles.title}>in due time</Text>
        {APP_LABEL !== "" && <Text style={styles.appLabel}>{APP_LABEL}</Text>}
        <Pressable
          ref={settingsRef}
          onPress={openThemePicker}
          accessibilityLabel="Theme settings"
          accessibilityRole="button"
          hitSlop={8}
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

      <EntryForm onAdd={add} />
      <EntryList entries={entries} onDelete={remove} onDeleteAll={removeAll} />
      <HipaaAgreementModal
        visible={showAgreement && agreementLoaded}
        onAccept={handleAcceptAgreement}
      />
      <ThemePickerModal
        visible={showThemePicker}
        currentMode={themeMode}
        onSelect={setThemeMode}
        onClose={() => setShowThemePicker(false)}
        anchor={pickerAnchor}
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
              ? "1 entry was corrupted and removed"
              : `${discardedCount} entries were corrupted and removed`
          }
          onDismiss={dismissDiscarded}
        />
      )}

      <StatusBar style={resolvedTheme === "dark" ? "light" : "dark"} />
    </KeyboardAvoidingView>
  );
}

/** Creates styles based on the active color palette. */
function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    splashContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.splashBackground,
    },
    splashLogo: {
      width: 280,
      height: 160,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: 60,
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
