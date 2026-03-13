import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ToastStackProps {
  children: ReactNode;
}

/** Renders toast children stacked from the bottom of the screen with spacing. */
export default function ToastStack({ children }: ToastStackProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.container, { bottom: Math.max(insets.bottom, 16) + 16 }]}
      pointerEvents="box-none"
      testID="toast-stack"
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    gap: 8,
  },
});
