import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import Constants from "expo-constants";

import { checkTesterMode, toggleTesterMode } from "@/storage";

let Updates: { updateId: string | null; isEmbeddedLaunch: boolean } | undefined;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Updates = require("expo-updates");
} catch {
  // Not available in Expo Go
}

import { ColorTokens, useTheme } from "@/theme";

interface AppInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

/** Centered overlay modal that displays basic app information (name and version). */
export default function AppInfoModal({ visible, onClose }: AppInfoModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isTester, setIsTester] = useState(false);

  useEffect(() => {
    if (visible) {
      checkTesterMode()
        .then(setIsTester)
        .catch(() => {});
    }
  }, [visible]);

  const handleToggleTester = useCallback(() => {
    toggleTesterMode()
      .then((next) => {
        setIsTester(next);
        Alert.alert(
          next ? "Tester mode enabled" : "Tester mode disabled",
          next
            ? "Analytics registration will be skipped on next launch."
            : "Analytics registration will resume on next launch.",
        );
      })
      .catch(() => {});
  }, []);

  const appName = Constants.expoConfig?.name ?? "in due time";
  const appVersion = Constants.expoConfig?.version ?? "unknown";
  const buildId = (Constants.expoConfig?.extra?.easBuildId as string) || "";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Pressable
            onLongPress={handleToggleTester}
            accessibilityLabel="About, long press to toggle tester mode"
          >
            <Text style={styles.modalTitle}>
              About{isTester ? " (tester)" : ""}
            </Text>
          </Pressable>
          <Text style={styles.appName}>{appName}</Text>
          <Text style={styles.versionText}>Version {appVersion}</Text>
          {buildId !== "" && (
            <Pressable
              style={styles.copyRow}
              onPress={() => Clipboard.setStringAsync(buildId)}
              accessibilityLabel="Copy build ID"
              accessibilityRole="button"
            >
              <Text style={styles.detailText}>
                Build: {buildId.slice(0, 8)}…
              </Text>
              <Ionicons
                name="copy-outline"
                size={12}
                color={colors.textTertiary}
              />
            </Pressable>
          )}
          {Updates?.updateId != null && !Updates?.isEmbeddedLaunch && (
            <Pressable
              style={styles.copyRow}
              onPress={() => Clipboard.setStringAsync(Updates!.updateId!)}
              accessibilityLabel="Copy update ID"
              accessibilityRole="button"
            >
              <Text style={styles.detailText}>
                Update: {Updates.updateId.slice(0, 8)}…
              </Text>
              <Ionicons
                name="copy-outline"
                size={12}
                color={colors.textTertiary}
              />
            </Pressable>
          )}
          <Pressable
            style={styles.copyRow}
            onPress={() =>
              Clipboard.setStringAsync(
                `${Platform.OS === "ios" ? "iOS" : "Android"} ${Platform.Version}`,
              )
            }
            accessibilityLabel="Copy platform version"
            accessibilityRole="button"
          >
            <Text style={styles.detailText}>
              {Platform.OS === "ios" ? "iOS" : "Android"} version:{" "}
              {Platform.Version}
            </Text>
            <Ionicons
              name="copy-outline"
              size={12}
              color={colors.textTertiary}
            />
          </Pressable>
          <View style={styles.lastDetail} />
          <Pressable
            style={styles.closeButton}
            onPress={onClose}
            accessibilityRole="button"
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

/** Creates styles based on the active color palette. */
function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.modalOverlay,
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    modalContent: {
      backgroundColor: colors.contentBackground,
      borderRadius: 16,
      padding: 24,
      width: "100%",
      alignItems: "center",
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.textPrimary,
      marginBottom: 16,
      textAlign: "center",
    },
    appName: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.textPrimary,
      marginBottom: 8,
    },
    versionText: {
      fontSize: 15,
      color: colors.textModal,
      marginBottom: 4,
    },
    copyRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      minHeight: 44,
    },
    detailText: {
      fontSize: 14,
      color: colors.textTertiary,
      marginBottom: 4,
    },
    lastDetail: {
      marginBottom: 20,
    },
    closeButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      padding: 14,
      alignItems: "center",
      width: "100%",
    },
    closeButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "600",
    },
  });
}
