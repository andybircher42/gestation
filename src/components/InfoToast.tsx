import { useEffect, useMemo } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSwipeDismiss } from "@/hooks";
import { ColorTokens, useTheme } from "@/theme";

interface InfoToastProps {
  message: string;
  onDismiss: () => void;
}

const TOAST_DURATION_MS = 5000;

/** Simple informational toast with auto-dismiss and swipe-to-dismiss. */
export default function InfoToast({ message, onDismiss }: InfoToastProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { animatedValue: translateY, panHandlers } = useSwipeDismiss({
    axis: "y",
    threshold: 30,
    onDismiss,
    positiveOnly: true,
    overshoot: 200,
    duration: 150,
  });

  useEffect(() => {
    const timer = setTimeout(onDismiss, TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: Math.max(insets.bottom, 16) + 16,
          transform: [{ translateY }],
        },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      accessibilityLabel={message}
      {...panHandlers}
    >
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

/** Creates styles based on the active color palette. */
function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    container: {
      position: "absolute",
      // bottom is applied dynamically via useSafeAreaInsets
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
  });
}
