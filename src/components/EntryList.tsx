import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Animated,
  Easing,
  FlatList,
  LayoutChangeEvent,
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
import { formatDueDate, gestationalAgeFromDueDate } from "@/util";

type SortBy = "dueDate" | "name";
type SortDir = "asc" | "desc";

const DEFAULT_DIR: Record<SortBy, SortDir> = {
  dueDate: "desc",
  name: "asc",
};

type EntryStyles = ReturnType<typeof createStyles>;

interface EntryRowProps {
  item: Entry;
  backgroundColor: string;
  textColor: string;
  onDelete: (id: string) => void;
  nameWidth?: number;
  onNameLayout?: (id: string, width: number) => void;
  styles: EntryStyles;
  deleteIconColor: string;
  deleteButtonColor: string;
}

interface EntryListProps {
  entries: Entry[];
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
  onAddPress?: () => void;
}

/** Individual entry row with swipe-to-delete support. */
const EntryRow = React.memo(function EntryRow({
  item,
  backgroundColor,
  textColor,
  onDelete,
  nameWidth,
  onNameLayout,
  styles,
  deleteIconColor,
  deleteButtonColor,
}: EntryRowProps) {
  const { weeks, days } = gestationalAgeFromDueDate(item.dueDate);
  const { animatedValue: translateX, panHandlers } = useSwipeDismiss({
    axis: "x",
    threshold: 100,
    onDismiss: () => onDelete(item.id),
  });

  const fadeIn = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [fadeIn]);

  return (
    <Animated.View style={[styles.entryWrapper, { opacity: fadeIn }]}>
      <View style={styles.deleteBackground} testID="delete-background">
        <Ionicons
          name="trash-outline"
          size={22}
          color={deleteIconColor}
          accessible={false}
        />
        <Ionicons
          name="trash-outline"
          size={22}
          color={deleteIconColor}
          accessible={false}
        />
      </View>
      <Animated.View
        testID="entry-row"
        style={[
          styles.entry,
          { backgroundColor },
          { transform: [{ translateX }] },
        ]}
        {...panHandlers}
      >
        <Text
          style={[
            styles.entryName,
            { color: textColor },
            (nameWidth ?? 0) > 0 && { minWidth: nameWidth },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
          onLayout={(e: LayoutChangeEvent) =>
            onNameLayout?.(item.id, e.nativeEvent.layout.width)
          }
        >
          {item.name}
        </Text>
        <Text style={[styles.entryAge, { color: textColor }]}>
          {weeks}w {days}d
        </Text>
        <Text style={[styles.entryDueDate, { color: textColor }]}>
          {formatDueDate(item.dueDate)}
        </Text>
        <Pressable
          onPress={() => onDelete(item.id)}
          style={styles.deleteButton}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${item.name}`}
        >
          <Ionicons name="trash-outline" size={16} color={deleteButtonColor} />
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
});

/** Scrollable list of gestation entries with swipe-to-delete support. */
export default function EntryList({
  entries,
  onDelete,
  onDeleteAll,
  onAddPress,
}: EntryListProps) {
  const { colors, rowColors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [sortBy, setSortBy] = useState<SortBy>("dueDate");
  const [sortDir, setSortDir] = useState<SortDir>(DEFAULT_DIR.dueDate);
  const nameWidths = useRef(new Map<string, number>());
  const [maxNameWidth, setMaxNameWidth] = useState(0);

  const handleNameLayout = useCallback((id: string, width: number) => {
    nameWidths.current.set(id, width);
    if (nameWidths.current.size === 0) {
      return;
    }
    const newMax = Math.max(...nameWidths.current.values());
    setMaxNameWidth((prev) => (newMax !== prev ? newMax : prev));
  }, []);

  useEffect(() => {
    const ids = new Set(entries.map((e) => e.id));
    let changed = false;
    for (const key of nameWidths.current.keys()) {
      if (!ids.has(key)) {
        nameWidths.current.delete(key);
        changed = true;
      }
    }
    if (changed) {
      const newMax =
        nameWidths.current.size > 0
          ? Math.max(...nameWidths.current.values())
          : 0;
      setMaxNameWidth(newMax);
    }
  }, [entries]);

  const handleSortPress = (field: SortBy) => {
    if (field === sortBy) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir(DEFAULT_DIR[field]);
    }
  };

  const sorted = useMemo(() => {
    const copy = [...entries];
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortBy === "dueDate") {
      copy.sort((a, b) => {
        const dateDiff = b.dueDate.localeCompare(a.dueDate);
        if (dateDiff !== 0) {
          return dir * dateDiff;
        }
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      });
    } else {
      copy.sort((a, b) => {
        const nameDiff = a.name.localeCompare(b.name, undefined, {
          sensitivity: "base",
        });
        if (nameDiff !== 0) {
          return dir * nameDiff;
        }
        return a.dueDate.localeCompare(b.dueDate);
      });
    }
    return copy;
  }, [entries, sortBy, sortDir]);

  const renderItem = useCallback(
    ({ item, index }: { item: Entry; index: number }) => (
      <EntryRow
        item={item}
        backgroundColor={rowColors[index % rowColors.length]}
        textColor={colors.textEntryRow}
        onDelete={onDelete}
        nameWidth={maxNameWidth}
        onNameLayout={handleNameLayout}
        styles={styles}
        deleteIconColor={colors.white}
        deleteButtonColor={colors.textTertiary}
      />
    ),
    [rowColors, colors, onDelete, maxNameWidth, handleNameLayout, styles],
  );

  const keyExtractor = useCallback((item: Entry) => item.id, []);

  return (
    <View style={styles.listContainer}>
      <Pressable
        style={styles.addButton}
        onPress={onAddPress}
        accessibilityRole="button"
        accessibilityLabel="Add new entry"
      >
        <Ionicons name="add" size={24} color={colors.primary} />
        <Text style={styles.addButtonText}>Add a patient</Text>
      </Pressable>
      {entries.length > 0 && (
        <View style={styles.toolbarRow}>
          <View style={styles.sortRow}>
            <Pressable
              style={[
                styles.sortButton,
                sortBy === "dueDate" && styles.sortButtonActive,
              ]}
              onPress={() => handleSortPress("dueDate")}
              accessibilityRole="button"
              accessibilityState={{ selected: sortBy === "dueDate" }}
              accessibilityLabel={`Sort by due date${sortBy === "dueDate" ? `, ${sortDir === "asc" ? "ascending" : "descending"}` : ""}`}
            >
              <Text
                style={[
                  styles.sortText,
                  sortBy === "dueDate" && styles.sortTextActive,
                ]}
              >
                Due Date{" "}
                {sortBy === "dueDate" && (sortDir === "asc" ? "↑" : "↓")}
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.sortButton,
                sortBy === "name" && styles.sortButtonActive,
              ]}
              onPress={() => handleSortPress("name")}
              accessibilityRole="button"
              accessibilityState={{ selected: sortBy === "name" }}
              accessibilityLabel={`Sort by name${sortBy === "name" ? `, ${sortDir === "asc" ? "ascending" : "descending"}` : ""}`}
            >
              <Text
                style={[
                  styles.sortText,
                  sortBy === "name" && styles.sortTextActive,
                ]}
              >
                Name {sortBy === "name" && (sortDir === "asc" ? "↑" : "↓")}
              </Text>
            </Pressable>
          </View>
          <Pressable
            style={styles.deleteAllButton}
            onPress={() =>
              Alert.alert(
                "Delete All Entries",
                `This will permanently remove all ${entries.length} entries. This cannot be undone.`,
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete All",
                    style: "destructive",
                    onPress: onDeleteAll,
                  },
                ],
              )
            }
            accessibilityRole="button"
            accessibilityLabel="Delete all"
          >
            <Text style={styles.deleteAllText}>Delete All</Text>
          </Pressable>
        </View>
      )}
      <FlatList
        data={sorted}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        style={styles.list}
        removeClippedSubviews={Platform.OS === "android"}
        contentContainerStyle={
          entries.length === 0 ? styles.emptyList : undefined
        }
        ListEmptyComponent={
          <View style={styles.emptyContent}>
            <Ionicons
              name="calendar-outline"
              size={48}
              color={colors.textTertiary}
            />
            <Text style={styles.emptyTitle}>Ready when you are</Text>
            <Text style={styles.emptySubtitle}>
              Tap Add above to start tracking
            </Text>
          </View>
        }
      />
    </View>
  );
}

/** Creates styles based on the active color palette. */
function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    listContainer: {
      flex: 1,
    },
    toolbarRow: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 16,
      marginTop: 12,
      gap: 10,
    },
    sortRow: {
      flex: 1,
      flexDirection: "row",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.primary,
      overflow: "hidden",
    },
    deleteAllButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    deleteAllText: {
      color: colors.textTertiary,
      fontSize: 14,
      fontWeight: "600",
    },
    addButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: 16,
      marginTop: 12,
      paddingVertical: 14,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.primary,
      borderStyle: "dashed",
      gap: 6,
    },
    addButtonText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: "600",
    },
    sortButton: {
      flex: 1,
      paddingVertical: 8,
      alignItems: "center",
      backgroundColor: colors.contentBackground,
    },
    sortButtonActive: {
      backgroundColor: colors.primary,
    },
    sortText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
    },
    sortTextActive: {
      color: colors.white,
    },
    list: {
      flex: 1,
    },
    emptyList: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyContent: {
      alignItems: "center",
      gap: 8,
    },
    emptyTitle: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: "600",
    },
    emptySubtitle: {
      color: colors.textTertiary,
      fontSize: 14,
    },
    entryWrapper: {
      marginHorizontal: 16,
      marginTop: 8,
      borderRadius: 10,
      overflow: "hidden",
    },
    deleteBackground: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.destructive,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
    },
    entry: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    entryName: {
      fontSize: 16,
      fontWeight: "600",
    },
    entryAge: {
      fontSize: 14,
      marginLeft: 8,
    },
    entryDueDate: {
      flex: 1,
      textAlign: "right",
      fontSize: 14,
      marginRight: 12,
    },
    deleteButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.deleteButtonBg,
      justifyContent: "center",
      alignItems: "center",
    },
  });
}
