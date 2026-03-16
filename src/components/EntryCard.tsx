import React, { useMemo } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { Entry } from "@/storage";
import { ColorTokens, useTheme } from "@/theme";
import {
  formatDueDate,
  gestationalAgeFromDueDate,
  getBirthstone,
  getBirthstoneImage,
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
  const { colors } = useTheme();
  const { weeks, days } = gestationalAgeFromDueDate(entry.dueDate);
  const dueDateMonth = useMemo(
    () => new Date(entry.dueDate + "T00:00:00").getMonth() + 1,
    [entry.dueDate],
  );
  const birthstone = entry.birthstone ?? getBirthstone(dueDateMonth);
  const birthstoneImage = getBirthstoneImage(birthstone.name);

  const styles = useMemo(() => createStyles(colors), [colors]);
  const cardStyle = useMemo(
    () => [styles.card, { backgroundColor: birthstone.color }],
    [styles.card, birthstone.color],
  );

  return (
    <Pressable
      style={cardStyle}
      onPress={() => onPress?.(entry)}
      onLongPress={() => onLongPress?.(entry)}
      accessibilityRole="button"
      accessibilityLabel={`${entry.name}, ${weeks} weeks ${days} days, due ${formatDueDate(entry.dueDate)}`}
      testID="entry-card"
    >
      <View style={styles.inner}>
        <BirthstoneIcon image={birthstoneImage} size={56} />
        <View style={styles.textGroup}>
          <Text style={styles.name} numberOfLines={1}>
            {entry.name}
          </Text>
          <Text style={styles.detail}>
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

function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    card: {
      flex: 1,
      aspectRatio: 1,
      borderRadius: 12,
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
