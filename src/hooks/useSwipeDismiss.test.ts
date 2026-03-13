import {
  Animated,
  GestureResponderEvent,
  PanResponder,
  PanResponderGestureState,
} from "react-native";
import { act, renderHook } from "@testing-library/react-native";
import * as Haptics from "expo-haptics";

import useSwipeDismiss from "./useSwipeDismiss";

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: "light", Medium: "medium", Heavy: "heavy" },
}));

type PanCallbacks = Parameters<typeof PanResponder.create>[0];

let captured: PanCallbacks;
const originalCreate = PanResponder.create;

beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(PanResponder, "create").mockImplementation((config) => {
    captured = config;
    return originalCreate(config);
  });
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

const event = {} as GestureResponderEvent;

/** Creates a minimal gesture state object with optional velocity. */
function gs(dx: number, dy: number, vx = 0, vy = 0) {
  return { dx, dy, vx, vy } as PanResponderGestureState;
}

describe("useSwipeDismiss", () => {
  it("returns an Animated.Value and panHandlers", () => {
    const { result } = renderHook(() =>
      useSwipeDismiss({ axis: "x", threshold: 100, onDismiss: jest.fn() }),
    );

    expect(result.current.animatedValue).toBeInstanceOf(Animated.Value);
    expect(result.current.panHandlers).toBeDefined();
  });

  describe("onMoveShouldSetPanResponder", () => {
    it("returns false for small x-axis movements", () => {
      renderHook(() =>
        useSwipeDismiss({ axis: "x", threshold: 100, onDismiss: jest.fn() }),
      );

      expect(captured.onMoveShouldSetPanResponder!(event, gs(2, 0))).toBe(
        false,
      );
    });

    it("returns true for x-axis movements above 5px", () => {
      renderHook(() =>
        useSwipeDismiss({ axis: "x", threshold: 100, onDismiss: jest.fn() }),
      );

      expect(captured.onMoveShouldSetPanResponder!(event, gs(10, 0))).toBe(
        true,
      );
      expect(captured.onMoveShouldSetPanResponder!(event, gs(-10, 0))).toBe(
        true,
      );
    });

    it("returns true for y-axis movements above 5px", () => {
      renderHook(() =>
        useSwipeDismiss({ axis: "y", threshold: 30, onDismiss: jest.fn() }),
      );

      expect(captured.onMoveShouldSetPanResponder!(event, gs(0, 10))).toBe(
        true,
      );
      expect(captured.onMoveShouldSetPanResponder!(event, gs(0, -10))).toBe(
        true,
      );
    });

    it("only accepts positive direction when positiveOnly is true", () => {
      renderHook(() =>
        useSwipeDismiss({
          axis: "y",
          threshold: 30,
          onDismiss: jest.fn(),
          positiveOnly: true,
        }),
      );

      expect(captured.onMoveShouldSetPanResponder!(event, gs(0, 10))).toBe(
        true,
      );
      expect(captured.onMoveShouldSetPanResponder!(event, gs(0, -10))).toBe(
        false,
      );
    });
  });

  describe("onPanResponderMove", () => {
    it("updates animated value on x-axis move", () => {
      const { result } = renderHook(() =>
        useSwipeDismiss({ axis: "x", threshold: 100, onDismiss: jest.fn() }),
      );

      act(() => {
        captured.onPanResponderMove!(event, gs(50, 0));
      });

      const value = (
        result.current.animatedValue as unknown as { _value: number }
      )._value;
      expect(value).toBe(50);
    });

    it("updates animated value on y-axis move", () => {
      const { result } = renderHook(() =>
        useSwipeDismiss({ axis: "y", threshold: 30, onDismiss: jest.fn() }),
      );

      act(() => {
        captured.onPanResponderMove!(event, gs(0, 25));
      });

      const value = (
        result.current.animatedValue as unknown as { _value: number }
      )._value;
      expect(value).toBe(25);
    });

    it("ignores negative movement when positiveOnly is true", () => {
      const { result } = renderHook(() =>
        useSwipeDismiss({
          axis: "y",
          threshold: 30,
          onDismiss: jest.fn(),
          positiveOnly: true,
        }),
      );

      act(() => {
        captured.onPanResponderMove!(event, gs(0, -20));
      });

      const value = (
        result.current.animatedValue as unknown as { _value: number }
      )._value;
      expect(value).toBe(0);
    });
  });

  describe("onPanResponderRelease", () => {
    it("calls onDismiss when swiped right past threshold", () => {
      const onDismiss = jest.fn();
      renderHook(() =>
        useSwipeDismiss({ axis: "x", threshold: 100, onDismiss }),
      );

      act(() => {
        captured.onPanResponderRelease!(event, gs(150, 0));
        jest.advanceTimersByTime(300);
      });

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it("calls onDismiss when swiped left past threshold", () => {
      const onDismiss = jest.fn();
      renderHook(() =>
        useSwipeDismiss({ axis: "x", threshold: 100, onDismiss }),
      );

      act(() => {
        captured.onPanResponderRelease!(event, gs(-150, 0));
        jest.advanceTimersByTime(300);
      });

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it("does not call onDismiss when swipe is below threshold", () => {
      const onDismiss = jest.fn();
      renderHook(() =>
        useSwipeDismiss({ axis: "x", threshold: 100, onDismiss }),
      );

      act(() => {
        captured.onPanResponderRelease!(event, gs(50, 0));
        jest.advanceTimersByTime(300);
      });

      expect(onDismiss).not.toHaveBeenCalled();
    });

    it("does not call onDismiss and starts spring back when below threshold", () => {
      const onDismiss = jest.fn();
      const springSpy = jest.spyOn(Animated, "spring");
      renderHook(() =>
        useSwipeDismiss({ axis: "x", threshold: 100, onDismiss }),
      );

      act(() => {
        captured.onPanResponderMove!(event, gs(50, 0));
        captured.onPanResponderRelease!(event, gs(50, 0));
      });

      expect(onDismiss).not.toHaveBeenCalled();
      expect(springSpy).toHaveBeenCalledWith(
        expect.any(Animated.Value),
        expect.objectContaining({ toValue: 0 }),
      );
    });

    it("calls onDismiss on y-axis with positiveOnly and custom overshoot/duration", () => {
      const onDismiss = jest.fn();
      renderHook(() =>
        useSwipeDismiss({
          axis: "y",
          threshold: 30,
          onDismiss,
          positiveOnly: true,
          overshoot: 200,
          duration: 150,
        }),
      );

      act(() => {
        captured.onPanResponderRelease!(event, gs(0, 50));
        jest.advanceTimersByTime(200);
      });

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it("does not dismiss for negative swipe when positiveOnly is true", () => {
      const onDismiss = jest.fn();
      renderHook(() =>
        useSwipeDismiss({
          axis: "y",
          threshold: 30,
          onDismiss,
          positiveOnly: true,
        }),
      );

      act(() => {
        captured.onPanResponderRelease!(event, gs(0, -50));
        jest.advanceTimersByTime(300);
      });

      expect(onDismiss).not.toHaveBeenCalled();
    });

    it("dismisses on fast flick even below distance threshold", () => {
      const onDismiss = jest.fn();
      renderHook(() =>
        useSwipeDismiss({ axis: "x", threshold: 100, onDismiss }),
      );

      act(() => {
        // 50px distance (below 100 threshold) but fast velocity
        captured.onPanResponderRelease!(event, gs(-50, 0, -1.5, 0));
        jest.advanceTimersByTime(300);
      });

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it("does not dismiss on slow flick below threshold", () => {
      const onDismiss = jest.fn();
      renderHook(() =>
        useSwipeDismiss({ axis: "x", threshold: 100, onDismiss }),
      );

      act(() => {
        // 50px distance, slow velocity
        captured.onPanResponderRelease!(event, gs(50, 0, 0.1, 0));
        jest.advanceTimersByTime(300);
      });

      expect(onDismiss).not.toHaveBeenCalled();
    });

    it("does not dismiss on fast flick with very small distance", () => {
      const onDismiss = jest.fn();
      renderHook(() =>
        useSwipeDismiss({ axis: "x", threshold: 100, onDismiss }),
      );

      act(() => {
        // Only 10px distance (below 30px minimum for flick)
        captured.onPanResponderRelease!(event, gs(10, 0, 2, 0));
        jest.advanceTimersByTime(300);
      });

      expect(onDismiss).not.toHaveBeenCalled();
    });

    it("calls onDismissPositive on fast right flick", () => {
      const onDismiss = jest.fn();
      const onDismissPositive = jest.fn();
      renderHook(() =>
        useSwipeDismiss({
          axis: "x",
          threshold: 100,
          onDismiss,
          onDismissPositive,
        }),
      );

      act(() => {
        captured.onPanResponderRelease!(event, gs(50, 0, 1.5, 0));
        jest.advanceTimersByTime(300);
      });

      expect(onDismissPositive).toHaveBeenCalledTimes(1);
      expect(onDismiss).not.toHaveBeenCalled();
    });
  });

  describe("haptic feedback", () => {
    it("triggers haptic when crossing threshold during move", () => {
      renderHook(() =>
        useSwipeDismiss({ axis: "x", threshold: 100, onDismiss: jest.fn() }),
      );

      act(() => {
        captured.onPanResponderMove!(event, gs(50, 0));
      });
      expect(Haptics.impactAsync).not.toHaveBeenCalled();

      act(() => {
        captured.onPanResponderMove!(event, gs(110, 0));
      });
      expect(Haptics.impactAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe("onPanResponderTerminate", () => {
    it("springs back to zero when gesture is terminated by iOS", () => {
      const springSpy = jest.spyOn(Animated, "spring");
      renderHook(() =>
        useSwipeDismiss({ axis: "x", threshold: 100, onDismiss: jest.fn() }),
      );

      act(() => {
        captured.onPanResponderMove!(event, gs(60, 0));
        captured.onPanResponderTerminate!(event, gs(60, 0));
      });

      expect(springSpy).toHaveBeenCalledWith(
        expect.any(Animated.Value),
        expect.objectContaining({ toValue: 0 }),
      );
    });

    it("does not call onDismiss when terminated", () => {
      const onDismiss = jest.fn();
      renderHook(() =>
        useSwipeDismiss({ axis: "x", threshold: 100, onDismiss }),
      );

      act(() => {
        captured.onPanResponderMove!(event, gs(150, 0));
        captured.onPanResponderTerminate!(event, gs(150, 0));
        jest.advanceTimersByTime(300);
      });

      expect(onDismiss).not.toHaveBeenCalled();
    });
  });

  it("rejects termination requests (onPanResponderTerminationRequest)", () => {
    renderHook(() =>
      useSwipeDismiss({ axis: "x", threshold: 100, onDismiss: jest.fn() }),
    );

    expect(captured.onPanResponderTerminationRequest!(event, gs(50, 0))).toBe(
      false,
    );
  });

  it("uses latest onDismiss callback via ref", () => {
    const onDismiss1 = jest.fn();
    const onDismiss2 = jest.fn();
    const { rerender } = renderHook(
      ({ onDismiss }: { onDismiss: () => void }) =>
        useSwipeDismiss({ axis: "x", threshold: 100, onDismiss }),
      { initialProps: { onDismiss: onDismiss1 } },
    );

    rerender({ onDismiss: onDismiss2 });

    act(() => {
      captured.onPanResponderRelease!(event, gs(150, 0));
      jest.advanceTimersByTime(300);
    });

    expect(onDismiss1).not.toHaveBeenCalled();
    expect(onDismiss2).toHaveBeenCalledTimes(1);
  });

  it("does not claim responder on tap (onStartShouldSetPanResponder)", () => {
    renderHook(() =>
      useSwipeDismiss({ axis: "x", threshold: 100, onDismiss: jest.fn() }),
    );

    expect(captured.onStartShouldSetPanResponder!(event, gs(0, 0))).toBe(false);
  });
});
