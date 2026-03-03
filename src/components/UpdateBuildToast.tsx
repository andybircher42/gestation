import { useMemo } from "react";
import { Animated, Linking, Pressable, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useSwipeDismiss } from "@/hooks";
import { ColorTokens, useTheme } from "@/theme";

interface UpdateBuildToastProps {
  latestVersion: string;
  latestBuildId?: string;
  onDismiss: () => void;
}

const EAS_BUILD_BASE_URL =
  "https://expo.dev/accounts/andybircher/projects/in-due-time/builds";
const HELP_URL = "https://andybircher42.github.io/gestation/";

/** Toast shown when a newer native build is available. */
export default function UpdateBuildToast({
  latestVersion,
  latestBuildId,
  onDismiss,
}: UpdateBuildToastProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { animatedValue: translateY, panHandlers } = useSwipeDismiss({
    axis: "y",
    threshold: 30,
    onDismiss,
    positiveOnly: true,
    overshoot: 200,
    duration: 150,
  });

  const handleDetails = () => {
    const url = latestBuildId
      ? `${EAS_BUILD_BASE_URL}/${latestBuildId}`
      : EAS_BUILD_BASE_URL;
    Linking.openURL(url).catch(() => {});
  };

  const handleHelp = () => {
    Linking.openURL(HELP_URL).catch(() => {});
  };

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY }] }]}
      accessibilityLabel="Update build toast"
      {...panHandlers}
    >
      <Pressable onPress={handleDetails} style={styles.messageRow}>
        <Text style={styles.message}>
          New build available (v{latestVersion})
        </Text>
        <Text style={styles.downloadLink}>Tap to download</Text>
      </Pressable>
      <Pressable
        onPress={handleHelp}
        style={styles.helpButton}
        accessibilityLabel="How to update"
        accessibilityRole="link"
      >
        <Text style={styles.helpText}>Help</Text>
      </Pressable>
      <Pressable
        onPress={onDismiss}
        style={styles.dismissButton}
        accessibilityLabel="Dismiss"
        accessibilityRole="button"
        hitSlop={8}
      >
        <Ionicons name="close" size={18} color={colors.toastText} />
      </Pressable>
    </Animated.View>
  );
}

/** Creates styles based on the active color palette. */
function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    container: {
      position: "absolute",
      bottom: 32,
      left: 16,
      right: 16,
      backgroundColor: colors.toastBackground,
      borderRadius: 10,
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    messageRow: {
      flex: 1,
    },
    message: {
      color: colors.toastText,
      fontSize: 14,
      fontWeight: "600",
    },
    downloadLink: {
      color: colors.toastText,
      fontSize: 12,
      textDecorationLine: "underline",
      marginTop: 2,
      opacity: 0.8,
    },
    helpButton: {
      marginLeft: 12,
      paddingHorizontal: 8,
      paddingVertical: 6,
    },
    helpText: {
      color: colors.toastText,
      fontSize: 13,
      textDecorationLine: "underline",
      opacity: 0.8,
    },
    dismissButton: {
      marginLeft: 4,
      padding: 4,
    },
  });
}
