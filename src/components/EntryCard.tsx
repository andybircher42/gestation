import React, { useMemo } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { Entry } from "@/storage";
import { useTheme } from "@/theme";
import {
  formatDueDate,
  gestationalAgeFromDueDate,
  getBirthstone,
  getBirthstoneImage,
} from "@/util";

import BirthstoneIcon from "./BirthstoneIcon";

interface EntryCardProps {
  entry: Entry;
  onLongPress?: (entry: Entry) => void;
}

/** Cozy card tile for an entry, showing birthstone icon, name, and gestational age. */
const EntryCard = React.memo(function EntryCard({
  entry,
  onLongPress,
}: EntryCardProps) {
  const { colors } = useTheme();
  const { weeks, days } = gestationalAgeFromDueDate(entry.dueDate);
  const dueDateMonth = new Date(entry.dueDate + "T00:00:00").getMonth() + 1;
  const birthstone = entry.birthstone ?? getBirthstone(dueDateMonth);
  const birthstoneImage = getBirthstoneImage(birthstone.name);

  const cardStyle = useMemo(
    () => [styles.card, { backgroundColor: birthstone.color }],
    [birthstone.color],
  );

  return (
    <Pressable
      style={cardStyle}
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
          <Text style={styles.age}>
            {weeks}w {days}d
          </Text>
          <Text style={[styles.dueDate, { color: colors.white }]}>
            {formatDueDate(entry.dueDate)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
});

export default EntryCard;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
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
    color: "#ffffff",
    textAlign: "center",
  },
  age: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
  },
  dueDate: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
  },
});
