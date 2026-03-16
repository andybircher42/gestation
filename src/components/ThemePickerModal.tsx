import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";

let Updates: { updateId: string | null } | undefined;
if (!__DEV__) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Updates = require("expo-updates");
  } catch {
    // Not available in Expo Go
  }
}

import {
  Brightness,
  ColorTokens,
  Layout,
  Personality,
  useTheme,
} from "@/theme";

import HelpButton from "./HelpButton";

interface ThemePickerModalProps {
  visible: boolean;
  currentPersonality: Personality;
  currentBrightness: Brightness;
  currentLayout: Layout;
  currentDeliveredTTL: number;
  onSelectPersonality: (p: Personality) => void;
  onSelectBrightness: (b: Brightness) => void;
  onSelectLayout: (l: Layout) => void;
  onSelectDeliveredTTL: (days: number) => void;
  onClose: () => void;
  onAppInfo?: () => void;
  anchor?: { top: number; right: number };
}

const BUG_REPORT_BASE_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSd3VdvE17NHIR7qQD8Ams10nBgAgf1n0JQ1mvWUUFKf7C3Z-w/viewform";

/** Builds the bug report URL with app version and OS version pre-filled. */
function buildBugReportUrl(): string {
  const version = Constants.expoConfig?.version ?? "unknown";
  const buildId = (Constants.expoConfig?.extra?.easBuildId as string) || "";
  const updateId = Updates?.updateId ?? null;

  let appVersion =
    buildId !== "" ? `${version} (${buildId.slice(0, 8)})` : version;
  if (updateId != null) {
    appVersion += ` update:${updateId.slice(0, 8)}`;
  }

  const osName = Platform.OS === "ios" ? "iOS" : "Android";
  const osVersion = `${osName} ${Platform.Version}`;

  const params = new URLSearchParams({
    "entry.1845428880": appVersion,
    "entry.765646897": osVersion,
  });
  return `${BUG_REPORT_BASE_URL}?${params.toString()}`;
}
const FEATURE_REQUEST_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSeLS03h_8s3t0-IYXM04UjVv2fAhH37i2n56fPHB83OuHaQhw/viewform";
const USER_GUIDE_URL = "https://andybircher42.github.io/InDueTime/guide/";
const USER_GUIDE_FALLBACK_URL =
  "https://github.com/andybircher42/InDueTime/blob/main/docs/user-guide.md";

/** Opens the hosted user guide, falling back to GitHub if it 404s. */
async function openUserGuide(): Promise<void> {
  try {
    const res = await fetch(USER_GUIDE_URL, { method: "HEAD" });
    if (res.ok) {
      await Linking.openURL(USER_GUIDE_URL);
      return;
    }
  } catch {
    // Network error — fall through to fallback
  }
  await Linking.openURL(USER_GUIDE_FALLBACK_URL);
}

const THEME_OPTIONS: {
  value: Personality;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { value: "classic", label: "Classic", icon: "color-palette-outline" },
  { value: "warm", label: "Warm", icon: "flame-outline" },
  { value: "elegant", label: "Elegant", icon: "diamond-outline" },
  { value: "playful", label: "Playful", icon: "heart-outline" },
  { value: "modern", label: "Modern", icon: "cube-outline" },
  { value: "mono", label: "B&W", icon: "ellipse-outline" },
];

const LAYOUT_OPTIONS: {
  value: Layout;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { value: "compact", label: "Compact", icon: "list-outline" },
  { value: "cozy", label: "Cozy", icon: "grid-outline" },
];

const BRIGHTNESS_OPTIONS: {
  value: Brightness;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { value: "system", label: "System", icon: "contrast-outline" },
  { value: "light", label: "Light", icon: "sunny-outline" },
  { value: "dark", label: "Dark", icon: "moon-outline" },
];

const TTL_OPTIONS: {
  value: number;
  label: string;
}[] = [
  { value: 0, label: "Never" },
  { value: 1, label: "1 day" },
  { value: 3, label: "3 days" },
  { value: 7, label: "1 week" },
  { value: 14, label: "2 weeks" },
  { value: 30, label: "30 days" },
];

type SubPage = "main" | "theme" | "brightness" | "layout" | "ttl";

/** Dropdown modal for selecting the app theme, anchored below the settings button. */
export default function ThemePickerModal({
  visible,
  currentPersonality,
  currentBrightness,
  currentLayout,
  currentDeliveredTTL,
  onSelectPersonality,
  onSelectBrightness,
  onSelectLayout,
  onSelectDeliveredTTL,
  onClose,
  onAppInfo,
  anchor,
}: ThemePickerModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const dropdownPosition = anchor ?? { top: 100, right: 12 };
  const [subPage, setSubPage] = useState<SubPage>("main");

  // Reset to main when modal opens
  useEffect(() => {
    if (visible) {
      setSubPage("main");
    }
  }, [visible]);

  const goBack = useCallback(() => setSubPage("main"), []);

  const renderBackRow = (label: string, helpText?: string) => (
    <View style={styles.backRow}>
      <Pressable
        style={styles.backButton}
        onPress={goBack}
        accessibilityRole="button"
        accessibilityLabel={`Back to settings`}
      >
        <Ionicons
          name="chevron-back"
          size={18}
          color={colors.primary}
          style={styles.backIcon}
        />
        <Text style={styles.backLabel}>{label}</Text>
      </Pressable>
      {helpText != null && <HelpButton title={label} message={helpText} />}
    </View>
  );

  const renderSubPage = () => {
    switch (subPage) {
      case "theme":
        return (
          <>
            {renderBackRow(
              "Theme",
              "Sets the color personality across the app.",
            )}
            {THEME_OPTIONS.map(({ value, label, icon }) => (
              <Pressable
                key={value}
                style={styles.row}
                onPress={() => onSelectPersonality(value)}
                accessibilityRole="button"
                accessibilityLabel={label}
              >
                <Ionicons
                  name={icon}
                  size={20}
                  color={colors.textPrimary}
                  style={styles.rowIcon}
                />
                <Text style={styles.rowLabel}>{label}</Text>
                {currentPersonality === value && (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={colors.primary}
                    testID={`checkmark-theme-${value}`}
                  />
                )}
              </Pressable>
            ))}
          </>
        );
      case "brightness":
        return (
          <>
            {renderBackRow(
              "Brightness",
              '"System" follows your phone\'s light/dark setting.',
            )}
            {BRIGHTNESS_OPTIONS.map(({ value, label, icon }) => (
              <Pressable
                key={value}
                style={styles.row}
                onPress={() => onSelectBrightness(value)}
                accessibilityRole="button"
                accessibilityLabel={label}
              >
                <Ionicons
                  name={icon}
                  size={20}
                  color={colors.textPrimary}
                  style={styles.rowIcon}
                />
                <Text style={styles.rowLabel}>{label}</Text>
                {currentBrightness === value && (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={colors.primary}
                    testID={`checkmark-brightness-${value}`}
                  />
                )}
              </Pressable>
            ))}
          </>
        );
      case "layout":
        return (
          <>
            {renderBackRow(
              "Layout",
              "Compact shows a dense list. Cozy shows a two-column card grid with larger icons.",
            )}
            {LAYOUT_OPTIONS.map(({ value, label, icon }) => (
              <Pressable
                key={value}
                style={styles.row}
                onPress={() => onSelectLayout(value)}
                accessibilityRole="button"
                accessibilityLabel={label}
              >
                <Ionicons
                  name={icon}
                  size={20}
                  color={colors.textPrimary}
                  style={styles.rowIcon}
                />
                <Text style={styles.rowLabel}>{label}</Text>
                {currentLayout === value && (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={colors.primary}
                    testID={`checkmark-layout-${value}`}
                  />
                )}
              </Pressable>
            ))}
          </>
        );
      case "ttl":
        return (
          <>
            {renderBackRow(
              "Delivered cleanup",
              'Automatically remove delivered entries after this many days. Choose "Never" to keep them until you remove them yourself.',
            )}
            {TTL_OPTIONS.map(({ value, label }) => (
              <Pressable
                key={value}
                style={styles.row}
                onPress={() => onSelectDeliveredTTL(value)}
                accessibilityRole="button"
                accessibilityLabel={label}
              >
                <Ionicons
                  name={value === 0 ? "infinite-outline" : "timer-outline"}
                  size={20}
                  color={colors.textPrimary}
                  style={styles.rowIcon}
                />
                <Text style={styles.rowLabel}>{label}</Text>
                {currentDeliveredTTL === value && (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={colors.primary}
                    testID={`checkmark-ttl-${value}`}
                  />
                )}
              </Pressable>
            ))}
          </>
        );
      default:
        return null;
    }
  };

  const currentThemeLabel =
    THEME_OPTIONS.find((o) => o.value === currentPersonality)?.label ?? "";
  const currentBrightnessLabel =
    BRIGHTNESS_OPTIONS.find((o) => o.value === currentBrightness)?.label ?? "";
  const currentLayoutLabel =
    LAYOUT_OPTIONS.find((o) => o.value === currentLayout)?.label ?? "";
  const currentTTLLabel =
    TTL_OPTIONS.find((o) => o.value === currentDeliveredTTL)?.label ?? "";

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.container} accessibilityViewIsModal>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close settings"
        />
        <View style={[styles.dropdown, dropdownPosition]}>
          {subPage === "main" ? (
            <>
              <Text style={styles.title}>Appearance</Text>
              <Pressable
                style={styles.row}
                onPress={() => setSubPage("theme")}
                accessibilityRole="button"
                accessibilityLabel="Theme settings"
              >
                <Ionicons
                  name="color-palette-outline"
                  size={20}
                  color={colors.textPrimary}
                  style={styles.rowIcon}
                />
                <Text style={styles.rowLabel}>Theme</Text>
                <Text style={styles.rowValue}>{currentThemeLabel}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.textTertiary}
                />
              </Pressable>
              <Pressable
                style={styles.row}
                onPress={() => setSubPage("brightness")}
                accessibilityRole="button"
                accessibilityLabel="Brightness settings"
              >
                <Ionicons
                  name="contrast-outline"
                  size={20}
                  color={colors.textPrimary}
                  style={styles.rowIcon}
                />
                <Text style={styles.rowLabel}>Brightness</Text>
                <Text style={styles.rowValue}>{currentBrightnessLabel}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.textTertiary}
                />
              </Pressable>
              <Pressable
                style={styles.row}
                onPress={() => setSubPage("layout")}
                accessibilityRole="button"
                accessibilityLabel="Layout settings"
              >
                <Ionicons
                  name={
                    currentLayout === "compact"
                      ? "list-outline"
                      : "grid-outline"
                  }
                  size={20}
                  color={colors.textPrimary}
                  style={styles.rowIcon}
                />
                <Text style={styles.rowLabel}>Layout</Text>
                <Text style={styles.rowValue}>{currentLayoutLabel}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.textTertiary}
                />
              </Pressable>
              <View style={styles.separator} />
              <Text style={styles.title}>Preferences</Text>
              <Pressable
                style={styles.row}
                onPress={() => setSubPage("ttl")}
                accessibilityRole="button"
                accessibilityLabel="Delivered cleanup delivered settings"
              >
                <Ionicons
                  name="timer-outline"
                  size={20}
                  color={colors.textPrimary}
                  style={styles.rowIcon}
                />
                <Text style={styles.rowLabel}>Delivered cleanup</Text>
                <Text style={styles.rowValue}>{currentTTLLabel}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.textTertiary}
                />
              </Pressable>
              <View style={styles.separator} />
              <Pressable
                style={styles.row}
                onPress={() => {
                  openUserGuide();
                  onClose();
                }}
                accessibilityRole="button"
                accessibilityLabel="Help and FAQ"
              >
                <Ionicons
                  name="help-circle-outline"
                  size={20}
                  color={colors.textPrimary}
                  style={styles.rowIcon}
                />
                <Text style={styles.rowLabel}>Help & FAQ</Text>
              </Pressable>
              <Pressable
                style={styles.row}
                onPress={() => {
                  Linking.openURL(buildBugReportUrl());
                  onClose();
                }}
                accessibilityRole="button"
                accessibilityLabel="Report a Bug"
              >
                <Ionicons
                  name="bug-outline"
                  size={20}
                  color={colors.textPrimary}
                  style={styles.rowIcon}
                />
                <Text style={styles.rowLabel}>Report a Bug</Text>
              </Pressable>
              <Pressable
                style={styles.row}
                onPress={() => {
                  Linking.openURL(FEATURE_REQUEST_URL);
                  onClose();
                }}
                accessibilityRole="button"
                accessibilityLabel="Request a Feature"
              >
                <Ionicons
                  name="bulb-outline"
                  size={20}
                  color={colors.textPrimary}
                  style={styles.rowIcon}
                />
                <Text style={styles.rowLabel}>Request a Feature</Text>
              </Pressable>
              <View style={styles.separator} />
              <Pressable
                style={styles.row}
                onPress={() => {
                  onAppInfo?.();
                  onClose();
                }}
                accessibilityRole="button"
                accessibilityLabel="App Info"
              >
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color={colors.textPrimary}
                  style={styles.rowIcon}
                />
                <Text style={styles.rowLabel}>App Info</Text>
              </Pressable>
            </>
          ) : (
            renderSubPage()
          )}
        </View>
      </View>
    </Modal>
  );
}

/** Creates styles based on the active color palette. */
function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    dropdown: {
      position: "absolute",
      backgroundColor: colors.contentBackground,
      borderRadius: 12,
      paddingVertical: 8,
      paddingHorizontal: 16,
      minWidth: 220,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    title: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textTertiary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginTop: 4,
      marginBottom: 4,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 44,
    },
    rowIcon: {
      marginRight: 12,
    },
    rowLabel: {
      flex: 1,
      fontSize: 15,
      color: colors.textPrimary,
    },
    rowValue: {
      fontSize: 13,
      color: colors.textTertiary,
      marginRight: 6,
    },
    separator: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.textTertiary,
      marginVertical: 4,
    },
    backRow: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 40,
      marginBottom: 4,
    },
    backButton: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    backIcon: {
      marginRight: 4,
    },
    backLabel: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.primary,
    },
  });
}
