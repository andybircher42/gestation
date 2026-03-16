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
  LayoutAnimation,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useSwipeDismiss } from "@/hooks";
import { Entry } from "@/storage";
import { ColorTokens, useTheme } from "@/theme";
import {
  formatDueDate,
  gestationalAgeFromDueDate,
  getBirthstone,
  getBirthstoneImage,
} from "@/util";

import BirthstoneIcon from "./BirthstoneIcon";
import EntryDetailModal from "./EntryDetailModal";
import EntryForm from "./EntryForm";
import {
  DEFAULT_DIR,
  SORT_FIELDS,
  type SortBy,
  type SortDir,
} from "./SortPickerModal";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type EntryStyles = ReturnType<typeof createStyles>;

interface EntryRowProps {
  item: Entry;
  backgroundColor: string;
  textColor: string;
  onDelete: (id: string) => void;
  onDeliver: (id: string) => void;
  onPress: (entry: Entry) => void;
  nameWidth?: number;
  onNameLayout?: (id: string, width: number) => void;
  styles: EntryStyles;
  deleteIconColor: string;
}

interface EntryListProps {
  entries: Entry[];
  onDelete: (id: string) => void;
  onDeliver: (id: string) => void;
  onDeleteAll: () => void;
  onAdd: (entry: { name: string; dueDate: string }) => void;
}

/** Individual entry row with swipe-to-delete support. */
const EntryRow = React.memo(function EntryRow({
  item,
  backgroundColor,
  textColor,
  onDelete,
  onDeliver,
  onPress,
  nameWidth,
  onNameLayout,
  styles,
  deleteIconColor,
}: EntryRowProps) {
  const { weeks, days } = gestationalAgeFromDueDate(item.dueDate);
  const SWIPE_THRESHOLD = 80;
  const { animatedValue: translateX, panHandlers } = useSwipeDismiss({
    axis: "x",
    threshold: SWIPE_THRESHOLD,
    onDismiss: () => onDelete(item.id),
    onDismissPositive: () => onDeliver(item.id),
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

  // Show deliver background when swiping right, delete when swiping left
  const deliverBgOpacity = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const deleteBgOpacity = translateX.interpolate({
    inputRange: [-1, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  // Icon opacity and scale ramp up as swipe approaches threshold
  const deliverIconOpacity = translateX.interpolate({
    inputRange: [0, SWIPE_THRESHOLD * 0.3, SWIPE_THRESHOLD],
    outputRange: [0, 0.5, 1],
    extrapolate: "clamp",
  });
  const deliverIconScale = translateX.interpolate({
    inputRange: [0, SWIPE_THRESHOLD * 0.5, SWIPE_THRESHOLD],
    outputRange: [0.6, 0.8, 1],
    extrapolate: "clamp",
  });
  const deleteIconOpacity = translateX.interpolate({
    inputRange: [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD * 0.3, 0],
    outputRange: [1, 0.5, 0],
    extrapolate: "clamp",
  });
  const deleteIconScale = translateX.interpolate({
    inputRange: [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD * 0.5, 0],
    outputRange: [1, 0.8, 0.6],
    extrapolate: "clamp",
  });

  return (
    <Animated.View style={[styles.entryWrapper, { opacity: fadeIn }]}>
      <View style={styles.swipeBackground} testID="delete-background">
        <Animated.View
          style={[
            styles.swipeBgLayer,
            styles.swipeDeliverBg,
            { opacity: deliverBgOpacity },
          ]}
        />
        <Animated.View
          style={[
            styles.swipeBgLayer,
            styles.swipeDeleteBg,
            { opacity: deleteBgOpacity },
          ]}
        />
        <View style={styles.swipeDeliverSide}>
          <Animated.View
            style={[
              styles.swipeIconGroup,
              {
                opacity: deliverIconOpacity,
                transform: [{ scale: deliverIconScale }],
              },
            ]}
          >
            <Ionicons
              name="heart"
              size={22}
              color={deleteIconColor}
              accessible={false}
            />
            <Text style={styles.swipeLabel}>Delivered</Text>
          </Animated.View>
        </View>
        <View style={styles.swipeDeleteSide}>
          <Animated.View
            style={[
              styles.swipeIconGroup,
              {
                opacity: deleteIconOpacity,
                transform: [{ scale: deleteIconScale }],
              },
            ]}
          >
            <Text style={styles.swipeLabel}>Delete</Text>
            <Ionicons
              name="trash-outline"
              size={22}
              color={deleteIconColor}
              accessible={false}
            />
          </Animated.View>
        </View>
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
        <Pressable
          style={styles.entryContent}
          onPress={() => onPress(item)}
          accessibilityRole="button"
          accessibilityLabel={`View details for ${item.name}`}
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
          {item.birthstone && (
            <BirthstoneIcon
              image={getBirthstoneImage(item.birthstone.name)}
              size={24}
            />
          )}
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
});

/** Scrollable list of gestation entries with swipe-to-delete support. */
export default function EntryList({
  entries,
  onDelete,
  onDeliver,
  onDeleteAll,
  onAdd,
}: EntryListProps) {
  const { colors, rowColors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [sortBy, setSortBy] = useState<SortBy>("dueDate");
  const [sortDir, setSortDir] = useState<SortDir>(DEFAULT_DIR.dueDate);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const nameWidths = useRef(new Map<string, number>());
  const [maxNameWidth, setMaxNameWidth] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const formKey = useRef(0);

  const toggleForm = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowForm((prev) => {
      if (!prev) {
        formKey.current += 1;
      }
      return !prev;
    });
  }, []);

  const toggleBatchMode = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setBatchMode((prev) => !prev);
  }, []);

  const handleAdd = useCallback(
    (entry: { name: string; dueDate: string }) => {
      onAdd(entry);
    },
    [onAdd],
  );

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

  const renderItem = useCallback(
    ({ item, index }: { item: Entry; index: number }) => (
      <EntryRow
        item={item}
        backgroundColor={rowColors[index % rowColors.length]}
        textColor={colors.textEntryRow}
        onDelete={onDelete}
        onDeliver={onDeliver}
        onPress={setSelectedEntry}
        nameWidth={maxNameWidth}
        onNameLayout={handleNameLayout}
        styles={styles}
        deleteIconColor={colors.white}
      />
    ),
    [
      rowColors,
      colors,
      onDelete,
      onDeliver,
      maxNameWidth,
      handleNameLayout,
      styles,
    ],
  );

  const keyExtractor = useCallback((item: Entry) => item.id, []);

  return (
    <View style={styles.listContainer}>
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
          <EntryForm
            key={formKey.current}
            onAdd={handleAdd}
            batch={batchMode}
          />
        </View>
      ) : (
        <Pressable
          style={[
            styles.addButton,
            {
              borderColor: colors.primary,
              backgroundColor: colors.primaryLightBg,
            },
          ]}
          onPress={toggleForm}
          accessibilityRole="button"
          accessibilityLabel="Add someone new"
        >
          <BirthstoneIcon image={currentMonthGem} size={20} />
          <Text
            style={[
              styles.addButtonText,
              { color: colors.primary, marginHorizontal: 8 },
            ]}
          >
            Add someone
          </Text>
          <BirthstoneIcon image={currentMonthGem} size={20} />
        </Pressable>
      )}
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
        data={sorted}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        style={styles.list}
        removeClippedSubviews={Platform.OS === "android"}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={11}
        contentContainerStyle={
          sorted.length === 0 ? styles.emptyList : undefined
        }
        ListEmptyComponent={
          <Pressable
            style={styles.emptyContent}
            onPress={toggleForm}
            accessibilityRole="button"
            accessibilityLabel="Add your first client"
          >
            <Ionicons
              name="calendar-outline"
              size={48}
              color={colors.textTertiary}
            />
            <Text style={styles.emptyTitle}>Track your first pregnancy</Text>
            <Text style={styles.emptySubtitle}>
              Enter a name and due date to start
            </Text>
          </Pressable>
        }
      />
      <EntryDetailModal
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
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
    addButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: 16,
      marginTop: 12,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 2,
      gap: 10,
    },
    addButtonText: {
      fontSize: 16,
      fontWeight: "600",
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
    list: {
      flex: 1,
    },
    emptyList: {
      flexGrow: 1,
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
    swipeBackground: {
      ...StyleSheet.absoluteFillObject,
      flexDirection: "row",
    },
    swipeBgLayer: {
      ...StyleSheet.absoluteFillObject,
    },
    swipeDeliverBg: {
      backgroundColor: colors.primary,
    },
    swipeDeleteBg: {
      backgroundColor: colors.destructive,
    },
    swipeDeliverSide: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      paddingLeft: 20,
    },
    swipeDeleteSide: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      paddingRight: 20,
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
    entry: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 16,
      gap: 6,
    },
    entryContent: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
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
  });
}
