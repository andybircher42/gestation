import { Pressable, StyleSheet, Text, View } from "react-native";
import { computeGestationalAge } from "../util/gestationalAge";
import { toISODateString } from "../util/dateUtils";
import { Entry } from "../storage";

interface DevToolbarProps {
  onSeedData: (entries: Entry[]) => void;
  onResetAgreement: () => void;
}

const FIRST_NAMES = [
  "Olivia", "Emma", "Ava", "Sophia", "Isabella",
  "Mia", "Charlotte", "Amelia", "Harper", "Evelyn",
  "Luna", "Camila", "Aria", "Scarlett", "Penelope",
  "Layla", "Chloe", "Victoria", "Madison", "Eleanor",
  "Grace", "Nora", "Riley", "Zoey", "Hannah",
  "Hazel", "Lily", "Ellie", "Violet", "Aurora",
];

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function generateSeedEntries(): Entry[] {
  const names = pickRandom(FIRST_NAMES, 10);
  const today = new Date();
  return names.map((name, i) => {
    // Base: ~12 days apart, with ±5 days of random jitter
    const jitter = Math.floor(Math.random() * 11) - 5;
    const dueDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + i * 12 + jitter,
    );
    const { weeks, days } = computeGestationalAge(dueDate, today);
    return {
      id: (Date.now() + i).toString(),
      name,
      weeks,
      days,
      dueDate: toISODateString(dueDate),
    };
  });
}

export default function DevToolbar({
  onSeedData,
  onResetAgreement,
}: DevToolbarProps) {
  return (
    <View style={styles.devRow}>
      <Pressable
        onPress={() => onSeedData(generateSeedEntries())}
        style={styles.devButton}
      >
        <Text style={styles.devButtonText}>Seed Data</Text>
      </Pressable>
      <Pressable onPress={onResetAgreement} style={styles.devButton}>
        <Text style={styles.devButtonText}>Reset HIPAA</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  devRow: {
    flexDirection: "row",
    gap: 8,
    position: "absolute",
    right: 20,
    bottom: 16,
  },
  devButton: {
    backgroundColor: "#ff6b6b",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  devButtonText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
});
