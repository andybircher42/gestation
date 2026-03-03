import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  LayoutChangeEvent,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Entry } from "@/storage";
import { formatDueDate } from "@/util/dateUtils";
import { gestationalAgeFromDueDate } from "@/util/gestationalAge";

type SortBy = "dueDate" | "name";
type SortDir = "asc" | "desc";

const DEFAULT_DIR: Record<SortBy, SortDir> = {
  dueDate: "desc",
  name: "asc",
};

const SWIPE_THRESHOLD = 100;

const ROW_COLORS = [
  "#EF9A9A", // red
  "#FFCC80", // orange
  "#FFF176", // yellow
  "#A5D6A7", // green
  "#90CAF9", // blue
  "#B39DDB", // indigo
  "#CE93D8", // violet
];

interface EntryRowProps {
  item: Entry;
  colorIndex: number;
  onDelete: (id: string) => void;
  nameWidth?: number;
  onNameLayout?: (id: string, width: number) => void;
}

interface EntryListProps {
  entries: Entry[];
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
}

/** Individual entry row with swipe-to-delete support. */
function EntryRow({
  item,
  colorIndex,
  onDelete,
  nameWidth,
  onNameLayout,
}: EntryRowProps) {
  const { weeks, days } = gestationalAgeFromDueDate(item.dueDate);
  const translateX = useRef(new Animated.Value(0)).current;
  const onDeleteRef = useRef(onDelete);
  onDeleteRef.current = onDelete;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 5,
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (Math.abs(gestureState.dx) > SWIPE_THRESHOLD) {
          const direction = gestureState.dx > 0 ? 1 : -1;
          Animated.timing(translateX, {
            toValue: direction * 500,
            duration: 200,
            useNativeDriver: true,
          }).start(() => onDeleteRef.current(item.id));
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  return (
    <View style={styles.entryWrapper}>
      <View style={styles.deleteBackground} testID="delete-background">
        <Ionicons name="trash-outline" size={22} color="#fff" />
        <Ionicons name="trash-outline" size={22} color="#fff" />
      </View>
      <Animated.View
        testID="entry-row"
        style={[
          styles.entry,
          { backgroundColor: ROW_COLORS[colorIndex % ROW_COLORS.length] },
          { transform: [{ translateX }] },
        ]}
        {...panResponder.panHandlers}
      >
        <Text
          style={[
            styles.entryName,
            (nameWidth ?? 0) > 0 && { minWidth: nameWidth },
          ]}
          onLayout={(e: LayoutChangeEvent) =>
            onNameLayout?.(item.id, e.nativeEvent.layout.width)
          }
        >
          {item.name}
        </Text>
        <Text style={styles.entryAge}>
          {weeks}w {days}d
        </Text>
        <Text style={styles.entryDueDate}>{formatDueDate(item.dueDate)}</Text>
        <Pressable
          onPress={() => onDelete(item.id)}
          style={styles.deleteButton}
          hitSlop={8}
        >
          <Text style={styles.deleteText}>✕</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

/** Scrollable list of gestation entries with swipe-to-delete support. */
export default function EntryList({
  entries,
  onDelete,
  onDeleteAll,
}: EntryListProps) {
  const [sortBy, setSortBy] = useState<SortBy>("dueDate");
  const [sortDir, setSortDir] = useState<SortDir>(DEFAULT_DIR.dueDate);
  const nameWidths = useRef(new Map<string, number>());
  const [maxNameWidth, setMaxNameWidth] = useState(0);

  const handleNameLayout = useCallback((id: string, width: number) => {
    nameWidths.current.set(id, width);
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
        const dateDiff = -a.dueDate.localeCompare(b.dueDate);
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

  return (
    <View style={styles.listContainer}>
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
                "Delete All",
                "Are you sure you want to delete all entries?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
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
        renderItem={({ item, index }) => (
          <EntryRow
            item={item}
            colorIndex={index}
            onDelete={onDelete}
            nameWidth={maxNameWidth}
            onNameLayout={handleNameLayout}
          />
        )}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={
          entries.length === 0 ? styles.emptyList : undefined
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No entries yet</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
    borderColor: "#4a90d9",
    overflow: "hidden",
  },
  deleteAllButton: {
    backgroundColor: "#ef4444",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deleteAllText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  sortButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  sortButtonActive: {
    backgroundColor: "#4a90d9",
  },
  sortText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4a90d9",
  },
  sortTextActive: {
    color: "#fff",
  },
  list: {
    flex: 1,
  },
  emptyList: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#999",
    fontSize: 16,
  },
  entryWrapper: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 10,
    overflow: "hidden",
  },
  deleteBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#ef4444",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  entry: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  entryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  entryAge: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  entryDueDate: {
    flex: 1,
    textAlign: "right",
    fontSize: 14,
    color: "#666",
    marginRight: 12,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteText: {
    color: "#999",
    fontSize: 16,
    fontWeight: "600",
  },
});
