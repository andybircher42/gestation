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
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

import {
  AppInfoModal,
  CalendarView,
  DeliveredList,
  DevToolbar,
  EntryGrid,
  EntryList,
  InfoToast,
  ThemePickerModal,
  ToastStack,
  UndoToast,
} from "@/components";
import { useEntries } from "@/hooks";
import { Entry, resetAgreement, resetOnboarding } from "@/storage";
import { ColorTokens, useTheme } from "@/theme";
import { reportError } from "@/util";

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
    layout,
    setPersonality,
    setBrightness,
    setLayout,
  } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  type ViewTab = "expecting" | "delivered" | "calendar";
  const [view, setView] = useState<ViewTab>("expecting");
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);
  const [showAppInfo, setShowAppInfo] = useState(false);
  const [pickerAnchor, setPickerAnchor] = useState({ top: 0, right: 0 });
  const [devAnchor, setDevAnchor] = useState({ top: 0, right: 0 });
  const settingsRef = useRef<View>(null);
  const devRef = useRef<View>(null);

  const isDark = resolvedTheme === "dark";
  const splashBg = isDark ? splashBgDark : splashBgLight;
  const headerLogo = isDark ? headerLogoDark : headerLogoLight;

  const openThemePicker = useCallback(() => {
    settingsRef.current?.measureInWindow((_x, y, _width, height) => {
      setPickerAnchor({ top: y + height + 4, right: 12 });
      setShowThemePicker(true);
    });
  }, []);

  const openDevTools = useCallback(() => {
    devRef.current?.measureInWindow((_x, y, _width, height) => {
      setDevAnchor({ top: y + height + 4, right: 12 });
      setShowDevTools(true);
    });
  }, []);

  const {
    entries,
    deletedEntry,
    deliveredEntry,
    deliveredTTLDays,
    discardedCount,
    saveError,
    load,
    add,
    deliver,
    remove,
    removeAll,
    seed,
    undo,
    dismissUndo,
    undoDeliver,
    dismissDelivered,
    updateDeliveredTTL,
    dismissDiscarded,
    dismissSaveError,
  } = useEntries();

  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    load().catch((e) => reportError("Failed to load entries", e));
  }, [load]);

  const handleDayPress = useCallback(
    (date: string, dueEntries: Entry[]) => {
      router.push({
        pathname: "/date-detail",
        params: { date, entries: JSON.stringify(dueEntries) },
      });
    },
    [router],
  );

  const handleResetAgreement = () => {
    Promise.all([resetAgreement(), resetOnboarding()])
      .then(() => {
        if (__DEV__) {
          DevSettings.reload();
        }
      })
      .catch((e) => reportError("Failed to reset agreement", e));
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
          {__DEV__ && (
            <Pressable
              ref={devRef}
              onPress={openDevTools}
              accessibilityLabel="Dev tools"
              accessibilityRole="button"
              hitSlop={10}
            >
              <Ionicons
                name="build-outline"
                size={22}
                color={colors.textPrimary}
              />
            </Pressable>
          )}
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
        </View>

        <View style={styles.tabBar}>
          {(["expecting", "delivered", "calendar"] as const).map((tab) => {
            const count =
              tab === "expecting"
                ? entries.filter((e) => !e.deliveredAt).length
                : tab === "delivered"
                  ? entries.filter((e) => !!e.deliveredAt).length
                  : 0;
            return (
              <Pressable
                key={tab}
                style={[styles.tab, view === tab && styles.tabActive]}
                onPress={() => setView(tab)}
                accessibilityRole="tab"
                accessibilityState={{ selected: view === tab }}
              >
                <Text
                  style={[styles.tabText, view === tab && styles.tabTextActive]}
                >
                  {tab === "expecting"
                    ? "Expecting"
                    : tab === "delivered"
                      ? "Delivered"
                      : "Calendar"}
                  {count > 0 && (
                    <Text style={styles.tabBadge}>{` ${count}`}</Text>
                  )}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View
          style={[styles.tabContent, view !== "expecting" && styles.hidden]}
        >
          {layout === "cozy" ? (
            <EntryGrid
              entries={entries}
              onDelete={remove}
              onDeliver={deliver}
              onDeleteAll={removeAll}
              onAdd={add}
            />
          ) : (
            <EntryList
              entries={entries}
              onDelete={remove}
              onDeliver={deliver}
              onDeleteAll={removeAll}
              onAdd={add}
            />
          )}
        </View>
        <View
          style={[styles.tabContent, view !== "delivered" && styles.hidden]}
        >
          <DeliveredList entries={entries} onDelete={remove} />
        </View>
        <View style={[styles.tabContent, view !== "calendar" && styles.hidden]}>
          <CalendarView entries={entries} onDayPress={handleDayPress} />
        </View>
        <ThemePickerModal
          visible={showThemePicker}
          currentPersonality={personality}
          currentBrightness={brightness}
          currentLayout={layout}
          currentDeliveredTTL={deliveredTTLDays}
          onSelectPersonality={setPersonality}
          onSelectBrightness={setBrightness}
          onSelectLayout={setLayout}
          onSelectDeliveredTTL={updateDeliveredTTL}
          onClose={() => setShowThemePicker(false)}
          onAppInfo={() => setShowAppInfo(true)}
          anchor={pickerAnchor}
        />
        {__DEV__ && (
          <DevToolbar
            visible={showDevTools}
            onSeedData={seed}
            onResetAgreement={handleResetAgreement}
            onClose={() => setShowDevTools(false)}
            anchor={devAnchor}
          />
        )}
        <AppInfoModal
          visible={showAppInfo}
          onClose={() => setShowAppInfo(false)}
        />

        <ToastStack>
          {deletedEntry && (
            <UndoToast
              entry={deletedEntry.entry}
              onUndo={undo}
              onDismiss={dismissUndo}
              embedded
            />
          )}

          {deliveredEntry && (
            <UndoToast
              entry={deliveredEntry.entry}
              action="Delivered"
              onUndo={undoDeliver}
              onDismiss={dismissDelivered}
              embedded
            />
          )}

          {discardedCount > 0 && (
            <InfoToast
              message={
                discardedCount === 1
                  ? "We removed someone whose data was unreadable"
                  : `We removed ${discardedCount} people whose data was unreadable`
              }
              onDismiss={dismissDiscarded}
              embedded
            />
          )}

          {saveError && (
            <InfoToast
              message="Your changes might not be saved. Try again or restart the app."
              onDismiss={dismissSaveError}
              embedded
            />
          )}
        </ToastStack>

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
      paddingBottom: 12,
      paddingHorizontal: 20,
      backgroundColor: colors.contentBackground,
      gap: 10,
      zIndex: 10,
      overflow: "visible",
    },
    tabBar: {
      flexDirection: "row",
      backgroundColor: colors.contentBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingHorizontal: 20,
    },
    tab: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderBottomWidth: 2,
      borderBottomColor: "transparent",
    },
    tabActive: {
      borderBottomColor: colors.primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textTertiary,
    },
    tabTextActive: {
      color: colors.primary,
    },
    tabBadge: {
      fontSize: 12,
      fontWeight: "700",
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
    tabContent: {
      flex: 1,
    },
    hidden: {
      display: "none",
    },
  });
}
