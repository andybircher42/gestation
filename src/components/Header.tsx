import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface HeaderProps {
  patientCount: number;
}

/**
 *
 */
export default function Header({ patientCount }: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <Text style={styles.title}>In Due Time</Text>
      <Text style={styles.subtitle}>
        Supporting <Text style={styles.count}>{patientCount}</Text>{" "}
        {patientCount === 1 ? "patient" : "patients"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#391b59",
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingBottom: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  title: {
    fontFamily: "Fraunces-Bold",
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "700",
  },
  subtitle: {
    fontFamily: "DMSans-Regular",
    fontSize: 14,
    color: "#ffffff",
  },
  count: {
    fontFamily: "DMSans-Bold",
    fontWeight: "900",
  },
});
