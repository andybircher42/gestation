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

import { ColorTokens, ThemeMode, useTheme } from "@/theme";

interface ThemePickerModalProps {
  visible: boolean;
  currentMode: ThemeMode;
  onSelect: (mode: ThemeMode) => void;
  onClose: () => void;
  anchor?: { top: number; right: number };
}

const BUG_REPORT_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSd3VdvE17NHIR7qQD8Ams10nBgAgf1n0JQ1mvWUUFKf7C3Z-w/viewform";
const FEATURE_REQUEST_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSeLS03h_8s3t0-IYXM04UjVv2fAhH37i2n56fPHB83OuHaQhw/viewform";

const THEME_OPTIONS: {
  mode: ThemeMode;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { mode: "system", label: "System", icon: "contrast-outline" },
  { mode: "light", label: "Light", icon: "sunny-outline" },
  { mode: "dark", label: "Dark", icon: "moon-outline" },
  { mode: "mono", label: "B&W", icon: "ellipse-outline" },
];

/** Dropdown modal for selecting the app theme, anchored below the settings button. */
export default function ThemePickerModal({
  visible,
  currentMode,
  onSelect,
  onClose,
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
          <Text style={styles.title}>Choose Theme</Text>
          {THEME_OPTIONS.map(({ mode, label, icon }) => (
            <Pressable
              key={mode}
              style={styles.row}
              onPress={() => {
                onSelect(mode);
                onClose();
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
              {currentMode === mode && (
                <Ionicons
                  name="checkmark"
                  size={20}
                  color={colors.primary}
                  testID={`checkmark-${mode}`}
                />
              )}
            </Pressable>
          ))}
          <View style={styles.separator} />
          <Pressable
            style={styles.row}
            onPress={() => {
              Linking.openURL(BUG_REPORT_URL);
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
          shadowColor: "#000",
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
      paddingVertical: 11,
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
