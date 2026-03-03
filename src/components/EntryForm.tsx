import { useMemo, useState } from "react";
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

import { ColorTokens, useTheme } from "@/theme";
import {
  computeDueDate,
  computeGestationalAge,
  formatDateInput,
  getDateBounds,
  getDateError,
  parseDateText,
  toDisplayDateString,
  toISODateString,
} from "@/util";

type InputMode = "weeksDays" | "dueDate";

interface EntryFormProps {
  onAdd: (entry: { name: string; dueDate: string }) => void;
}

/** Form for adding a new gestation entry with name, weeks, and days fields. */
export default function EntryForm({ onAdd }: EntryFormProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
  const weeksValid = !weeks || (!isNaN(w) && w >= 0 && w <= 42);
  const daysValid = !days || (!isNaN(d) && d >= 0 && d <= 6);
  const weeksError = weeks && !weeksValid ? "Weeks must be 0\u201342" : null;
  const daysError = days && !daysValid ? "Days must be 0\u20136" : null;

  const dateBounds = getDateBounds();
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

  /** Creates an onChangeText handler that accepts only digits for a numeric input. */
  const makeNumericHandler =
    (setValue: (v: string) => void, setTouched: (v: boolean) => void) =>
    (text: string) => {
      if (/^\d*$/.test(text)) {
        setTouched(false);
        setValue(text);
      }
    };

  const handleDateTextChange = (text: string) => {
    setDateTouched(false);
    let updated = text.replace(/[^\d-]/g, "-").replace(/-{2,}/g, "-");
    // Limit to DD-DD-DDDD pattern: truncate after 2nd hyphen + 4 digits
    const parts = updated.split("-");
    if (parts.length > 3) {
      updated = parts.slice(0, 3).join("-");
    }
    if (parts.length === 3 && parts[2].length > 4) {
      parts[2] = parts[2].slice(0, 4);
      updated = parts.join("-");
    }
    if (text.length > dateText.length) {
      if (/^\d{2}$/.test(updated)) {
        updated += "-";
      } else if (/^\d{1,2}-\d{2}$/.test(updated)) {
        updated += "-";
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
      const computed_dueDate = computeDueDate(w, d);
      onAdd({
        name: name.trim(),
        dueDate: toISODateString(computed_dueDate),
      });
    } else if (dueDate) {
      onAdd({
        name: name.trim(),
        dueDate: toISODateString(dueDate),
      });
    }

    setName("");
    setWeeks("");
    setDays("");
    setDueDate(null);
    setDateText("");
    setWeeksTouched(false);
    setDaysTouched(false);
    setDateTouched(false);
    Keyboard.dismiss();
  };

  const handleDateChange = (_event: DateTimePickerEvent, selected?: Date) => {
    setShowPicker(Platform.OS === "ios");
    if (selected) {
      setDueDate(selected);
      setDateText(toDisplayDateString(selected));
    }
  };

  return (
    <View style={styles.form}>
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.nameInput}
        placeholder={"First Name"}
        placeholderTextColor={colors.textTertiary}
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
          accessibilityState={{ selected: mode === "dueDate" }}
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
          accessibilityState={{ selected: mode === "weeksDays" }}
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
              placeholder={"0-42"}
              placeholderTextColor={colors.textTertiary}
              value={weeks}
              onChangeText={makeNumericHandler(setWeeks, setWeeksTouched)}
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
              placeholder={"0-6"}
              placeholderTextColor={colors.textTertiary}
              value={days}
              onChangeText={makeNumericHandler(setDays, setDaysTouched)}
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
            accessibilityRole="button"
            accessibilityLabel="Add entry"
            accessibilityState={{ disabled: !canAdd }}
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
                  placeholder="MM-DD-YYYY"
                  placeholderTextColor={colors.textTertiary}
                  value={dateText}
                  keyboardType="number-pad"
                  onChangeText={handleDateTextChange}
                  onBlur={() => {
                    setDateTouched(true);
                    const formatted = formatDateInput(dateText);
                    if (formatted) {
                      setDateText(formatted);
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
              minimumDate={dateBounds.min}
              maximumDate={dateBounds.max}
            />
          )}
        </View>
      )}
    </View>
  );
}

/** Creates styles based on the active color palette. */
function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    form: {
      backgroundColor: colors.contentBackground,
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    label: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textLabel,
      marginBottom: 4,
    },
    nameInput: {
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      marginBottom: 10,
      backgroundColor: colors.inputBackground,
      color: colors.textPrimary,
    },
    toggleRow: {
      flexDirection: "row",
      marginBottom: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.primary,
      overflow: "hidden",
    },
    toggleButton: {
      flex: 1,
      paddingVertical: 8,
      alignItems: "center",
      backgroundColor: colors.contentBackground,
    },
    toggleButtonActive: {
      backgroundColor: colors.primary,
    },
    toggleText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
    },
    toggleTextActive: {
      color: colors.white,
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
      borderColor: colors.inputBorder,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      backgroundColor: colors.inputBackground,
      color: colors.textPrimary,
    },
    dateInputRow: {
      flexDirection: "row",
      gap: 6,
    },
    dateTextInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      backgroundColor: colors.inputBackground,
      color: colors.textPrimary,
    },
    calendarButton: {
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 8,
      paddingHorizontal: 12,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.contentBackground,
    },
    calendarButtonText: {
      fontSize: 22,
    },
    inputError: {
      borderColor: colors.destructive,
    },
    errorText: {
      color: colors.destructive,
      fontSize: 13,
      marginTop: 4,
      marginBottom: 8,
    },
    preview: {
      marginTop: 8,
      fontSize: 15,
      color: colors.primary,
      fontWeight: "600",
    },
    addButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingHorizontal: 24,
      justifyContent: "center",
      alignItems: "center",
    },
    addButtonDisabled: {
      backgroundColor: colors.primaryDisabled,
    },
    addButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "600",
    },
  });
}
