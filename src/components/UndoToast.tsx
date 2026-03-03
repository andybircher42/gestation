import { useEffect, useRef } from "react";
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";
import { Entry } from "../storage";

interface UndoToastProps {
  entry: Entry;
  onUndo: () => void;
  onDismiss: () => void;
}

const TOAST_DURATION_MS = 5000;

const SWIPE_THRESHOLD = 30;

/** Toast shown after deleting an entry, allowing the user to undo the deletion. */
export default function UndoToast({ entry, onUndo, onDismiss }: UndoToastProps) {
  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        gestureState.dy > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > SWIPE_THRESHOLD) {
          Animated.timing(translateY, {
            toValue: 200,
            duration: 150,
            useNativeDriver: true,
          }).start(onDismiss);
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  useEffect(() => {
    const timer = setTimeout(onDismiss, TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY }] }]}
      accessibilityLabel="Undo toast"
      {...panResponder.panHandlers}
    >
      <Text style={styles.message}>
        Deleted {entry.name} ({entry.weeks}w {entry.days}d)
      </Text>
      <Pressable onPress={onUndo} style={styles.undoButton} accessibilityRole="button">
        <Text style={styles.undoText}>Undo</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 32,
    left: 16,
    right: 16,
    backgroundColor: "#333",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  message: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
  },
  undoButton: {
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#4a90d9",
    borderRadius: 6,
  },
  undoText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
