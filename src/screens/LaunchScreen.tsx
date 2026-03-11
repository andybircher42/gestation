import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

import { HipaaDisclaimer } from "@/components";
import {
  acceptAgreement,
  checkAgreement,
  checkOnboardingComplete,
} from "@/storage";

import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Launch">;

/**
 *
 */
export default function LaunchScreen({ navigation }: Props) {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function init() {
      const accepted = await checkAgreement().catch(() => false);
      if (!mounted) {return;}
      if (!accepted) {
        setShowDisclaimer(true);
      } else {
        setReady(true);
      }
    }
    init();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) {return;}
    const timer = setTimeout(async () => {
      const onboarded = await checkOnboardingComplete().catch(() => false);
      if (onboarded) {
        navigation.replace("Home");
      } else {
        navigation.replace("Onboarding");
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [ready, navigation]);

  const handleAccept = () => {
    acceptAgreement()
      .then(() => {
        setShowDisclaimer(false);
        setReady(true);
      })
      .catch((e) => console.error("Failed to save agreement", e));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>In Due Time</Text>
      <HipaaDisclaimer visible={showDisclaimer} onAccept={handleAccept} />
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
  },
  title: {
    fontFamily: "Fraunces-Bold",
    fontSize: 36,
    color: "#391b59",
  },
});
