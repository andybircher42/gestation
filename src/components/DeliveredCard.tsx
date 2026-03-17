import React, { useMemo } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { Entry } from "@/storage";
import { ColorTokens, RadiiTokens, useTheme } from "@/theme";
import {
  contrastText,
  deliveryTimingLabel,
  formatDueDate,
  resolveSymbol,
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
  const symbol = resolveSymbol(entry);

  const timing = entry.deliveredAt
    ? deliveryTimingLabel(entry.dueDate, entry.deliveredAt)
    : formatDueDate(entry.dueDate);

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
      accessibilityLabel={`${entry.name}, ${symbol.label} ${symbol.name}, ${timing}`}
      testID="delivered-card"
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
