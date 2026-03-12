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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { StatusBar } from "expo-status-bar";

import {
  AppInfoModal,
  CalendarView,
  DevToolbar,
  EntryList,
  InfoToast,
  ThemePickerModal,
  UndoToast,
} from "@/components";
import { useEntries } from "@/hooks";
import { resetAgreement, resetOnboarding } from "@/storage";
import { ColorTokens, useTheme } from "@/theme";

import headerLogoLight from "../assets/icon.png";
import headerLogoDark from "../assets/icon-dark.png";
import splashBgDark from "../assets/splash-bg-dark.png";
import splashBgLight from "../assets/splash-bg-light.png";

const APP_LABEL = (Constants.expoConfig?.extra?.appLabel as string) ?? "";

/** Main home screen with entry list/calendar and all modals. */
export default function HomeScreen() {
  const {
    colors,
    resolvedTheme,
    personality,
    brightness,
    setPersonality,
    setBrightness,
  } = useTheme();
  const insets = useSafeAreaInsets();

  const [view, setView] = useState<"list" | "calendar">("list");
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showAppInfo, setShowAppInfo] = useState(false);
  const [pickerAnchor, setPickerAnchor] = useState({ top: 0, right: 0 });
  const settingsRef = useRef<View>(null);

  const isDark = resolvedTheme === "dark";
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
    load().catch((e) => console.error("Failed to load entries", e));
  }, [load]);

  const handleResetAgreement = () => {
    Promise.all([resetAgreement(), resetOnboarding()])
      .then(() => {
        if (__DEV__) {
          DevSettings.reload();
        }
      })
      .catch((e) => console.error("Failed to reset agreement", e));
  };

  return (
    <ImageBackground
      source={splashBg}
      resizeMode="cover"
      style={styles.container}
      testID="app-bg"
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View
          style={[styles.header, { paddingTop: insets.top + 16 }]}
          testID="app-header"
        >
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
            onPress={() => setView((v) => (v === "list" ? "calendar" : "list"))}
            accessibilityLabel={
              view === "list"
                ? "Switch to calendar view"
                : "Switch to list view"
            }
            accessibilityRole="button"
            hitSlop={10}
          >
            <Ionicons
              name={view === "list" ? "calendar-outline" : "list-outline"}
              size={24}
              color={colors.textPrimary}
            />
          </Pressable>
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

        {view === "list" ? (
          <EntryList
            entries={entries}
            onDelete={remove}
            onDeleteAll={removeAll}
            onAdd={add}
          />
        ) : (
          <CalendarView entries={entries} />
        )}
        <ThemePickerModal
          visible={showThemePicker}
          currentPersonality={personality}
          currentBrightness={brightness}
          onSelectPersonality={setPersonality}
          onSelectBrightness={setBrightness}
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
    container: {
      flex: 1,
    },
    keyboardView: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      // paddingTop is applied dynamically via useSafeAreaInsets
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
