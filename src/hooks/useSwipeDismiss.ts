import { useRef } from "react";
import { Animated, PanResponder } from "react-native";

interface UseSwipeDismissOptions {
  /** Swipe axis: "x" for horizontal, "y" for vertical. */
  axis: "x" | "y";
  /** Minimum distance (in pixels) the user must swipe to trigger dismissal. */
  threshold: number;
  /** Callback invoked after the dismiss animation completes. */
  onDismiss: () => void;
  /** Optional callback for positive-direction dismiss (right for x, down for y). When set, onDismiss handles negative only. */
  onDismissPositive?: () => void;
  /** If true, only positive-direction swipes (right for x, down for y) trigger dismissal. */
  positiveOnly?: boolean;
  /** Distance to animate past the threshold on dismissal (default 500). */
  overshoot?: number;
  /** Duration of the dismiss animation in milliseconds (default 200). */
  duration?: number;
}

/**
 * Shared swipe-to-dismiss logic backed by a PanResponder.
 * Returns an Animated.Value and panHandlers to spread onto an Animated.View.
 */
export default function useSwipeDismiss({
  axis,
  threshold,
  onDismiss,
  onDismissPositive,
  positiveOnly = false,
  overshoot = 500,
  duration = 200,
}: UseSwipeDismissOptions) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;
  const onDismissPositiveRef = useRef(onDismissPositive);
  onDismissPositiveRef.current = onDismissPositive;

  const isX = axis === "x";
  const delta = (gs: { dx: number; dy: number }) => (isX ? gs.dx : gs.dy);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) =>
        positiveOnly ? delta(gs) > 5 : Math.abs(delta(gs)) > 5,
      onPanResponderMove: (_, gs) => {
        const d = delta(gs);
        if (positiveOnly && d < 0) {
          return;
        }
        animatedValue.setValue(d);
      },
      onPanResponderRelease: (_, gs) => {
        const d = delta(gs);
        const dismissed = positiveOnly
          ? d > threshold
          : Math.abs(d) > threshold;

        if (dismissed) {
          const direction = positiveOnly ? 1 : d > 0 ? 1 : -1;
          Animated.timing(animatedValue, {
            toValue: direction * overshoot,
            duration,
            useNativeDriver: true,
          }).start(() => {
            if (d > 0 && onDismissPositiveRef.current) {
              onDismissPositiveRef.current();
            } else {
              onDismissRef.current();
            }
          });
        } else {
          Animated.spring(animatedValue, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  return { animatedValue, panHandlers: panResponder.panHandlers };
}
