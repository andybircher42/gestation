import { StyleSheet, Text, View } from "react-native";

interface HeaderProps {
  patientCount: number;
}

/**
 *
 */
export default function Header({ patientCount }: HeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>In Due Time</Text>
      <Text style={styles.subtitle}>
        Supporting {patientCount} {patientCount === 1 ? "patient" : "patients"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#391b59",
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontFamily: "Fraunces-Bold",
    fontSize: 20,
    color: "#ffffff",
  },
  subtitle: {
    fontFamily: "DMSans-Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
});
