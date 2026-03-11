import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, TextInput } from "react-native";

interface GestationalAgeInputProps {
  weeks: string;
  days: string;
  onChangeWeeks: (w: string) => void;
  onChangeDays: (d: string) => void;
}

type Phase = "weeks" | "days";

/**
 * Gestational age input with animated label transitions and blinking cursor.
 *
 * The swap icon is NOT part of this component — the parent wraps this
 * in an inputRow alongside the swap button, matching due-date layout.
 */
export default function GestationalAgeInput({
  weeks,
  days,
  onChangeWeeks,
  onChangeDays,
}: GestationalAgeInputProps) {
  const hiddenRef = useRef<TextInput>(null);
  const [phase, setPhase] = useState<Phase>(
    weeks.length >= 2 ? "days" : "weeks",
  );
  const [isFocused, setIsFocused] = useState(true);

  // Blinking cursor
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
      ]),
    );
    if (isFocused) {
      blink.start();
    } else {
      blink.stop();
      cursorOpacity.setValue(0);
    }
    return () => blink.stop();
  }, [isFocused, cursorOpacity]);

  // "eeks" fade + collapse, days fade in
  const eeksFade = useRef(
    new Animated.Value(weeks.length >= 2 ? 0 : 1),
  ).current;
  const eeksWidth = useRef(
    new Animated.Value(weeks.length >= 2 ? 0 : 1),
  ).current;
  const daysFade = useRef(
    new Animated.Value(weeks.length >= 2 ? 1 : 0),
  ).current;

  useEffect(() => {
    if (weeks.length >= 2 && phase === "weeks") {
      setPhase("days");
      Animated.parallel([
        Animated.timing(eeksFade, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(eeksWidth, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(daysFade, {
          toValue: 1,
          duration: 300,
          delay: 100,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [weeks, phase, eeksFade, eeksWidth, daysFade]);

  useEffect(() => {
    if (weeks.length < 2 && phase === "days") {
      setPhase("weeks");
      onChangeDays("");
      Animated.parallel([
        Animated.timing(eeksFade, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(eeksWidth, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(daysFade, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [weeks, phase, eeksFade, eeksWidth, daysFade, onChangeDays]);

  const handleInput = (text: string) => {
    const digits = text.replace(/[^0-9]/g, "");
    if (phase === "weeks") {
      onChangeWeeks(digits.slice(0, 2));
    } else {
      if (digits.length <= 2) {
        onChangeWeeks(digits);
        onChangeDays("");
      } else {
        onChangeWeeks(digits.slice(0, 2));
        onChangeDays(digits.slice(2, 3));
      }
    }
  };

  const hiddenValue = weeks + days;
  const focusInput = () => hiddenRef.current?.focus();
  const weeksEntered = weeks.length >= 2;
  const daysEntered = days.length >= 1;

  return (
    <Pressable style={styles.wrapper} onPress={focusInput}>
      {/* Weeks digits or placeholder */}
      {weeks.length > 0 ? (
        <Text style={styles.value}>{weeks}</Text>
      ) : (
        <Text style={styles.placeholder}>WW</Text>
      )}

      {/* "w" always visible, "eeks" fades + collapses */}
      <Text style={styles.label}>w</Text>
      <Animated.View
        style={{
          overflow: "hidden",
          maxWidth: eeksWidth.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 120],
          }),
          opacity: eeksFade,
        }}
      >
        <Text style={styles.label}>eeks</Text>
      </Animated.View>

      {/* Days section — fades in */}
      <Animated.View style={[styles.daysSection, { opacity: daysFade }]}>
        <Text style={styles.spacer}> </Text>
        {daysEntered ? (
          <Text style={styles.value}>{days}</Text>
        ) : (
          weeksEntered && <Text style={styles.placeholder}>DD</Text>
        )}
        {weeksEntered && !daysEntered && (
          <Text style={styles.label}> days</Text>
        )}
        {daysEntered && <Text style={styles.label}>d</Text>}
      </Animated.View>

      {/* Blinking cursor — inline with text baseline */}
      <Animated.View style={[styles.cursor, { opacity: cursorOpacity }]} />

      {/* Hidden input to capture keypad */}
      <TextInput
        ref={hiddenRef}
        style={styles.hiddenInput}
        value={hiddenValue}
        onChangeText={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        keyboardType="number-pad"
        autoFocus
        maxLength={3}
        caretHidden
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "baseline",
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  value: {
    fontFamily: "DMSans-Bold",
    fontSize: 48,
    color: "#391b59",
  },
  placeholder: {
    fontFamily: "DMSans-Bold",
    fontSize: 48,
    color: "rgba(0,0,0,0.1)",
  },
  label: {
    fontFamily: "DMSans-Bold",
    fontSize: 48,
    color: "#391b59",
  },
  spacer: {
    fontSize: 48,
  },
  daysSection: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  cursor: {
    width: 2,
    height: 40,
    backgroundColor: "#391b59",
    marginLeft: 1,
    marginBottom: 6,
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    height: 0,
    width: 0,
  },
});
