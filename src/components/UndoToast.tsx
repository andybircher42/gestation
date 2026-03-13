import { useEffect, useMemo } from "react";
import { Animated, Pressable, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSwipeDismiss } from "@/hooks";
import { Entry } from "@/storage";
import { ColorTokens, useTheme } from "@/theme";
import { gestationalAgeFromDueDate } from "@/util";

interface UndoToastProps {
  entry: Entry;
  action?: string;
  onUndo: () => void;
  onDismiss: () => void;
  /** When true, skip absolute positioning (parent handles layout). */
  embedded?: boolean;
}

const TOAST_DURATION_MS = 5000;

/** Toast shown after deleting an entry, allowing the user to undo the deletion. */
export default function UndoToast({
  entry,
  action = "Removed",
  onUndo,
  onDismiss,
  embedded = false,
}: UndoToastProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { weeks, days } = gestationalAgeFromDueDate(entry.dueDate);
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
        !embedded && {
          position: "absolute",
          bottom: Math.max(insets.bottom, 16) + 16,
          left: 16,
          right: 16,
        },
        { transform: [{ translateY }] },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityLabel={`${action} ${entry.name}, ${weeks} weeks ${days} days`}
      testID="undo-toast"
      {...panHandlers}
    >
      <Text style={styles.message}>
        {action} {entry.name} ({weeks}w {days}d)
      </Text>
      <Pressable
        onPress={onUndo}
        style={styles.undoButton}
        accessibilityRole="button"
        accessibilityLabel={`Undo removing ${entry.name}`}
      >
        <Text style={styles.undoText}>Undo</Text>
      </Pressable>
    </Animated.View>
  );
}

/** Creates styles based on the active color palette. */
function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    container: {
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
    undoButton: {
      marginLeft: 12,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: colors.primary,
      borderRadius: 6,
    },
    undoText: {
      color: colors.white,
      fontSize: 14,
      fontWeight: "600",
    },
  });
}
