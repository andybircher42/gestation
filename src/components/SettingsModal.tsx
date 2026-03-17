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

import { ColorTokens, RadiiTokens, useTheme } from "@/theme";

import HelpButton from "./HelpButton";

const appVersion = Constants.expoConfig?.version ?? "";

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

interface SettingsModalProps {
  visible: boolean;
  currentDeliveredTTL: number;
  analyticsOptOut: boolean;
  onSelectDeliveredTTL: (days: number) => void;
  onToggleAnalytics: () => void;
  onClose: () => void;
  onAppInfo?: () => void;
  anchor?: { top: number; right: number };
}

/** Dropdown modal for data preferences and app info. */
export default function SettingsModal({
  visible,
  currentDeliveredTTL,
  analyticsOptOut,
  onSelectDeliveredTTL,
  onToggleAnalytics,
  onClose,
  onAppInfo,
  anchor,
}: SettingsModalProps) {
  const { colors, radii } = useTheme();
  const styles = useMemo(() => createStyles(colors, radii), [colors, radii]);
  const dropdownPosition = anchor ?? { top: 100, right: 12 };
  const [subPage, setSubPage] = useState<SubPage>("main");

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
    versionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 8,
      minHeight: 44,
    },
    versionLabel: {
      fontSize: 14,
      color: colors.textTertiary,
    },
  });
}
