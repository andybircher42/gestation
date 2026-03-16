import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Entry } from "@/storage";
import { ColorTokens, useTheme } from "@/theme";
import { getBirthstone, getBirthstoneImage } from "@/util";

import BirthstoneIcon from "./BirthstoneIcon";
import EntryCard from "./EntryCard";
import EntryDetailModal from "./EntryDetailModal";
import EntryForm from "./EntryForm";
import {
  DEFAULT_DIR,
  SORT_FIELDS,
  type SortBy,
  type SortDir,
} from "./SortPickerModal";

interface EntryGridProps {
  entries: Entry[];
  onDelete: (id: string) => void;
  onDeliver: (id: string) => void;
  onDeleteAll: () => void;
  onAdd: (entry: { name: string; dueDate: string }) => void;
}

type GridItem = Entry | "add" | "spacer";

/** Cozy 2-column card grid layout for entries. */
export default function EntryGrid({
  entries,
  onDelete,
  onDeliver,
  onDeleteAll,
  onAdd,
}: EntryGridProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [showForm, setShowForm] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("none");
  const [sortDir, setSortDir] = useState<SortDir>(DEFAULT_DIR.none);
  const formKeyRef = React.useRef(0);

  const toggleForm = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowForm((prev) => {
      if (!prev) {
        formKeyRef.current += 1;
      }
      return !prev;
    });
  }, []);

  const toggleBatchMode = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setBatchMode((prev) => !prev);
  }, []);

  const cycleSortField = useCallback(() => {
    setSortBy((prev) => {
      const idx = SORT_FIELDS.findIndex((f) => f.field === prev);
      const next = SORT_FIELDS[(idx + 1) % SORT_FIELDS.length];
      setSortDir(DEFAULT_DIR[next.field]);
      return next.field;
    });
  }, []);

  const toggleSortDir = useCallback(() => {
    setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
  }, []);

  const currentMonthGem = useMemo(
    () => getBirthstoneImage(getBirthstone(new Date().getMonth() + 1).name),
    [],
  );

  const activeEntries = useMemo(
    () => entries.filter((e) => !e.deliveredAt),
    [entries],
  );

  const sorted = useMemo(() => {
    if (sortBy === "none") {
      const copy = [...activeEntries];
      copy.sort((a, b) => b.createdAt - a.createdAt);
      return copy;
    }
    const copy = [...activeEntries];
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
  }, [activeEntries, sortBy, sortDir]);

  const handleLongPress = useCallback(
    (entry: Entry) => {
      Alert.alert(entry.name, undefined, [
        {
          text: "Delivered",
          onPress: () => onDeliver(entry.id),
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => onDelete(entry.id),
        },
        { text: "Cancel", style: "cancel" },
      ]);
    },
    [onDelete, onDeliver],
  );

  const gridData: GridItem[] = useMemo(() => {
    const data: GridItem[] = [...sorted, "add" as const];
    if (data.length % 2 !== 0) {
      data.push("spacer" as const);
    }
    return data;
  }, [sorted]);

  const renderItem = useCallback(
    ({ item }: { item: GridItem }) => {
      if (item === "spacer") {
        return <View style={styles.spacer} />;
      }
      if (item === "add") {
        return (
          <Pressable
            style={styles.addCard}
            onPress={toggleForm}
            accessibilityRole="button"
            accessibilityLabel="Add someone new"
            testID="add-card"
          >
            <BirthstoneIcon image={currentMonthGem} size={40} />
            <Text style={styles.addText}>Add someone</Text>
          </Pressable>
        );
      }
      return (
        <EntryCard
          entry={item}
          onPress={setSelectedEntry}
          onLongPress={handleLongPress}
        />
      );
    },
    [styles, toggleForm, handleLongPress, currentMonthGem],
  );

  const keyExtractor = useCallback(
    (item: GridItem) =>
      item === "add" ? "add-btn" : item === "spacer" ? "spacer" : item.id,
    [],
  );

  if (entries.length === 0 && !showForm) {
    return (
      <View style={styles.container}>
        <Pressable
          style={styles.emptyCard}
          onPress={toggleForm}
          accessibilityRole="button"
          accessibilityLabel="Add someone new"
        >
          <BirthstoneIcon image={currentMonthGem} size={64} />
          <Text style={styles.emptyCardTitle}>Ready when you are</Text>
          <Text style={styles.emptyCardSubtitle}>Tap here to add someone</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showForm ? (
        <View style={styles.inlineFormContainer}>
          <View style={styles.formToolbar}>
            <Pressable
              onPress={toggleBatchMode}
              accessibilityRole="button"
              accessibilityLabel={
                batchMode ? "Switch to single entry" : "Switch to batch entry"
              }
            >
              <Text style={styles.batchToggleText}>
                {batchMode ? "Add one at a time" : "Add multiple"}
              </Text>
            </Pressable>
            <Pressable
              onPress={toggleForm}
              accessibilityRole="button"
              accessibilityLabel="Close form"
              hitSlop={8}
            >
              <Ionicons name="close" size={20} color={colors.textTertiary} />
            </Pressable>
          </View>
          <EntryForm key={formKeyRef.current} onAdd={onAdd} batch={batchMode} />
        </View>
      ) : null}
      {sorted.length > 0 && (
        <View style={styles.toolbarRow}>
          {sortBy !== "none" ? (
            <Pressable
              onPress={toggleSortDir}
              accessibilityRole="button"
              accessibilityLabel={`Direction: ${sortDir === "asc" ? "ascending" : "descending"}. Tap to flip.`}
              hitSlop={8}
              style={styles.sortDirButton}
            >
              <Ionicons
                name={sortDir === "asc" ? "arrow-up" : "arrow-down"}
                size={16}
                color={colors.textTertiary}
              />
            </Pressable>
          ) : (
            <View style={styles.sortDirPlaceholder} />
          )}
          <Pressable
            onPress={cycleSortField}
            accessibilityRole="button"
            accessibilityLabel={`Sort by: ${SORT_FIELDS.find((f) => f.field === sortBy)?.label}. Tap to change.`}
            hitSlop={8}
            style={styles.sortButton}
          >
            <Text style={styles.sortLabel}>
              {SORT_FIELDS.find((f) => f.field === sortBy)?.label}
            </Text>
          </Pressable>
          <View style={styles.toolbarSpacer} />
          <Pressable
            style={styles.deleteAllButton}
            onPress={() =>
              Alert.alert(
                "Remove everyone?",
                `This will remove all ${sorted.length} people from your list. This can\u2019t be undone.`,
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
          >
            <Text style={styles.deleteAllText}>Remove all</Text>
          </Pressable>
        </View>
      )}
      <FlatList
        data={gridData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.gridRow}
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
    addCard: {
      flex: 1,
      aspectRatio: 1,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.contentBackground,
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
    },
    addText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
    },
    inlineFormContainer: {
      marginHorizontal: 16,
      marginTop: 12,
      borderRadius: 12,
      backgroundColor: colors.contentBackground,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    formToolbar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingTop: 6,
      paddingBottom: 2,
    },
    batchToggleText: {
      fontSize: 12,
      color: colors.primary,
      textDecorationLine: "underline",
    },
    toolbarRow: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 16,
      marginTop: 12,
      gap: 10,
    },
    sortButton: {
      flexDirection: "row",
      alignItems: "center",
      height: 44,
      paddingHorizontal: 4,
    },
    sortLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textTertiary,
      textDecorationLine: "underline",
    },
    sortDirButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
    },
    sortDirPlaceholder: {
      width: 36,
      height: 36,
    },
    toolbarSpacer: {
      flex: 1,
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
    emptyCard: {
      marginHorizontal: 32,
      marginTop: 32,
      paddingVertical: 40,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.contentBackground,
      alignItems: "center",
      gap: 12,
    },
    emptyCardTitle: {
      color: colors.textPrimary,
      fontSize: 18,
      fontWeight: "600",
    },
    emptyCardSubtitle: {
      color: colors.textTertiary,
      fontSize: 14,
    },
    emptyContent: {
      flex: 1,
      justifyContent: "center",
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
  });
}
