import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { calendarHeatMap } from "@/engine/probabilityEngine";
import { Entry } from "@/storage";
import { ColorTokens, useTheme } from "@/theme";

import CalendarMonth, { DayCell } from "./CalendarMonth";

interface CalendarViewProps {
  entries: Entry[];
}

/** Displays an 11-month calendar heat map showing delivery probability across all entries. */
export default function CalendarView({ entries }: CalendarViewProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const today = useMemo(() => new Date(), []);

  // Build a map of ISO date -> entries with that dueDate
  const dueDateMap = useMemo(() => {
    const map = new Map<string, Entry[]>();
    for (const e of entries) {
      const existing = map.get(e.dueDate);
      if (existing) {
        existing.push(e);
      } else {
        map.set(e.dueDate, [e]);
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

      const heatMap = calendarHeatMap(entries, startDate, endDate, todayStr);

      const cells: DayCell[] = heatMap.map((entry) => {
        const dayNum = parseInt(entry.date.split("-")[2], 10);
        return {
          date: entry.date,
          day: dayNum,
          color: entry.color,
          load: entry.load,
          dueEntries: dueDateMap.get(entry.date) ?? [],
        };
      });

      result.push({ year, month, cells });
    }

    return result;
  }, [entries, today, dueDateMap]);

  if (entries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Add patients to see delivery{"\n"}probability on the calendar
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.content}
    >
      {months.map(({ year, month, cells }) => (
        <CalendarMonth
          key={`${year}-${month}`}
          year={year}
          month={month}
          dayCells={cells}
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
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 32,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textTertiary,
      textAlign: "center",
      lineHeight: 24,
    },
  });
}
