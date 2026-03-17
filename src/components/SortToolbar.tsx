import { ReactNode, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useConfirmAlert } from "@/hooks";
import { ColorTokens, useTheme } from "@/theme";

import { SORT_FIELDS, type SortBy, type SortDir } from "./SortPickerModal";

interface SortToolbarProps {
  sortBy: SortBy;
  sortDir: SortDir;
  itemCount: number;
  onCycleField: () => void;
  onToggleDir: () => void;
  onDeleteAll: () => void;
  /** Alert title for the delete-all confirmation. */
  deleteAllTitle?: string;
  /** Alert body for the delete-all confirmation. */
  deleteAllMessage?: string;
  /** Optional element rendered between the sort label and the remove-all button. */
  trailing?: ReactNode;
}

/** Toolbar with sort field cycling, direction toggle, and overflow menu. */
export default function SortToolbar({
  sortBy,
  sortDir,
  itemCount,
  onCycleField,
  onToggleDir,
  onDeleteAll,
  deleteAllTitle = "Remove everyone?",
  deleteAllMessage,
  trailing,
}: SortToolbarProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const confirmAlert = useConfirmAlert();

  const message =
    deleteAllMessage ??
    `This will remove all ${itemCount} people from your list. This can\u2019t be undone.`;

  return (
    <View style={styles.toolbarRow}>
      {sortBy !== "none" ? (
        <Pressable
          onPress={onToggleDir}
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
        onPress={onCycleField}
        accessibilityRole="button"
        accessibilityLabel={`Sort by: ${SORT_FIELDS.find((f) => f.field === sortBy)?.label}. Tap to change.`}
        hitSlop={8}
        style={styles.sortButton}
      >
        <Text style={styles.sortLabel}>
          {SORT_FIELDS.find((f) => f.field === sortBy)?.label}
        </Text>
      </Pressable>
      {trailing}
      <View style={styles.toolbarSpacer} />
      <Pressable
        style={styles.removeAllButton}
        onPress={() =>
          confirmAlert({
            title: deleteAllTitle,
            message,
            onConfirm: onDeleteAll,
          })
        }
        accessibilityRole="button"
        accessibilityLabel="Remove all"
        hitSlop={8}
      >
        <Text style={styles.removeAllLabel}>Remove all</Text>
      </Pressable>
    </View>
  );
}

function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    toolbarRow: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 16,
      marginTop: 12,
      gap: 10,
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
    toolbarSpacer: {
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
  });
}
