import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

import { setOnboardingComplete } from "@/storage";

import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Onboarding">;

const LINES = [
  "You'll support dozens of families this year.",
  "Each one trusting you to remember the details.",
  "In Due Time keeps track,",
  "so you can focus on care.",
];

const LINE_DELAY = 1200; // ms between each line appearing

/**
 *
 */
export default function OnboardingScreen({ navigation }: Props) {
  const [showButton, setShowButton] = useState(false);
  const opacities = useRef(LINES.map(() => new Animated.Value(0))).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Reveal lines one by one
    LINES.forEach((_, index) => {
      setTimeout(
        () => {
          Animated.timing(opacities[index], {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }).start();
        },
        (index + 1) * LINE_DELAY,
      );
    });

    // Show button after all lines
    setTimeout(
      () => {
        setShowButton(true);
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      },
      (LINES.length + 1) * LINE_DELAY,
    );
  }, [opacities, buttonOpacity]);

  const handleGetStarted = async () => {
    await setOnboardingComplete().catch(() => {});
    navigation.replace("Home");
  };

  return (
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
      {showButton && (
        <Animated.View
          style={[styles.buttonContainer, { opacity: buttonOpacity }]}
        >
          <Pressable style={styles.button} onPress={handleGetStarted}>
            <Text style={styles.buttonText}>Get Started</Text>
          </Pressable>
        </Animated.View>
      )}
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f1d6",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  textContainer: {
    alignItems: "center",
    gap: 16,
  },
  line: {
    fontFamily: "DMSans-Regular",
    fontSize: 20,
    color: "#391b59",
    textAlign: "center",
    lineHeight: 28,
  },
  buttonContainer: {
    marginTop: 48,
  },
  button: {
    backgroundColor: "#391b59",
    borderRadius: 16,
    paddingHorizontal: 48,
    paddingVertical: 16,
  },
  buttonText: {
    fontFamily: "DMSans-Bold",
    fontSize: 16,
    color: "#ffffff",
  },
});
