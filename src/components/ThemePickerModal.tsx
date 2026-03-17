import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";

import {
  Brightness,
  ColorTokens,
  Layout,
  Personality,
  RadiiTokens,
  useTheme,
} from "@/theme";

import HelpButton from "./HelpButton";

const appVersion = Constants.expoConfig?.version ?? "";

interface ThemePickerModalProps {
  visible: boolean;
  currentPersonality: Personality;
  currentBrightness: Brightness;
  currentLayout: Layout;
  currentDeliveredTTL: number;
  analyticsOptOut: boolean;
  onSelectPersonality: (p: Personality) => void;
  onSelectBrightness: (b: Brightness) => void;
  onSelectLayout: (l: Layout) => void;
  onSelectDeliveredTTL: (days: number) => void;
  onToggleAnalytics: () => void;
  onClose: () => void;
  onAppInfo?: () => void;
  anchor?: { top: number; right: number };
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

type SubPage = "main" | "ttl";

/** Dropdown modal for selecting the app theme, anchored below the settings button. */
export default function ThemePickerModal({
  visible,
  currentPersonality,
  currentBrightness,
  currentLayout,
  currentDeliveredTTL,
  analyticsOptOut,
  onSelectPersonality,
  onSelectBrightness,
  onSelectLayout,
  onSelectDeliveredTTL,
  onToggleAnalytics,
  onClose,
  onAppInfo,
  anchor,
}: ThemePickerModalProps) {
  const { colors, radii } = useTheme();
  const styles = useMemo(() => createStyles(colors, radii), [colors, radii]);
  const dropdownPosition = anchor ?? { top: 100, right: 12 };
  const [subPage, setSubPage] = useState<SubPage>("main");

  // Reset to main when modal opens
  useEffect(() => {
    if (visible) {
      setSubPage("main");
    }
  }, [visible]);

  const goBack = useCallback(() => setSubPage("main"), []);

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
          {subPage === "ttl" ? (
            <>
              <View style={styles.backRow}>
                <Pressable
                  style={styles.backButton}
                  onPress={goBack}
                  accessibilityRole="button"
                  accessibilityLabel="Back to settings"
                >
                  <Ionicons
                    name="chevron-back"
                    size={18}
                    color={colors.primary}
                    style={styles.backIcon}
                  />
                  <Text style={styles.backLabel}>Delivered cleanup</Text>
                </Pressable>
                <HelpButton
                  title="Delivered cleanup"
                  message='Automatically remove delivered entries after this many days. Choose "Never" to keep them until you remove them yourself.'
                />
              </View>
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
          ) : (
            <>
              <Text style={styles.sectionHeader}>Appearance</Text>
              <Text style={styles.title}>Theme</Text>
              <View style={styles.pillRow}>
                {THEME_OPTIONS.map(({ value, label, icon }) => (
                  <Pressable
                    key={value}
                    style={[
                      styles.pill,
                      currentPersonality === value && styles.pillActive,
                    ]}
                    onPress={() => onSelectPersonality(value)}
                    accessibilityRole="button"
                    accessibilityLabel={label}
                    accessibilityState={{
                      selected: currentPersonality === value,
                    }}
                  >
                    <Ionicons
                      name={icon}
                      size={18}
                      color={
                        currentPersonality === value
                          ? colors.primary
                          : colors.textTertiary
                      }
                    />
                    <Text
                      style={[
                        styles.pillLabel,
                        currentPersonality === value && styles.pillLabelActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.separator} />
              <Text style={styles.title}>Brightness</Text>
              <View style={styles.pillRow}>
                {BRIGHTNESS_OPTIONS.map(({ value, label, icon }) => (
                  <Pressable
                    key={value}
                    style={[
                      styles.pill,
                      currentBrightness === value && styles.pillActive,
                    ]}
                    onPress={() => onSelectBrightness(value)}
                    accessibilityRole="button"
                    accessibilityLabel={label}
                    accessibilityState={{
                      selected: currentBrightness === value,
                    }}
                  >
                    <Ionicons
                      name={icon}
                      size={18}
                      color={
                        currentBrightness === value
                          ? colors.primary
                          : colors.textTertiary
                      }
                    />
                    <Text
                      style={[
                        styles.pillLabel,
                        currentBrightness === value && styles.pillLabelActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.separator} />
              <Text style={styles.title}>Layout</Text>
              <View style={styles.pillRow}>
                {LAYOUT_OPTIONS.map(({ value, label, icon }) => (
                  <Pressable
                    key={value}
                    style={[
                      styles.pill,
                      currentLayout === value && styles.pillActive,
                    ]}
                    onPress={() => onSelectLayout(value)}
                    accessibilityRole="button"
                    accessibilityLabel={label}
                    accessibilityState={{ selected: currentLayout === value }}
                  >
                    <Ionicons
                      name={icon}
                      size={18}
                      color={
                        currentLayout === value
                          ? colors.primary
                          : colors.textTertiary
                      }
                    />
                    <Text
                      style={[
                        styles.pillLabel,
                        currentLayout === value && styles.pillLabelActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.separator} />
              <Text style={styles.sectionHeader}>Data</Text>
              <Pressable
                style={styles.row}
                onPress={() => setSubPage("ttl")}
                accessibilityRole="button"
                accessibilityLabel="Delivered cleanup settings"
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
              <Pressable
                style={styles.row}
                onPress={onToggleAnalytics}
                accessibilityRole="button"
                accessibilityLabel={
                  analyticsOptOut
                    ? "Analytics disabled. Tap to enable."
                    : "Analytics enabled. Tap to disable."
                }
              >
                <Ionicons
                  name={analyticsOptOut ? "analytics-outline" : "analytics"}
                  size={20}
                  color={colors.textPrimary}
                  style={styles.rowIcon}
                />
                <Text style={styles.rowLabel}>Analytics</Text>
                <Text style={styles.rowValue}>
                  {analyticsOptOut ? "Off" : "On"}
                </Text>
              </Pressable>
              <View style={styles.separator} />
              <Pressable
                style={styles.versionRow}
                onPress={() => {
                  onAppInfo?.();
                  onClose();
                }}
                accessibilityRole="button"
                accessibilityLabel="About and help"
              >
                <Text style={styles.versionLabel}>v{appVersion}</Text>
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color={colors.textTertiary}
                />
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

/** Creates styles based on the active color palette. */
function createStyles(colors: ColorTokens, radii: RadiiTokens) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    dropdown: {
      position: "absolute",
      backgroundColor: colors.contentBackground,
      borderRadius: radii.lg,
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
    sectionHeader: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.textTertiary,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginTop: 8,
      marginBottom: 2,
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
    pillRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 4,
    },
    pill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    pillActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryLightBg,
    },
    pillLabel: {
      fontSize: 12,
      color: colors.textTertiary,
    },
    pillLabelActive: {
      color: colors.primary,
      fontWeight: "600",
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
    versionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      paddingVertical: 4,
    },
    versionLabel: {
      fontSize: 12,
      color: colors.textTertiary,
    },
  });
}
