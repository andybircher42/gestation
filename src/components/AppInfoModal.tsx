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
import * as Clipboard from "expo-clipboard";
import Constants from "expo-constants";
import * as Updates from "expo-updates";

import { ColorTokens, useTheme } from "@/theme";

interface BuildStatus {
  isOutdated: boolean;
  latestVersion?: string;
  latestBuildId?: string;
}

const EAS_BUILD_BASE_URL =
  "https://expo.dev/accounts/andybircher/projects/in-due-time/builds";
const HELP_URL = "https://andybircher42.github.io/gestation/";

interface AppInfoModalProps {
  visible: boolean;
  onClose: () => void;
  buildStatus?: BuildStatus;
}

/** Centered overlay modal that displays basic app information (name and version). */
export default function AppInfoModal({
  visible,
  onClose,
  buildStatus,
}: AppInfoModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
          <Text style={styles.modalTitle}>About</Text>
          <Text style={styles.appName}>{appName}</Text>
          <Text style={styles.versionText}>Version {appVersion}</Text>
          <Pressable
            style={styles.copyRow}
            onPress={() => Clipboard.setStringAsync(buildId)}
            accessibilityLabel="Copy build ID"
            accessibilityRole="button"
          >
            <Text style={styles.detailText}>
              Build version: {buildId.slice(0, 8)}…
            </Text>
            <Ionicons
              name="copy-outline"
              size={12}
              color={colors.textTertiary}
            />
          </Pressable>
          {Updates.updateId != null && (
            <Pressable
              style={styles.copyRow}
              onPress={() => Clipboard.setStringAsync(Updates.updateId!)}
              accessibilityLabel="Copy update ID"
              accessibilityRole="button"
            >
              <Text style={styles.detailText}>
                Update version: {Updates.updateId.slice(0, 8)}…
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
          {buildStatus != null && buildStatus.isOutdated && (
            <View style={styles.statusRow}>
              <Pressable
                onPress={() => {
                  const url = buildStatus.latestBuildId
                    ? `${EAS_BUILD_BASE_URL}/${buildStatus.latestBuildId}`
                    : EAS_BUILD_BASE_URL;
                  Linking.openURL(url).catch(() => {});
                }}
                accessibilityLabel="Download new build"
                accessibilityRole="link"
              >
                <Text style={[styles.detailText, styles.outdatedText]}>
                  New build available (v{buildStatus.latestVersion})
                </Text>
              </Pressable>
              <Pressable
                onPress={() => Linking.openURL(HELP_URL).catch(() => {})}
                accessibilityLabel="How to update"
                accessibilityRole="link"
              >
                <Text style={[styles.detailText, styles.helpLink]}>Help</Text>
              </Pressable>
            </View>
          )}
          {buildStatus != null && !buildStatus.isOutdated && (
            <Text style={[styles.detailText, styles.lastDetail]}>
              Up to date
            </Text>
          )}
          {buildStatus == null && <View style={styles.lastDetail} />}
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
    },
    detailText: {
      fontSize: 13,
      color: colors.textTertiary,
      marginBottom: 4,
    },
    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 20,
    },
    lastDetail: {
      marginBottom: 20,
    },
    outdatedText: {
      color: colors.primary,
      fontWeight: "600",
      textDecorationLine: "underline",
    },
    helpLink: {
      color: colors.textTertiary,
      textDecorationLine: "underline",
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
