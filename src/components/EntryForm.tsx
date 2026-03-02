import { useState } from "react";
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { computeGestationalAge } from "../gestationalAge";

type InputMode = "weeksDays" | "dueDate";

interface EntryFormProps {
  onAdd: (entry: { name: string; weeks: number; days: number }) => void;
}

export function getDateBounds(now: Date = new Date()): {
  min: Date;
  max: Date;
} {
  const min = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  const max = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 7 * 42,
  );
  return { min, max };
}

export function getDateError(
  text: string,
  now: Date = new Date(),
): string | null {
  if (!text) {
    return null;
  }
  const match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!match) {
    return "Enter date as MM/DD/YYYY";
  }
  const month = parseInt(match[1], 10);
  if (month < 1 || month > 12) {
    return "Month must be 1\u201312";
  }
  const day = parseInt(match[2], 10);
  if (day < 1 || day > 31) {
    return "Day must be 1\u201331";
  }
  let year = parseInt(match[3], 10);
  if (year < 100) {
    year += 2000;
  }
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return `${match[1]}/${match[2]} is not a valid date`;
  }
  const { min, max } = getDateBounds(now);
  if (date < min) {
    return "Date is too far in the past";
  }
  if (date > max) {
    return "Date is too far in the future";
  }
  return null;
}

export function parseDateText(text: string): Date | null {
  const match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!match) {
    return null;
  }
  const month = parseInt(match[1], 10);
  const day = parseInt(match[2], 10);
  let year = parseInt(match[3], 10);
  if (year < 100) {
    year += 2000;
  }
  if (month < 1 || month > 12) {
    return null;
  }
  if (day < 1 || day > 31) {
    return null;
  }
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

/** Form for adding a new gestation entry with name, weeks, and days fields. */
export default function EntryForm({ onAdd }: EntryFormProps) {
  const [name, setName] = useState("");
  const [weeks, setWeeks] = useState("");
  const [days, setDays] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [dateText, setDateText] = useState("");
  const [mode, setMode] = useState<InputMode>("dueDate");
  const [showPicker, setShowPicker] = useState(false);
  const [weeksTouched, setWeeksTouched] = useState(false);
  const [daysTouched, setDaysTouched] = useState(false);
  const [dateTouched, setDateTouched] = useState(false);

  const w = weeks ? parseInt(weeks, 10) : 0;
  const d = days ? parseInt(days, 10) : 0;
  const weeksValid = !weeks || (!isNaN(w) && w >= 0 && w <= 44);
  const daysValid = !days || (!isNaN(d) && d >= 0 && d <= 6);
  const weeksError = weeks && !weeksValid ? "Weeks must be 0\u201342" : null;
  const daysError = days && !daysValid ? "Days must be 0\u20136" : null;

  const dateError = getDateError(dateText);
  const computed =
    dueDate && !dateError ? computeGestationalAge(dueDate) : null;

  const canAdd =
    !!name.trim() &&
    (mode === "weeksDays"
      ? !!weeks && !!days && weeksValid && daysValid
      : dueDate !== null && !dateError);
  const showWeeksError = weeksTouched && weeksError;
  const showDaysError = daysTouched && daysError;
  const showDateError = dateTouched && dateError;

  const handleDateTextChange = (text: string) => {
    setDateTouched(false);
    let updated = text.replace(/[^\d/]/g, "/");
    if (text.length > dateText.length) {
      if (/^\d{2}$/.test(updated)) {
        updated += "/";
      } else if (/^\d{1,2}\/\d{2}$/.test(updated)) {
        updated += "/";
      }
    }
    setDateText(updated);
    setDueDate(parseDateText(updated));
  };

  const handleAdd = () => {
    if (!canAdd) {
      return;
    }

    if (mode === "weeksDays") {
      onAdd({ name: name.trim(), weeks: w, days: d });
    } else {
      onAdd({
        name: name.trim(),
        weeks: computed!.weeks,
        days: computed!.days,
      });
    }

    setName("");
    setWeeks("");
    setDays("");
    setDueDate(null);
    setDateText("");
    Keyboard.dismiss();
  };

  const handleDateChange = (_event: DateTimePickerEvent, selected?: Date) => {
    setShowPicker(Platform.OS === "ios");
    if (selected) {
      setDueDate(selected);
      setDateText(formatDate(selected));
    }
  };

  const formatDate = (date: Date) => {
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${m}/${d}/${date.getFullYear()}`;
  };

  return (
    <View style={styles.form}>
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.nameInput}
        placeholder={"First Name"}
        accessibilityLabel="Name"
        value={name}
        onChangeText={setName}
        returnKeyType="next"
      />

      {/* Mode toggle */}
      <View style={styles.toggleRow}>
        <Pressable
          style={[
            styles.toggleButton,
            mode === "dueDate" && styles.toggleButtonActive,
          ]}
          onPress={() => setMode("dueDate")}
          accessibilityRole="button"
        >
          <Text
            style={[
              styles.toggleText,
              mode === "dueDate" && styles.toggleTextActive,
            ]}
          >
            Due Date
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.toggleButton,
            mode === "weeksDays" && styles.toggleButtonActive,
          ]}
          onPress={() => setMode("weeksDays")}
          accessibilityRole="button"
        >
          <Text
            style={[
              styles.toggleText,
              mode === "weeksDays" && styles.toggleTextActive,
            ]}
          >
            Gestational Age
          </Text>
        </Pressable>
      </View>

      {mode === "weeksDays" ? (
        <View style={styles.ageRow}>
          <View style={styles.inputWithHint}>
            <Text style={styles.label}>Weeks</Text>
            <TextInput
              style={[styles.numberInput, showWeeksError && styles.inputError]}
              accessibilityLabel="Weeks"
              placeholder={"0-42 weeks"}
              value={weeks}
              onChangeText={(text) => {
                if (/^\d*$/.test(text)) {
                  setWeeksTouched(false);
                  setWeeks(text);
                }
              }}
              onBlur={() => setWeeksTouched(true)}
              keyboardType="number-pad"
              maxLength={2}
              returnKeyType="next"
            />
            {showWeeksError && (
              <Text style={styles.errorText} accessibilityLabel="Weeks error">
                {weeksError}
              </Text>
            )}
          </View>
          <View style={styles.inputWithHint}>
            <Text style={styles.label}>Days</Text>
            <TextInput
              style={[styles.numberInput, showDaysError && styles.inputError]}
              accessibilityLabel="Days"
              placeholder={"0-6 days"}
              value={days}
              onChangeText={(text) => {
                if (/^\d*$/.test(text)) {
                  setDaysTouched(false);
                  setDays(text);
                }
              }}
              onBlur={() => setDaysTouched(true)}
              keyboardType="number-pad"
              maxLength={1}
              returnKeyType="done"
            />
            {showDaysError && (
              <Text style={styles.errorText} accessibilityLabel="Days error">
                {daysError}
              </Text>
            )}
          </View>
          <Pressable
            style={[styles.addButton, !canAdd && styles.addButtonDisabled]}
            onPress={handleAdd}
            disabled={!canAdd}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </Pressable>
        </View>
      ) : (
        <View>
          <View style={styles.ageRow}>
            <View style={styles.inputWithHint}>
              <Text style={styles.label}>Due Date</Text>
              <View style={styles.dateInputRow}>
                <Pressable
                  style={styles.calendarButton}
                  onPress={() => setShowPicker(true)}
                  accessibilityLabel="Select due date"
                >
                  <Text style={styles.calendarButtonText}>📅</Text>
                </Pressable>
                <TextInput
                  style={[
                    styles.dateTextInput,
                    showDateError && styles.inputError,
                  ]}
                  accessibilityLabel="Due date"
                  placeholder="MM/DD/YYYY"
                  value={dateText}
                  keyboardType="number-pad"
                  onChangeText={handleDateTextChange}
                  onBlur={() => {
                    setDateTouched(true);
                    if (dueDate && !dateError) {
                      setDateText(formatDate(dueDate));
                    }
                  }}
                />
              </View>
              {showDateError && (
                <Text style={styles.errorText} accessibilityLabel="Date error">
                  {dateError}
                </Text>
              )}
            </View>
            <Pressable
              style={[styles.addButton, !canAdd && styles.addButtonDisabled]}
              onPress={handleAdd}
              disabled={!canAdd}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </Pressable>
          </View>
          {computed && (
            <Text
              style={styles.preview}
              accessibilityLabel="Gestational age preview"
            >
              Gestational Age {"->"} {computed.weeks}w {computed.days}d
            </Text>
          )}
          {showPicker && (
            <DateTimePicker
              value={dueDate ?? new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={getDateBounds().min}
              maximumDate={getDateBounds().max}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    marginBottom: 4,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: "#fafafa",
  },
  toggleRow: {
    flexDirection: "row",
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4a90d9",
    overflow: "hidden",
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  toggleButtonActive: {
    backgroundColor: "#4a90d9",
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4a90d9",
  },
  toggleTextActive: {
    color: "#fff",
  },
  ageRow: {
    flexDirection: "row",
    gap: 10,
  },
  inputWithHint: {
    flex: 1,
  },
  numberInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  dateInputRow: {
    flexDirection: "row",
    gap: 6,
  },
  dateTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  calendarButton: {
    borderWidth: 1,
    borderColor: "#4a90d9",
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  calendarButtonText: {
    fontSize: 22,
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 13,
    marginTop: 4,
    marginBottom: 8,
  },
  preview: {
    marginTop: 8,
    fontSize: 15,
    color: "#4a90d9",
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: "#4a90d9",
    borderRadius: 8,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonDisabled: {
    backgroundColor: "#a0c4e8",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
