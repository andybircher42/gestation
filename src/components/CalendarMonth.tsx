import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

export interface DayCell {
  date: string; // ISO YYYY-MM-DD
  day: number; // day of month (1-31)
  color: string; // heat map color
  load: number; // numeric probability load
}

interface CalendarMonthProps {
  year: number;
  month: number; // 0-indexed (JS Date style)
  dayCells: DayCell[]; // cells with color data
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 *
 */
export default function CalendarMonth({
  year,
  month,
  dayCells,
}: CalendarMonthProps) {
  // Build a grid: figure out what day of week the 1st falls on,
  // create empty cells for padding, then fill in day cells
  const grid = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Map date string -> cell data
    const cellMap = new Map<number, DayCell>();
    for (const cell of dayCells) {
      cellMap.set(cell.day, cell);
    }

    const rows: (DayCell | null)[][] = [];
    let currentRow: (DayCell | null)[] = [];

    // Pad start
    for (let i = 0; i < firstDay; i++) {
      currentRow.push(null);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const cell = cellMap.get(d) ?? {
        date: "",
        day: d,
        color: "#F0F4F8",
        load: 0,
      };
      currentRow.push(cell);
      if (currentRow.length === 7) {
        rows.push(currentRow);
        currentRow = [];
      }
    }

    // Pad end
    if (currentRow.length > 0) {
      while (currentRow.length < 7) {
        currentRow.push(null);
      }
      rows.push(currentRow);
    }

    return rows;
  }, [year, month, dayCells]);

  return (
    <View style={styles.container}>
      <Text style={styles.monthTitle}>
        {MONTH_NAMES[month]} {year}
      </Text>
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((d) => (
          <Text key={d} style={styles.weekdayLabel}>
            {d}
          </Text>
        ))}
      </View>
      {grid.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.weekRow}>
          {row.map((cell, cellIndex) => (
            <View
              key={cellIndex}
              style={[
                styles.dayCell,
                { backgroundColor: cell ? cell.color : "transparent" },
              ]}
            >
              {cell && (
                <Text
                  style={[
                    styles.dayText,
                    cell.load > 0.05 && styles.dayTextHighContrast,
                  ]}
                >
                  {cell.day}
                </Text>
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  monthTitle: {
    fontFamily: "DMSans-Bold",
    fontSize: 18,
    color: "#391b59",
    marginBottom: 8,
    textAlign: "center",
  },
  weekdayRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: "center",
    fontFamily: "DMSans-Bold",
    fontSize: 11,
    color: "#666",
  },
  weekRow: {
    flexDirection: "row",
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 1,
    borderRadius: 4,
  },
  dayText: {
    fontFamily: "DMSans-Regular",
    fontSize: 12,
    color: "#333",
  },
  dayTextHighContrast: {
    color: "#fff",
    fontWeight: "700",
  },
});
