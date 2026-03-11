import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import * as Font from "expo-font";
import { StatusBar } from "expo-status-bar";

import AppNavigator from "@/navigation/AppNavigator";

/* eslint-disable @typescript-eslint/no-require-imports */
const FONTS = {
  "Fraunces-Bold": require("./assets/fonts/Fraunces-Bold.ttf") as string,
  "DMSans-Regular": require("./assets/fonts/DMSans-Regular.ttf") as string,
  "DMSans-Bold": require("./assets/fonts/DMSans-Bold.ttf") as string,
};
/* eslint-enable @typescript-eslint/no-require-imports */

if (!__DEV__) {
  void import("vexo-analytics").then(({ vexo }) =>
    vexo("5febe5d7-f01f-4716-ba33-d3c0b33794c8"),
  );
}

/**
 *
 */
export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync(FONTS);
      } catch (e) {
        console.warn(
          "Failed to load custom fonts, falling back to system fonts",
          e,
        );
      }
      setFontsLoaded(true);
    }
    void loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#391b59" />
        <StatusBar style="dark" />
      </View>
    );
  }

  return <AppNavigator />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: "#f0f1d6",
    justifyContent: "center",
    alignItems: "center",
  },
});
