import React, { useMemo } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { Entry } from "@/storage";
import { ColorTokens, RadiiTokens, useTheme } from "@/theme";
import {
  contrastText,
  formatDueDate,
  gestationalAgeFromDueDate,
  resolveSymbol,
} from "@/util";

import BirthstoneIcon from "./BirthstoneIcon";

interface EntryCardProps {
  entry: Entry;
  onPress?: (entry: Entry) => void;
  onLongPress?: (entry: Entry) => void;
}

/** Cozy card tile for an entry, showing birthstone icon, name, and gestational age. */
const EntryCard = React.memo(function EntryCard({
  entry,
  onPress,
  onLongPress,
}: EntryCardProps) {
  const { colors, radii } = useTheme();
  const { weeks, days } = gestationalAgeFromDueDate(entry.dueDate);
  const symbol = resolveSymbol(entry);

  const styles = useMemo(() => createStyles(colors, radii), [colors, radii]);
  const textColor = useMemo(() => contrastText(symbol.color), [symbol.color]);
  const cardStyle = useMemo(
    () => [styles.card, { backgroundColor: symbol.color }],
    [styles.card, symbol.color],
  );

  return (
    <Pressable
      style={cardStyle}
      onPress={() => onPress?.(entry)}
      onLongPress={() => onLongPress?.(entry)}
      accessibilityRole="button"
      accessibilityLabel={`${entry.name}, ${symbol.label} ${symbol.name}, ${weeks} weeks ${days} days, due ${formatDueDate(entry.dueDate)}`}
      testID="entry-card"
    >
      <View style={styles.inner}>
        <BirthstoneIcon image={symbol.image} size={56} />
        <View style={styles.textGroup}>
          <Text
            style={[styles.name, { color: textColor }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {entry.name}
          </Text>
          <Text style={[styles.detail, { color: textColor }]}>
            {formatDueDate(entry.dueDate)}
            {"  \u2013  "}
            {weeks}w {days}d
          </Text>
        </View>
      </View>
    </Pressable>
  );
});

export default EntryCard;

function createStyles(colors: ColorTokens, radii: RadiiTokens) {
  return StyleSheet.create({
    card: {
      flex: 1,
      aspectRatio: 1,
      borderRadius: radii.lg,
      padding: 16,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        },
        android: {
          elevation: 6,
        },
      }),
    },
    inner: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    textGroup: {
      alignItems: "center",
      gap: 2,
      width: "100%",
    },
    name: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.textOnColor,
      textAlign: "center",
    },
    detail: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.textOnColor,
      textAlign: "center",
    },
  });
}
