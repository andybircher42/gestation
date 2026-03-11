import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Patient } from "@/engine/probabilityEngine";
import { getBirthstoneImage } from "@/util";

import BirthstoneIcon from "./BirthstoneIcon";

export interface DayCell {
  date: string; // ISO YYYY-MM-DD
  day: number; // day of month (1-31)
  color: string; // heat map color
  load: number; // numeric probability load
  duePatients: Patient[]; // patients with EDD on this date
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
        color: "transparent",
        load: 0,
        duePatients: [],
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
                <>
                  <Text style={styles.dayText}>{cell.day}</Text>
                  {cell.duePatients.length > 0 && (
                    <View style={styles.iconsRow}>
                      {cell.duePatients.length <= 3 ? (
                        cell.duePatients.map((p) => (
                          <BirthstoneIcon
                            key={p.id}
                            image={getBirthstoneImage(p.birthstone.name)}
                            size={12}
                          />
                        ))
                      ) : (
                        <>
                          <BirthstoneIcon
                            image={getBirthstoneImage(
                              cell.duePatients[0].birthstone.name,
                            )}
                            size={12}
                          />
                          <Text style={styles.overflowText}>
                            +{cell.duePatients.length - 1}
                          </Text>
                        </>
                      )}
                    </View>
                  )}
                </>
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
    justifyContent: "flex-start",
    alignItems: "flex-start",
    margin: 1,
    borderRadius: 4,
    padding: 2,
  },
  dayText: {
    fontFamily: "DMSans-Regular",
    fontSize: 10,
    color: "#333",
  },
  iconsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 1,
  },
  overflowText: {
    fontFamily: "DMSans-Bold",
    fontSize: 8,
    color: "#391b59",
  },
});
