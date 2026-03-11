import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Patient } from "@/storage";
import { formatDueDate, gestationalAgeFromDueDate } from "@/util";

import BirthstoneIcon from "./BirthstoneIcon";

interface PatientCardProps {
  patient: Patient;
  onPress?: (patient: Patient) => void;
  onLongPress?: (patient: Patient) => void;
}

/**
 *
 */
export default function PatientCard({
  patient,
  onPress,
  onLongPress,
}: PatientCardProps) {
  const ga = useMemo(
    () => gestationalAgeFromDueDate(patient.edd),
    [patient.edd],
  );
  const dueDateDisplay = useMemo(
    () => formatDueDate(patient.edd),
    [patient.edd],
  );

  return (
    <Pressable
      style={[styles.card, { backgroundColor: patient.birthstone.color }]}
      onPress={() => onPress?.(patient)}
      onLongPress={() => onLongPress?.(patient)}
      accessibilityRole="button"
      accessibilityLabel={`${patient.name}, ${ga.weeks} weeks ${ga.days} days`}
    >
      <View style={styles.gemContainer}>
        <BirthstoneIcon color="rgba(255,255,255,0.3)" size={36} />
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {patient.name}
      </Text>
      <Text style={styles.details}>
        {ga.weeks}w {ga.days}d · {dueDateDisplay}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 175,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    // shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  gemContainer: {
    marginBottom: 4,
  },
  name: {
    fontFamily: "DMSans-Bold",
    fontSize: 14,
    color: "#ffffff",
    textAlign: "center",
  },
  details: {
    fontFamily: "DMSans-Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
  },
});
