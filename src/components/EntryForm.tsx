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
  getDateBounds,
  parseBatchInput,
  parseDateOrAge,
  toDisplayDateString,
  toISODateString,
} from "@/util";

import HelpButton from "./HelpButton";

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
  const [dateAgeText, setDateAgeText] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [touched, setTouched] = useState(false);
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

  const hasName = name.trim().length > 0;

  const handleNameChange = useCallback((text: string) => {
    const willReveal = text.trim().length > 0;
    if (willReveal && !wasRevealedRef.current) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    wasRevealedRef.current = willReveal;
    setName(text);
  }, []);

  const parsed = parseDateOrAge(dateAgeText);
  const parseError = parsed && "error" in parsed ? parsed.error : null;
  const parsedResult = parsed && !("error" in parsed) ? parsed : null;

  const canAdd = !!name.trim() && parsedResult !== null;

  const handleDateAgeChange = (text: string) => {
    setDateAgeText(text);
    // Show error immediately when input is recognized but invalid
    const result = parseDateOrAge(text);
    if (result && "error" in result) {
      setTouched(true);
    } else {
      setTouched(false);
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
    if (!canAdd || !parsedResult) {
      return;
    }

    const trimmedName = name.trim();
    const detail = `${parsedResult.weeks}w ${parsedResult.days}d`;

    onAdd({
      name: trimmedName,
      dueDate: toISODateString(parsedResult.dueDate),
    });

    setName("");
    setDateAgeText("");
    setTouched(false);
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
      // Both platforms close the picker on selection
      setShowPicker(false);
      setTouched(true);
      if (selected) {
        const bounds = getDateBounds();
        const clamped =
          selected < bounds.min
            ? bounds.min
            : selected > bounds.max
              ? bounds.max
              : selected;
        setDateAgeText(toDisplayDateString(clamped));
      }
    },
    [],
  );

  const canBatchAdd = batchText.trim().length > 0;

  if (batch) {
    return (
      <View style={styles.form}>
        <View style={styles.batchHeader}>
          <Text style={styles.label}>Add multiple people</Text>
          <HelpButton
            title="Batch format"
            message={
              "Separate entries with commas.\n\nExample:\nSam 6/14, Alex 35w5d, Jamie 6-14-26, Riley 22w 3d\n\nAll valid entries will be added right away. Any that have errors will be called out so you can fix them."
            }
          />
        </View>

        <TextInput
          style={styles.batchInput}
          placeholder="Sam 6/14, Alex 35w5d, Jamie 6-14-26, Riley 22w 3d"
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
            <Text
              style={[
                styles.addButtonText,
                !canBatchAdd && styles.addButtonTextDisabled,
              ]}
            >
              Add All
            </Text>
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
        <View>
          <View style={styles.ageRow}>
            <View style={styles.inputWithHint}>
              <Text style={styles.label}>Due date or gestational age</Text>
              <View style={styles.dateInputRow}>
                <Pressable
                  style={styles.calendarButton}
                  onPress={() => {
                    Keyboard.dismiss();
                    // Pre-fill today's date if the field is empty, so iOS
                    // spinner "Done" works even without scrolling the picker
                    if (!parsedResult) {
                      setDateAgeText(toDisplayDateString(new Date()));
                    }
                    setShowPicker(true);
                  }}
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
                    touched && parseError && styles.inputError,
                  ]}
                  accessibilityLabel="Due date or gestational age"
                  placeholder="35w5d or 06-15-2026"
                  placeholderTextColor={colors.textTertiary}
                  value={dateAgeText}
                  onChangeText={handleDateAgeChange}
                  onBlur={() => setTouched(true)}
                  returnKeyType="done"
                />
              </View>
              {touched && parseError && (
                <Text style={styles.errorText} accessibilityLabel="Input error">
                  {parseError}
                </Text>
              )}
            </View>
            <Pressable
              style={[styles.addButton, !canAdd && styles.addButtonDisabled]}
              onPress={handleAdd}
              disabled={!canAdd}
              accessibilityRole="button"
              accessibilityLabel="Add this person"
              accessibilityState={{ disabled: !canAdd }}
            >
              <Text
                style={[
                  styles.addButtonText,
                  !canAdd && styles.addButtonTextDisabled,
                ]}
              >
                Add
              </Text>
            </Pressable>
          </View>
          {parsedResult && (
            <Text
              style={styles.preview}
              accessibilityLabel={`Due ${toDisplayDateString(parsedResult.dueDate)}, ${parsedResult.weeks} weeks ${parsedResult.days} days`}
            >
              <Text style={styles.previewLabel}>Calculated: </Text>
              {toDisplayDateString(parsedResult.dueDate)}
              {"  \u2013  "}
              {parsedResult.weeks}w {parsedResult.days}d
            </Text>
          )}
          {showPicker && (
            <View>
              <DateTimePicker
                value={parsedResult?.dueDate ?? new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={handleDateChange}
                minimumDate={getDateBounds().min}
                maximumDate={getDateBounds().max}
              />
            </View>
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
    ageRow: {
      flexDirection: "row",
      gap: 10,
    },
    inputWithHint: {
      flex: 1,
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
    previewLabel: {
      fontSize: 12,
      color: colors.textTertiary,
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
      paddingVertical: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    addButtonDisabled: {
      backgroundColor: colors.inputBorder,
      opacity: 0.5,
    },
    addButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "600",
    },
    addButtonTextDisabled: {
      opacity: 0.7,
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
  });
}
