import { useMemo } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Entry } from "@/storage";
import { ColorTokens, useTheme } from "@/theme";
import { toISODateString } from "@/util";
import { getBirthstoneForDate } from "@/util/birthstones";

interface DevToolbarProps {
  visible: boolean;
  onSeedData: (entries: Entry[]) => void;
  onResetAgreement: () => void;
  onClose: () => void;
  anchor?: { top: number; right: number };
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
    const dueDateStr = toISODateString(dueDate);
    return {
      id: `${Date.now()}-seed-${i}`,
      name,
      dueDate: dueDateStr,
      createdAt: Date.now() + i,
      birthstone: getBirthstoneForDate(dueDateStr),
    };
  });
}

/** Generates 5 randomized entries with due dates and deliveredAt timestamps. */
export function generateSeedDeliveries(): Entry[] {
  const names = pickRandom(FIRST_NAMES, 5);
  const today = new Date();
  const now = Date.now();
  return names.map((name, i) => {
    // Due dates spread across -2 weeks to +2 weeks from today
    const dueDayOffset = Math.floor(Math.random() * 29) - 14;
    const dueDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + dueDayOffset,
    );
    // Delivered within ±5 days of the due date
    const deliveryOffset = Math.floor(Math.random() * 11) - 5;
    const deliveredDate = new Date(
      dueDate.getFullYear(),
      dueDate.getMonth(),
      dueDate.getDate() + deliveryOffset,
    );
    const dueDateStr = toISODateString(dueDate);
    return {
      id: `${now}-seed-del-${i}`,
      name,
      dueDate: dueDateStr,
      createdAt: now + i,
      deliveredAt: deliveredDate.getTime(),
      birthstone: getBirthstoneForDate(dueDateStr),
    };
  });
}

/** Dev-only dropdown with Seed Data and Reset HIPAA actions. */
export default function DevToolbar({
  visible,
  onSeedData,
  onResetAgreement,
  onClose,
  anchor,
}: DevToolbarProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const dropdownPosition = anchor ?? { top: 100, right: 12 };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.container}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close dev tools"
        />
        <View style={[styles.dropdown, dropdownPosition]}>
          <Text style={styles.title}>Dev Tools</Text>
          <Pressable
            style={styles.row}
            onPress={() => {
              onSeedData(generateSeedEntries());
              onClose();
            }}
            accessibilityRole="button"
            accessibilityLabel="Seed sample data"
          >
            <Ionicons
              name="flask-outline"
              size={20}
              color={colors.textPrimary}
              style={styles.rowIcon}
            />
            <Text style={styles.rowLabel}>Seed Data</Text>
          </Pressable>
          <Pressable
            style={styles.row}
            onPress={() => {
              onSeedData(generateSeedDeliveries());
              onClose();
            }}
            accessibilityRole="button"
            accessibilityLabel="Seed delivered entries"
          >
            <Ionicons
              name="heart-outline"
              size={20}
              color={colors.textPrimary}
              style={styles.rowIcon}
            />
            <Text style={styles.rowLabel}>Seed Deliveries</Text>
          </Pressable>
          <Pressable
            style={styles.row}
            onPress={() => {
              onResetAgreement();
              onClose();
            }}
            accessibilityRole="button"
            accessibilityLabel="Reset HIPAA agreement"
          >
            <Ionicons
              name="refresh-outline"
              size={20}
              color={colors.textPrimary}
              style={styles.rowIcon}
            />
            <Text style={styles.rowLabel}>Reset HIPAA</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

/** Creates styles based on the active color palette. */
function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    dropdown: {
      position: "absolute",
      backgroundColor: colors.contentBackground,
      borderRadius: 12,
      paddingVertical: 8,
      paddingHorizontal: 16,
      minWidth: 180,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    title: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textTertiary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginTop: 4,
      marginBottom: 4,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 44,
    },
    rowIcon: {
      marginRight: 12,
    },
    rowLabel: {
      flex: 1,
      fontSize: 15,
      color: colors.textPrimary,
    },
  });
}
