import React, { useMemo } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ColorTokens, useTheme } from "@/theme";

export type SortBy = "dueDate" | "name" | "none";
export type SortDir = "asc" | "desc";

export interface SortOption {
  field: SortBy;
  dir: SortDir;
  label: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { field: "none", dir: "desc", label: "Recently added" },
  { field: "dueDate", dir: "desc", label: "Due date (soonest first)" },
  { field: "dueDate", dir: "asc", label: "Due date (furthest first)" },
  { field: "name", dir: "asc", label: "Name (A\u2013Z)" },
  { field: "name", dir: "desc", label: "Name (Z\u2013A)" },
];

/** Sort field options for the cycling field button. */
export const SORT_FIELDS: { field: SortBy; label: string }[] = [
  { field: "dueDate", label: "Date" },
  { field: "name", label: "Name" },
  { field: "none", label: "No sort" },
];

/** Default direction for each sort field. */
export const DEFAULT_DIR: Record<SortBy, SortDir> = {
  dueDate: "desc",
  name: "asc",
  none: "desc",
};

interface SortPickerModalProps {
  visible: boolean;
  sortBy: SortBy;
  sortDir: SortDir;
  onSelect: (field: SortBy, dir: SortDir) => void;
  onClose: () => void;
}

/**
 *
 */
export default function SortPickerModal({
  visible,
  sortBy,
  sortDir,
  onSelect,
  onClose,
}: SortPickerModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.overlay}
        onPress={onClose}
        accessibilityViewIsModal
      >
        <View style={styles.sheet}>
          <Text style={styles.title}>Sort by</Text>
          {SORT_OPTIONS.map((o) => {
            const active = o.field === sortBy && o.dir === sortDir;
            return (
              <Pressable
                key={`${o.field}-${o.dir}`}
                style={styles.option}
                onPress={() => {
                  onSelect(o.field, o.dir);
                  onClose();
                }}
                accessibilityRole="button"
                accessibilityLabel={o.label}
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.optionText, active && styles.activeText]}>
                  {o.label}
                </Text>
                {active && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </Pressable>
            );
          })}
          <Pressable
            style={styles.cancelButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.modalOverlay,
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: colors.contentBackground,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingTop: 16,
      paddingBottom: 32,
      paddingHorizontal: 16,
    },
    title: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.textPrimary,
      textAlign: "center",
      marginBottom: 12,
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
      paddingHorizontal: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    optionText: {
      fontSize: 16,
      color: colors.textPrimary,
    },
    activeText: {
      fontWeight: "600",
      color: colors.primary,
    },
    cancelButton: {
      marginTop: 12,
      alignItems: "center",
      paddingVertical: 14,
    },
    cancelText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textTertiary,
    },
  });
}
