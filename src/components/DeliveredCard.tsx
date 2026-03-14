import React, { useMemo } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { Entry } from "@/storage";
import { ColorTokens, useTheme } from "@/theme";
import {
  deliveryTimingLabel,
  formatDueDate,
  getBirthstone,
  getBirthstoneImage,
} from "@/util";

import BirthstoneIcon from "./BirthstoneIcon";

interface DeliveredCardProps {
  entry: Entry;
  onPress?: (entry: Entry) => void;
  onLongPress?: (entry: Entry) => void;
}

/** Cozy card tile for a delivered entry, showing birthstone icon, name, and delivery timing. */
const DeliveredCard = React.memo(function DeliveredCard({
  entry,
  onPress,
  onLongPress,
}: DeliveredCardProps) {
  const { colors } = useTheme();
  const dueDateMonth = new Date(entry.dueDate + "T00:00:00").getMonth() + 1;
  const birthstone = entry.birthstone ?? getBirthstone(dueDateMonth);
  const birthstoneImage = getBirthstoneImage(birthstone.name);

  const timing = entry.deliveredAt
    ? deliveryTimingLabel(entry.dueDate, entry.deliveredAt)
    : formatDueDate(entry.dueDate);

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
      accessibilityLabel={`${entry.name}, ${timing}`}
      testID="delivered-card"
    >
      <View style={styles.inner}>
        <BirthstoneIcon image={birthstoneImage} size={56} />
        <View style={styles.textGroup}>
          <Text style={styles.name} numberOfLines={1}>
            {entry.name}
          </Text>
          <Text style={styles.detail}>
            <Text style={styles.detailLabel}>Delivered: </Text>
            {timing}
          </Text>
        </View>
      </View>
    </Pressable>
  );
});

export default DeliveredCard;

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
    detailLabel: {
      fontSize: 10,
      color: colors.textOnColorMuted,
    },
    detail: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.textOnColor,
      textAlign: "center",
    },
  });
}
