import { useMemo } from "react";
import { Animated, Linking, Platform, Pressable, StyleSheet, Text } from "react-native";

import { useSwipeDismiss } from "@/hooks";
import { ColorTokens, useTheme } from "@/theme";

interface UpdateBuildToastProps {
  latestVersion: string;
  onDismiss: () => void;
}

const IOS_STORE_URL = "https://apps.apple.com";
const ANDROID_STORE_URL = "https://play.google.com/store";

/** Toast shown when a newer native build is available. */
export default function UpdateBuildToast({
  latestVersion,
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
    const url = Platform.OS === "ios" ? IOS_STORE_URL : ANDROID_STORE_URL;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY }] }]}
      accessibilityLabel="Update build toast"
      {...panHandlers}
    >
      <Text style={styles.message}>
        New build available (v{latestVersion})
      </Text>
      <Pressable
        onPress={handleDetails}
        style={styles.detailsButton}
        accessibilityRole="button"
      >
        <Text style={styles.detailsText}>Details</Text>
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
    message: {
      flex: 1,
      color: colors.toastText,
      fontSize: 14,
    },
    detailsButton: {
      marginLeft: 12,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: colors.primary,
      borderRadius: 6,
    },
    detailsText: {
      color: colors.white,
      fontSize: 14,
      fontWeight: "600",
    },
  });
}
