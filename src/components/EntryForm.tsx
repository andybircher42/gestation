import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Keyboard,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import { ColorTokens, useTheme } from "@/theme";
import {
  BatchEntryError,
  computeDueDate,
  computeGestationalAge,
  formatDateInput,
  getDateBounds,
  getDateError,
  parseBatchInput,
  parseDateText,
  toDisplayDateString,
  toISODateString,
} from "@/util";

type InputMode = "weeksDays" | "dueDate";

interface EntryFormProps {
  onAdd: (entry: { name: string; dueDate: string }) => void;
  batch: boolean;
}

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/** Form for adding a new gestation entry with name, weeks, and days fields. */
export default function EntryForm({ onAdd, batch }: EntryFormProps) {
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
  const wasRevealedRef = useRef(false);
  const [addedInfo, setAddedInfo] = useState<{
    name: string;
    detail: string;
  } | null>(null);
  const confirmOpacity = useRef(new Animated.Value(0)).current;
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Batch mode state
  const [batchText, setBatchText] = useState("");
  const [batchErrors, setBatchErrors] = useState<BatchEntryError[]>([]);
  const [showHelp, setShowHelp] = useState(false);

  const hasName = name.trim().length > 0;

  const handleNameChange = useCallback((text: string) => {
    const willReveal = text.trim().length > 0;
    if (willReveal && !wasRevealedRef.current) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    wasRevealedRef.current = willReveal;
    setName(text);
  }, []);

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

  /** onChangeText handler that accepts only digits for the weeks input. */
  const handleWeeksChange = useCallback((text: string) => {
    if (/^\d*$/.test(text)) {
      setWeeksTouched(false);
      setWeeks(text);
    }
  }, []);

  /** onChangeText handler that accepts only digits for the days input. */
  const handleDaysChange = useCallback((text: string) => {
    if (/^\d*$/.test(text)) {
      setDaysTouched(false);
      setDays(text);
    }
  }, []);

  const handleDateTextChange = (text: string) => {
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
    const parsed = parseDateText(updated);
    setDueDate(parsed);
    // Show error immediately when a complete date is out of bounds
    if (parsed && getDateError(updated)) {
      setDateTouched(true);
    } else {
      setDateTouched(false);
    }
  };

  useEffect(() => {
    return () => {
      if (confirmTimer.current) {
        clearTimeout(confirmTimer.current);
      }
    };
  }, []);

  /** Shows a brief confirmation message that fades out. */
  const showConfirmation = useCallback(
    (info: { name: string; detail: string }) => {
      if (confirmTimer.current) {
        clearTimeout(confirmTimer.current);
      }
      setAddedInfo(info);
      confirmOpacity.setValue(1);
      confirmTimer.current = setTimeout(() => {
        Animated.timing(confirmOpacity, {
          toValue: 0,
          duration: 400,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }).start(() => setAddedInfo(null));
      }, 1500);
    },
    [confirmOpacity],
  );

  const handleAdd = () => {
    if (!canAdd) {
      return;
    }

    const trimmedName = name.trim();
    let detail: string;

    if (mode === "weeksDays") {
      detail = `${w}w ${d}d`;
      const computed_dueDate = computeDueDate(w, d);
      onAdd({
        name: trimmedName,
        dueDate: toISODateString(computed_dueDate),
      });
    } else if (dueDate) {
      detail = toDisplayDateString(dueDate);
      onAdd({
        name: trimmedName,
        dueDate: toISODateString(dueDate),
      });
    } else {
      return;
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

    showConfirmation({ name: trimmedName, detail });
  };

  const handleBatchAdd = () => {
    const { entries, errors } = parseBatchInput(batchText);
    if (entries.length === 0 && errors.length === 0) {
      return;
    }

    setBatchErrors(errors);

    if (entries.length > 0) {
      for (const entry of entries) {
        onAdd({ name: entry.name, dueDate: entry.dueDate });
      }

      if (errors.length === 0) {
        setBatchText("");
      } else {
        // Keep only the errored entries in the text field
        setBatchText(errors.map((e) => e.raw).join(", "));
      }

      Keyboard.dismiss();

      const count = entries.length;
      showConfirmation({
        name: `${count} ${count === 1 ? "person" : "people"}`,
        detail: entries.map((e) => e.name).join(", "),
      });
    }
  };

  const handleDateChange = useCallback(
    (_event: DateTimePickerEvent, selected?: Date) => {
      // TODO: Refactor date picker into DatePicker.ios.tsx / DatePicker.android.tsx platform files
      // Android native dialog auto-closes on selection; iOS stays open
      if (Platform.OS !== "ios") {
        setShowPicker(false);
      }
      if (selected) {
        // Clamp to bounds — iOS spinner can overshoot min/max
        const bounds = getDateBounds();
        const clamped =
          selected < bounds.min
            ? bounds.min
            : selected > bounds.max
              ? bounds.max
              : selected;
        setDueDate(clamped);
        setDateText(toDisplayDateString(clamped));
      }
    },
    [],
  );

  const handlePickerDone = () => {
    setShowPicker(false);
    setDateTouched(true);
  };

  const canBatchAdd = batchText.trim().length > 0;

  if (batch) {
    return (
      <View style={styles.form}>
        <View style={styles.batchHeader}>
          <Text style={styles.label}>Add multiple people</Text>
          <Pressable
            onPress={() => setShowHelp((prev) => !prev)}
            accessibilityRole="button"
            accessibilityLabel="Show format help"
            hitSlop={8}
          >
            <Ionicons
              name="help-circle-outline"
              size={20}
              color={colors.textTertiary}
            />
          </Pressable>
        </View>

        {showHelp && (
          <View
            style={[
              styles.helpBox,
              { backgroundColor: colors.inputBackground },
            ]}
            accessibilityLabel="Format help"
          >
            <Text style={styles.helpTitle}>Separate entries with commas</Text>
            <Text style={styles.helpCode}>
              Alice 6/14, Bob 35w5d, Carol 6-14-26, Debby 22w 3d
            </Text>
          </View>
        )}

        <TextInput
          style={styles.batchInput}
          placeholder="Alice 6/14, Bob 35w5d, Carol 6-14-26, Debby 22w 3d"
          placeholderTextColor={colors.textTertiary}
          accessibilityLabel="Batch entries"
          value={batchText}
          onChangeText={(text) => {
            setBatchText(text);
            setBatchErrors([]);
          }}
          multiline
          textAlignVertical="top"
          autoFocus
        />

        {batchErrors.length > 0 && (
          <View style={styles.batchErrorBox}>
            {batchErrors.map((err) => (
              <Text key={err.raw} style={styles.errorText}>
                &ldquo;{err.raw}&rdquo; &mdash; {err.error}
              </Text>
            ))}
          </View>
        )}

        {addedInfo && (
          <Animated.View
            style={[styles.confirmRow, { opacity: confirmOpacity }]}
            accessibilityLabel={`Added ${addedInfo.name}, ${addedInfo.detail}`}
            accessibilityRole="alert"
          >
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={colors.primary}
            />
            <Text style={styles.confirmText}>
              Added {addedInfo.name} — {addedInfo.detail}
            </Text>
          </Animated.View>
        )}

        <View style={styles.batchActions}>
          <Pressable
            style={[styles.addButton, !canBatchAdd && styles.addButtonDisabled]}
            onPress={handleBatchAdd}
            disabled={!canBatchAdd}
            accessibilityRole="button"
            accessibilityLabel="Add all"
            accessibilityState={{ disabled: !canBatchAdd }}
          >
            <Text style={styles.addButtonText}>Add All</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.form}>
      <TextInput
        style={styles.nameInput}
        placeholder="Who are you tracking?"
        placeholderTextColor={colors.textTertiary}
        accessibilityLabel="Name"
        value={name}
        onChangeText={handleNameChange}
        returnKeyType="next"
        maxLength={50}
        autoFocus
      />

      {addedInfo && (
        <Animated.View
          style={[styles.confirmRow, { opacity: confirmOpacity }]}
          accessibilityLabel={`Added ${addedInfo.name}, ${addedInfo.detail}`}
          accessibilityRole="alert"
        >
          <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
          <Text style={styles.confirmText}>
            Added {addedInfo.name} — {addedInfo.detail}
          </Text>
        </Animated.View>
      )}

      {hasName && (
        <>
          {mode === "weeksDays" ? (
            <>
              <View style={styles.ageRow}>
                <View style={styles.inputWithHint}>
                  <Text style={styles.label}>Weeks</Text>
                  <TextInput
                    style={[
                      styles.numberInput,
                      showWeeksError && styles.inputError,
                    ]}
                    accessibilityLabel="Weeks"
                    placeholder={"0\u201342"}
                    placeholderTextColor={colors.textTertiary}
                    value={weeks}
                    onChangeText={handleWeeksChange}
                    onBlur={() => setWeeksTouched(true)}
                    keyboardType="number-pad"
                    maxLength={2}
                    returnKeyType="next"
                  />
                  {showWeeksError && (
                    <Text
                      style={styles.errorText}
                      accessibilityLabel="Weeks error"
                    >
                      {weeksError}
                    </Text>
                  )}
                </View>
                <View style={styles.inputWithHint}>
                  <Text style={styles.label}>Days</Text>
                  <TextInput
                    style={[
                      styles.numberInput,
                      showDaysError && styles.inputError,
                    ]}
                    accessibilityLabel="Days"
                    placeholder={"0\u20136"}
                    placeholderTextColor={colors.textTertiary}
                    value={days}
                    onChangeText={handleDaysChange}
                    onBlur={() => setDaysTouched(true)}
                    keyboardType="number-pad"
                    maxLength={1}
                    returnKeyType="done"
                  />
                  {showDaysError && (
                    <Text
                      style={styles.errorText}
                      accessibilityLabel="Days error"
                    >
                      {daysError}
                    </Text>
                  )}
                </View>
                <Pressable
                  style={[
                    styles.addButton,
                    !canAdd && styles.addButtonDisabled,
                  ]}
                  onPress={handleAdd}
                  disabled={!canAdd}
                  accessibilityRole="button"
                  accessibilityLabel="Add this person"
                  accessibilityState={{ disabled: !canAdd }}
                >
                  <Text style={styles.addButtonText}>Add</Text>
                </Pressable>
              </View>
              {weeks && days && weeksValid && daysValid && (
                <Text
                  style={styles.preview}
                  accessibilityLabel="Due date preview"
                >
                  Due date: {toDisplayDateString(computeDueDate(w, d))}
                </Text>
              )}
              <Pressable
                onPress={() => setMode("dueDate")}
                accessibilityRole="button"
                accessibilityLabel="Switch to due date input"
              >
                <Text style={styles.modeSwitchText}>
                  Enter due date instead
                </Text>
              </Pressable>
            </>
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
                      <Ionicons
                        name="calendar-outline"
                        size={22}
                        color={colors.primary}
                      />
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
                    <Text
                      style={styles.errorText}
                      accessibilityLabel="Date error"
                    >
                      {dateError}
                    </Text>
                  )}
                </View>
                <Pressable
                  style={[
                    styles.addButton,
                    !canAdd && styles.addButtonDisabled,
                  ]}
                  onPress={handleAdd}
                  disabled={!canAdd}
                  accessibilityRole="button"
                  accessibilityLabel="Add this person"
                  accessibilityState={{ disabled: !canAdd }}
                >
                  <Text style={styles.addButtonText}>Add</Text>
                </Pressable>
              </View>
              {computed && (
                <Text
                  style={styles.preview}
                  accessibilityLabel="Gestational age preview"
                >
                  Gestational age: {computed.weeks}w {computed.days}d
                </Text>
              )}
              <Pressable
                onPress={() => setMode("weeksDays")}
                accessibilityRole="button"
                accessibilityLabel="Switch to gestational age input"
              >
                <Text style={styles.modeSwitchText}>
                  Enter gestational age instead
                </Text>
              </Pressable>
              {showPicker && (
                <View>
                  <DateTimePicker
                    value={dueDate ?? new Date()}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={handleDateChange}
                    minimumDate={dateBounds.min}
                    maximumDate={dateBounds.max}
                  />
                  {Platform.OS === "ios" && (
                    <Pressable
                      style={styles.pickerDoneButton}
                      onPress={handlePickerDone}
                    >
                      <Text style={styles.pickerDoneText}>Done</Text>
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          )}
        </>
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
      borderRadius: 10,
      paddingVertical: 14,
      paddingHorizontal: 16,
      fontSize: 20,
      fontWeight: "600",
      marginBottom: 10,
      backgroundColor: colors.inputBackground,
      color: colors.textPrimary,
    },
    confirmRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 10,
    },
    confirmText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
    },
    modeSwitchText: {
      fontSize: 14,
      color: colors.primary,
      marginTop: 10,
      textDecorationLine: "underline",
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
      borderColor: colors.inputBorder,
      borderRadius: 8,
      paddingHorizontal: 12,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.inputBackground,
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
    pickerDoneButton: {
      alignSelf: "flex-end",
      paddingVertical: 8,
      paddingHorizontal: 16,
      marginTop: 4,
    },
    pickerDoneText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: "600",
    },
    addButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingHorizontal: 24,
      paddingVertical: 12,
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
    batchHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    batchInput: {
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 8,
      padding: 12,
      fontSize: 15,
      backgroundColor: colors.inputBackground,
      color: colors.textPrimary,
      minHeight: 80,
      marginBottom: 8,
    },
    batchActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
    },
    batchErrorBox: {
      marginBottom: 8,
    },
    helpBox: {
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
    },
    helpTitle: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textPrimary,
      marginBottom: 6,
    },
    helpCode: {
      fontSize: 12,
      color: colors.textPrimary,
      fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
      marginTop: 2,
      marginBottom: 2,
    },
  });
}
