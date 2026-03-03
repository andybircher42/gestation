import { useEffect, useMemo } from "react";
import { Animated, Pressable, StyleSheet, Text } from "react-native";

import useSwipeDismiss from "@/hooks/useSwipeDismiss";
import { Entry } from "@/storage";
import { ColorTokens } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeContext";
import { gestationalAgeFromDueDate } from "@/util/gestationalAge";

interface UndoToastProps {
  entry: Entry;
  onUndo: () => void;
  onDismiss: () => void;
}

const TOAST_DURATION_MS = 5000;

/** Toast shown after deleting an entry, allowing the user to undo the deletion. */
export default function UndoToast({
  entry,
  onUndo,
  onDismiss,
}: UndoToastProps) {
  const { colors } = useTheme();
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
      style={[styles.container, { transform: [{ translateY }] }]}
      accessibilityLabel="Undo toast"
      {...panHandlers}
    >
      <Text style={styles.message}>
        Deleted {entry.name} ({weeks}w {days}d)
      </Text>
      <Pressable
        onPress={onUndo}
        style={styles.undoButton}
        accessibilityRole="button"
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
