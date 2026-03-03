import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Entry } from "@/storage";
import { ColorTokens, useTheme } from "@/theme";
import { toISODateString } from "@/util";

interface DevToolbarProps {
  onSeedData: (entries: Entry[]) => void;
  onResetAgreement: () => void;
}

const FIRST_NAMES = [
  "Olivia",
  "Emma",
  "Ava",
  "Sophia",
  "Isabella",
  "Mia",
  "Charlotte",
  "Amelia",
  "Harper",
  "Evelyn",
  "Luna",
  "Camila",
  "Aria",
  "Scarlett",
  "Penelope",
  "Layla",
  "Chloe",
  "Victoria",
  "Madison",
  "Eleanor",
  "Grace",
  "Nora",
  "Riley",
  "Zoey",
  "Hannah",
  "Hazel",
  "Lily",
  "Ellie",
  "Violet",
  "Aurora",
];

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/** Generates 10 randomized seed entries with due dates spread across ~4 months. */
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
    return {
      id: `${Date.now()}-seed-${i}`,
      name,
      dueDate: toISODateString(dueDate),
    };
  });
}

/** Dev-only toolbar with Seed Data and Reset HIPAA buttons. */
export default function DevToolbar({
  onSeedData,
  onResetAgreement,
}: DevToolbarProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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

/** Creates styles based on the active color palette. */
function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    devRow: {
      flexDirection: "row",
      gap: 8,
      position: "absolute",
      right: 20,
      bottom: -20,
      zIndex: 10,
    },
    devButton: {
      backgroundColor: colors.devButton,
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    devButtonText: {
      color: colors.white,
      fontSize: 11,
      fontWeight: "600",
    },
  });
}
