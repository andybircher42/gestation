import { useMemo } from "react";
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
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Updates = require("expo-updates");
} catch {
  // Not available in Expo Go
}

import { Brightness, ColorTokens, Personality, useTheme } from "@/theme";

interface ThemePickerModalProps {
  visible: boolean;
  currentPersonality: Personality;
  currentBrightness: Brightness;
  onSelectPersonality: (p: Personality) => void;
  onSelectBrightness: (b: Brightness) => void;
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

  let appVersion = `${version} (${buildId.slice(0, 8)})`;
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

const BRIGHTNESS_OPTIONS: {
  value: Brightness;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { value: "system", label: "System", icon: "contrast-outline" },
  { value: "light", label: "Light", icon: "sunny-outline" },
  { value: "dark", label: "Dark", icon: "moon-outline" },
];

/** Dropdown modal for selecting the app theme, anchored below the settings button. */
export default function ThemePickerModal({
  visible,
  currentPersonality,
  currentBrightness,
  onSelectPersonality,
  onSelectBrightness,
  onClose,
  onAppInfo,
  anchor,
}: ThemePickerModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const dropdownPosition = anchor ?? { top: 100, right: 12 };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.container}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close theme picker"
        />
        <View style={[styles.dropdown, dropdownPosition]}>
          <Text style={styles.title}>Theme</Text>
          {THEME_OPTIONS.map(({ value, label, icon }) => (
            <Pressable
              key={value}
              style={styles.row}
              onPress={() => {
                onSelectPersonality(value);
              }}
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
          <View style={styles.separator} />
          <Text style={styles.title}>Brightness</Text>
          {BRIGHTNESS_OPTIONS.map(({ value, label, icon }) => (
            <Pressable
              key={value}
              style={styles.row}
              onPress={() => {
                onSelectBrightness(value);
              }}
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
          <View style={styles.separator} />
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
      minWidth: 180,
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
    separator: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.textTertiary,
      marginVertical: 4,
    },
    rowLabel: {
      flex: 1,
      fontSize: 15,
      color: colors.textPrimary,
    },
  });
}
