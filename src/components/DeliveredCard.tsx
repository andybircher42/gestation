import React, { useMemo } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { Entry } from "@/storage";
import { ColorTokens, RadiiTokens, useTheme } from "@/theme";
import {
  contrastText,
  deliveryTimingLabel,
  formatDueDate,
  getBirthFlower,
  getBirthFlowerImage,
  getBirthstone,
  getBirthstoneImage,
  getZodiacSignImage,
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
  const { colors, radii } = useTheme();
  const dueDateMonth = new Date(entry.dueDate + "T00:00:00").getMonth() + 1;
  const isFlower = entry.symbolType === "flower";
  const isZodiac = entry.symbolType === "zodiac";
  const symbol = isZodiac
    ? (entry.zodiacSign ?? { name: "Aries", color: "#E53935" })
    : isFlower
      ? (entry.birthFlower ?? getBirthFlower(dueDateMonth))
      : (entry.birthstone ?? getBirthstone(dueDateMonth));
  const symbolImage = isZodiac
    ? getZodiacSignImage(symbol.name)
    : isFlower
      ? getBirthFlowerImage(symbol.name)
      : getBirthstoneImage(symbol.name);

  const timing = entry.deliveredAt
    ? deliveryTimingLabel(entry.dueDate, entry.deliveredAt)
    : formatDueDate(entry.dueDate);

  const styles = useMemo(() => createStyles(colors, radii), [colors, radii]);
  const textColor = contrastText(symbol.color);
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
      accessibilityLabel={`${entry.name}, ${timing}`}
      testID="delivered-card"
    >
      <View style={styles.inner}>
        <BirthstoneIcon image={symbolImage} size={56} />
        <View style={styles.textGroup}>
          <Text
            style={[styles.name, { color: textColor }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {entry.name}
          </Text>
          <Text style={[styles.detail, { color: textColor }]}>{timing}</Text>
        </View>
      </View>
    </Pressable>
  );
});

export default DeliveredCard;

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
