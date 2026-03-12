import { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { setOnboardingComplete } from "@/storage";
import { ColorTokens, useTheme } from "@/theme";
import { lineHeight } from "@/util";

interface OnboardingOverlayProps {
  visible: boolean;
  onComplete: () => void;
}

const LINES = [
  "You'll support dozens of families this year.",
  "Each one trusting you to remember the details.",
  "In Due Time keeps track,",
  "so you can focus on care.",
];

const LINE_DELAY = 1200;

/** Full-screen onboarding overlay with sequentially animated text lines. */
export default function OnboardingOverlay({
  visible,
  onComplete,
}: OnboardingOverlayProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const opacities = useRef(LINES.map(() => new Animated.Value(0))).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      // Reset animations when hidden
      opacities.forEach((o) => o.setValue(0));
      buttonOpacity.setValue(0);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    LINES.forEach((_, index) => {
      timers.push(
        setTimeout(
          () => {
            Animated.timing(opacities[index], {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }).start();
          },
          (index + 1) * LINE_DELAY,
        ),
      );
    });

    timers.push(
      setTimeout(
        () => {
          Animated.timing(buttonOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start();
        },
        (LINES.length + 1) * LINE_DELAY,
      ),
    );

    return () => timers.forEach(clearTimeout);
  }, [visible, opacities, buttonOpacity]);

  const handleGetStarted = () => {
    setOnboardingComplete().catch(() => {});
    onComplete();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.container}>
        <View style={styles.textContainer}>
          {LINES.map((line, index) => (
            <Animated.Text
              key={index}
              style={[styles.line, { opacity: opacities[index] }]}
            >
              {line}
            </Animated.Text>
          ))}
        </View>
        <Animated.View
          style={[styles.buttonContainer, { opacity: buttonOpacity }]}
        >
          <Pressable
            style={styles.button}
            onPress={handleGetStarted}
            accessibilityRole="button"
            accessibilityLabel="Get started"
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

/** Creates styles based on the active color palette. */
function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.contentBackground,
      justifyContent: "center",
      alignItems: "center",
      padding: 32,
    },
    textContainer: {
      alignItems: "center",
      gap: 16,
    },
    line: {
      fontSize: 20,
      color: colors.textPrimary,
      textAlign: "center",
      lineHeight: lineHeight(28),
    },
    buttonContainer: {
      marginTop: 48,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingHorizontal: 48,
      paddingVertical: 16,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.white,
    },
  });
}
