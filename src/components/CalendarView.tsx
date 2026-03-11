import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { calendarHeatMap, Patient } from "@/engine/probabilityEngine";

import CalendarMonth, { DayCell } from "./CalendarMonth";

interface CalendarViewProps {
  patients: Patient[];
}

/**
 *
 */
export default function CalendarView({ patients }: CalendarViewProps) {
  const today = useMemo(() => new Date(), []);

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

      const heatMap = calendarHeatMap(patients, startDate, endDate, todayStr);

      const cells: DayCell[] = heatMap.map((entry) => {
        const dayNum = parseInt(entry.date.split("-")[2], 10);
        return {
          date: entry.date,
          day: dayNum,
          color: entry.color,
          load: entry.load,
        };
      });

      result.push({ year, month, cells });
    }

    return result;
  }, [patients, today]);

  if (patients.length === 0) {
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

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    paddingVertical: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontFamily: "DMSans-Regular",
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
});
