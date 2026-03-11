import { useMemo, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Patient } from "@/storage";
import { formatDueDate, getBirthstoneImage } from "@/util";

import BirthstoneIcon from "./BirthstoneIcon";

export interface TileOrigin {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PatientCardProps {
  patient: Patient;
  onPress?: (patient: Patient, origin: TileOrigin) => void;
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
  const cardRef = useRef<View>(null);
  const dueDateDisplay = useMemo(
    () => formatDueDate(patient.edd),
    [patient.edd],
  );

  const handlePress = () => {
    if (!onPress) {
      return;
    }
    cardRef.current?.measureInWindow((x, y, width, height) => {
      onPress(patient, { x, y, width, height });
    });
  };

  return (
    <Pressable
      ref={cardRef}
      style={[styles.card, { backgroundColor: patient.birthstone.color }]}
      onPress={handlePress}
      onLongPress={() => onLongPress?.(patient)}
      accessibilityRole="button"
      accessibilityLabel={`${patient.name}`}
    >
      <View style={styles.inner}>
        <BirthstoneIcon
          image={getBirthstoneImage(patient.birthstone.name)}
          size={64}
        />
        <View style={styles.textGroup}>
          <Text style={styles.name} numberOfLines={1}>
            {patient.name}&rsquo;s Baby
          </Text>
          <Text style={styles.details}>{dueDateDisplay}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 175,
    aspectRatio: 1,
    borderRadius: 12,
    padding: 27,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  inner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  textGroup: {
    alignItems: "center",
    gap: 4,
    width: "100%",
  },
  name: {
    fontFamily: "Fraunces-Bold",
    fontSize: 18,
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
