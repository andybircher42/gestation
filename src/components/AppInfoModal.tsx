import { useMemo } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Constants from "expo-constants";
import * as Updates from "expo-updates";

import { ColorTokens, useTheme } from "@/theme";

interface BuildStatus {
  isOutdated: boolean;
  latestVersion?: string;
}

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
          <Text style={styles.detailText}>Build {buildId.slice(0, 8)}</Text>
          {Updates.updateId != null && (
            <Text style={styles.detailText}>
              Update {Updates.updateId.slice(0, 8)}
            </Text>
          )}
          <Text style={styles.detailText}>
            {Platform.OS === "ios" ? "iOS" : "Android"} {Platform.Version}
          </Text>
          {buildStatus != null && (
            <Text
              style={[
                styles.detailText,
                styles.lastDetail,
                buildStatus.isOutdated ? styles.outdatedText : undefined,
              ]}
            >
              {buildStatus.isOutdated
                ? `New build available (v${buildStatus.latestVersion})`
                : "Up to date"}
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
    detailText: {
      fontSize: 13,
      color: colors.textTertiary,
      marginBottom: 4,
    },
    lastDetail: {
      marginBottom: 20,
    },
    outdatedText: {
      color: colors.primary,
      fontWeight: "600",
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
