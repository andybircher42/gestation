import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { calendarHeatMap } from "@/engine/probabilityEngine";
import { Entry } from "@/storage";
import { ColorTokens, useTheme } from "@/theme";
import { lineHeight } from "@/util";

import CalendarMonth, { DayCell } from "./CalendarMonth";
import HelpButton from "./HelpButton";

interface CalendarViewProps {
  entries: Entry[];
  onDayPress?: (date: string, dueEntries: Entry[]) => void;
}

/** Displays an 11-month calendar heat map showing delivery probability across all entries. */
export default function CalendarView({
  entries,
  onDayPress,
}: CalendarViewProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const today = useMemo(() => new Date(), []);

  const activeEntries = useMemo(
    () => entries.filter((e) => !e.deliveredAt),
    [entries],
  );

  // Build a map of ISO date -> active entries with that dueDate
  const dueDateMap = useMemo(() => {
    const map = new Map<string, Entry[]>();
    for (const e of activeEntries) {
      const existing = map.get(e.dueDate);
      if (existing) {
        existing.push(e);
      } else {
        map.set(e.dueDate, [e]);
      }
    }
    return map;
  }, [activeEntries]);

  // Build a map of ISO date -> delivered entries (keyed by delivery date)
  const deliveredDateMap = useMemo(() => {
    const map = new Map<string, Entry[]>();
    for (const e of entries) {
      if (!e.deliveredAt) {
        continue;
      }
      const d = new Date(e.deliveredAt);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const existing = map.get(iso);
      if (existing) {
        existing.push(e);
      } else {
        map.set(iso, [e]);
      }
    }
    return map;
  }, [entries]);

  // Show current month + next 10 months
  const months = useMemo(() => {
    const result: { year: number; month: number; cells: DayCell[] }[] = [];

    for (let offset = 0; offset < 11; offset++) {
      const date = new Date(today.getFullYear(), today.getMonth() + offset, 1);
      const year = date.getFullYear();
      const month = date.getMonth();
      const lastDay = new Date(year, month + 1, 0).getDate();

      const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      const heatMap = calendarHeatMap(
        activeEntries,
        startDate,
        endDate,
        todayStr,
        colors.primary,
      );

      const cells: DayCell[] = heatMap.map((entry) => {
        const dayNum = parseInt(entry.date.split("-")[2], 10);
        return {
          date: entry.date,
          day: dayNum,
          color: entry.color,
          load: entry.load,
          dueEntries: dueDateMap.get(entry.date) ?? [],
          deliveredEntries: deliveredDateMap.get(entry.date) ?? [],
        };
      });

      result.push({ year, month, cells });
    }

    return result;
  }, [activeEntries, today, dueDateMap, deliveredDateMap, colors.primary]);

  if (entries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="calendar-outline"
          size={48}
          color={colors.textTertiary}
        />
        <Text style={styles.emptyTitle}>No one to show yet</Text>
        <Text style={styles.emptySubtitle}>
          Add someone in the Expecting tab to see when they're due
        </Text>
      </View>
    );
  }

  const primaryHex = colors.primary;
  const gradientStart = "transparent";
  const gradientEnd = `${primaryHex}66`; // ~40% opacity

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.content}
    >
      <View
        style={styles.legend}
        accessibilityLabel="Heat map legend: color intensity shows how many are due"
      >
        <Text style={styles.legendLabel}>fewer</Text>
        <LinearGradient
          colors={[gradientStart, gradientEnd]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.legendBar}
        />
        <Text style={styles.legendLabel}>more due</Text>
        <HelpButton
          title="Calendar colors"
          message="Darker colors mean a higher chance of delivery on that day — even if it's not the due date. The shading is based on how likely each day is across all the pregnancies you're tracking."
          size={16}
        />
      </View>
      {months.map(({ year, month, cells }) => (
        <CalendarMonth
          key={`${year}-${month}`}
          year={year}
          month={month}
          dayCells={cells}
          onDayPress={onDayPress}
        />
      ))}
    </ScrollView>
  );
}

/** Creates styles based on the active color palette. */
function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    scrollView: {
      flex: 1,
    },
    content: {
      paddingVertical: 16,
      paddingHorizontal: 16,
    },
    legend: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginBottom: 12,
    },
    legendBar: {
      height: 8,
      width: 80,
      borderRadius: 4,
    },
    legendLabel: {
      fontSize: 11,
      color: colors.textTertiary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 32,
      gap: 8,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.textTertiary,
      textAlign: "center",
      lineHeight: lineHeight(20),
    },
  });
}
