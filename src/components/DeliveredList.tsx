import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useSwipeDismiss } from "@/hooks";
import { Entry } from "@/storage";
import { ColorTokens, useTheme } from "@/theme";
import { deliveryTimingLabel, formatDueDate, lineHeight } from "@/util";

import DeliveredCard from "./DeliveredCard";
import EntryDetailModal from "./EntryDetailModal";

interface DeliveredListProps {
  entries: Entry[];
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
  deliveredTTLDays: number;
  onChangeDeliveredTTL: (days: number) => void;
}

type GridItem = Entry | "spacer";

interface DeliveredRowProps {
  item: Entry;
  onDelete: (id: string) => void;
  onPress: (entry: Entry) => void;
  colors: ColorTokens;
  styles: ReturnType<typeof createStyles>;
}

const DELIVERED_SWIPE_THRESHOLD = 80;

/** Individual delivered row with swipe-to-delete support. */
const DeliveredRow = React.memo(function DeliveredRow({
  item,
  onDelete,
  onPress,
  colors,
  styles,
}: DeliveredRowProps) {
  const { animatedValue: translateX, panHandlers } = useSwipeDismiss({
    axis: "x",
    threshold: DELIVERED_SWIPE_THRESHOLD,
    onDismiss: () => onDelete(item.id),
  });

  // Animate delete icons based on swipe direction & progress
  const leftDeleteOpacity = translateX.interpolate({
    inputRange: [
      -DELIVERED_SWIPE_THRESHOLD,
      -DELIVERED_SWIPE_THRESHOLD * 0.3,
      0,
    ],
    outputRange: [1, 0.5, 0],
    extrapolate: "clamp",
  });
  const leftDeleteScale = translateX.interpolate({
    inputRange: [
      -DELIVERED_SWIPE_THRESHOLD,
      -DELIVERED_SWIPE_THRESHOLD * 0.5,
      0,
    ],
    outputRange: [1, 0.8, 0.6],
    extrapolate: "clamp",
  });
  const rightDeleteOpacity = translateX.interpolate({
    inputRange: [0, DELIVERED_SWIPE_THRESHOLD * 0.3, DELIVERED_SWIPE_THRESHOLD],
    outputRange: [0, 0.5, 1],
    extrapolate: "clamp",
  });
  const rightDeleteScale = translateX.interpolate({
    inputRange: [0, DELIVERED_SWIPE_THRESHOLD * 0.5, DELIVERED_SWIPE_THRESHOLD],
    outputRange: [0.6, 0.8, 1],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.rowWrapper}>
      <View style={styles.swipeBackground}>
        <View style={styles.swipeDeleteSide}>
          <Animated.View
            style={[
              styles.swipeIconGroup,
              {
                opacity: rightDeleteOpacity,
                transform: [{ scale: rightDeleteScale }],
              },
            ]}
          >
            <Ionicons name="trash-outline" size={22} color={colors.white} />
            <Text style={styles.swipeLabel}>Remove</Text>
          </Animated.View>
        </View>
        <View style={styles.swipeDeleteSide}>
          <Animated.View
            style={[
              styles.swipeIconGroup,
              {
                opacity: leftDeleteOpacity,
                transform: [{ scale: leftDeleteScale }],
              },
            ]}
          >
            <Text style={styles.swipeLabel}>Remove</Text>
            <Ionicons name="trash-outline" size={22} color={colors.white} />
          </Animated.View>
        </View>
      </View>
      <Animated.View
        style={[styles.row, { transform: [{ translateX }] }]}
        {...panHandlers}
      >
        <Pressable
          style={styles.rowContent}
          onPress={() => onPress(item)}
          accessibilityRole="button"
          accessibilityLabel={`View details for ${item.name}`}
        >
          <Text style={styles.baby}>👶</Text>
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
              {item.name}
            </Text>
            <Text style={styles.timing}>
              {item.deliveredAt
                ? deliveryTimingLabel(item.dueDate, item.deliveredAt)
                : formatDueDate(item.dueDate)}
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
});

/** Full-page view showing all delivered entries. Respects compact/cozy layout. */
/** Human-readable TTL label for inline display. */
const TTL_LABELS: Record<number, string> = {
  0: "Never",
  1: "1 day",
  3: "3 days",
  7: "1 week",
  14: "2 weeks",
  30: "30 days",
};

/** Ordered TTL options for cycling through. */
const TTL_CYCLE = [0, 1, 3, 7, 14, 30] as const;

/**
 *
 */
export default function DeliveredList({
  entries,
  onDelete,
  onDeleteAll,
  deliveredTTLDays,
  onChangeDeliveredTTL,
}: DeliveredListProps) {
  const { colors, layout } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  const deliveredEntries = useMemo(
    () =>
      entries
        .filter((e) => !!e.deliveredAt)
        .sort((a, b) => (b.deliveredAt ?? 0) - (a.deliveredAt ?? 0)),
    [entries],
  );

  const handleLongPress = useCallback(
    (entry: Entry) => {
      Alert.alert(entry.name, undefined, [
        {
          text: "Remove",
          style: "destructive",
          onPress: () => onDelete(entry.id),
        },
        { text: "Cancel", style: "cancel" },
      ]);
    },
    [onDelete],
  );

  const gridData: GridItem[] = useMemo(() => {
    const data: GridItem[] = [...deliveredEntries];
    if (data.length % 2 !== 0) {
      data.push("spacer" as const);
    }
    return data;
  }, [deliveredEntries]);

  const renderGridItem = useCallback(
    ({ item }: { item: GridItem }) => {
      if (item === "spacer") {
        return <View style={styles.spacer} />;
      }
      return (
        <DeliveredCard
          entry={item}
          onPress={setSelectedEntry}
          onLongPress={handleLongPress}
        />
      );
    },
    [styles, handleLongPress],
  );

  const gridKeyExtractor = useCallback(
    (item: GridItem) => (item === "spacer" ? "spacer" : item.id),
    [],
  );

  const renderCompactItem = useCallback(
    ({ item }: { item: Entry }) => (
      <DeliveredRow
        item={item}
        onDelete={onDelete}
        onPress={setSelectedEntry}
        colors={colors}
        styles={styles}
      />
    ),
    [onDelete, colors, styles],
  );

  const cycleTTL = useCallback(() => {
    const currentIndex = TTL_CYCLE.indexOf(
      deliveredTTLDays as (typeof TTL_CYCLE)[number],
    );
    const nextIndex = (currentIndex + 1) % TTL_CYCLE.length;
    onChangeDeliveredTTL(TTL_CYCLE[nextIndex]);
  }, [deliveredTTLDays, onChangeDeliveredTTL]);

  const ttlLabel = TTL_LABELS[deliveredTTLDays] ?? `${deliveredTTLDays} days`;
  const ttlDescription =
    deliveredTTLDays === 0
      ? "Kept until you remove them"
      : `Removed after ${ttlLabel}`;

  const listHeader = useMemo(
    () => (
      <>
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>🎉</Text>
          <Text style={styles.headerTitle}>Delivered</Text>
          <Text style={styles.headerCount}>{deliveredEntries.length}</Text>
          <View style={styles.headerSpacer} />
          <Pressable
            style={styles.removeAllButton}
            onPress={() =>
              Alert.alert(
                "Remove all delivered?",
                `This will remove all ${deliveredEntries.length} delivered people from your list. This can\u2019t be undone.`,
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Remove all",
                    style: "destructive",
                    onPress: onDeleteAll,
                  },
                ],
              )
            }
            accessibilityRole="button"
            accessibilityLabel="Remove all"
            hitSlop={8}
          >
            <Text style={styles.removeAllLabel}>Remove all</Text>
          </Pressable>
        </View>
        <Pressable
          style={styles.ttlRow}
          onPress={cycleTTL}
          accessibilityRole="button"
          accessibilityLabel={`Cleanup: ${ttlDescription}. Tap to change.`}
        >
          <Ionicons
            name="timer-outline"
            size={14}
            color={colors.textTertiary}
          />
          <Text style={styles.ttlText}>{ttlDescription}</Text>
          <Text style={styles.ttlChange}>Change</Text>
        </Pressable>
      </>
    ),
    [
      styles,
      deliveredEntries.length,
      onDeleteAll,
      cycleTTL,
      ttlDescription,
      colors.textTertiary,
    ],
  );

  if (deliveredEntries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>👶</Text>
        <Text style={styles.emptyTitle}>No deliveries yet</Text>
        <Text style={styles.emptySubtitle}>
          Swipe right on someone in the Expecting tab to mark them as delivered
        </Text>
      </View>
    );
  }

  if (layout === "cozy") {
    return (
      <View style={styles.container}>
        <FlatList
          key="cozy"
          data={gridData}
          renderItem={renderGridItem}
          keyExtractor={gridKeyExtractor}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.gridRow}
          ListHeaderComponent={listHeader}
          removeClippedSubviews={Platform.OS === "android"}
        />
        <EntryDetailModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        key="compact"
        data={deliveredEntries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={renderCompactItem}
        ListHeaderComponent={listHeader}
        removeClippedSubviews={Platform.OS === "android"}
      />
      <EntryDetailModal
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
      />
    </View>
  );
}

function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 32,
      gap: 8,
    },
    emptyEmoji: {
      fontSize: 48,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.textTertiary,
      textAlign: "center",
      lineHeight: lineHeight(20),
    },
    listContent: {
      padding: 16,
    },
    grid: {
      padding: 16,
    },
    gridRow: {
      gap: 12,
      marginBottom: 12,
    },
    spacer: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 12,
    },
    headerEmoji: {
      fontSize: 18,
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    headerCount: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textTertiary,
      backgroundColor: colors.inputBackground,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      overflow: "hidden",
    },
    headerSpacer: {
      flex: 1,
    },
    removeAllButton: {
      height: 44,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 8,
    },
    removeAllLabel: {
      fontSize: 13,
      color: colors.textTertiary,
    },
    ttlRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 12,
    },
    ttlText: {
      fontSize: 12,
      color: colors.textTertiary,
    },
    ttlChange: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: "600",
      marginLeft: 4,
    },
    rowWrapper: {
      marginBottom: 6,
      borderRadius: 10,
      overflow: "hidden",
    },
    swipeBackground: {
      ...StyleSheet.absoluteFillObject,
      flexDirection: "row",
    },
    swipeDeleteSide: {
      flex: 1,
      backgroundColor: colors.destructive,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      paddingHorizontal: 20,
    },
    swipeIconGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    swipeLabel: {
      color: colors.white,
      fontSize: 13,
      fontWeight: "600",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: colors.primaryLightBg,
      gap: 10,
    },
    rowContent: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    baby: {
      fontSize: 20,
    },
    info: {
      flex: 1,
    },
    name: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    timing: {
      fontSize: 13,
      color: colors.textTertiary,
      marginTop: 2,
    },
  });
}
