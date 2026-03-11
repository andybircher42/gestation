import { useCallback, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ColorTokens, useTheme } from "@/theme";

import EntryForm from "./EntryForm";

interface EntryFormModalProps {
  onAdd: (entry: { name: string; dueDate: string }) => void;
}

/** FAB that opens EntryForm in a centered modal overlay. */
export default function EntryFormModal({ onAdd }: EntryFormModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isOpen, setIsOpen] = useState(false);

  const handleAdd = useCallback(
    (entry: { name: string; dueDate: string }) => {
      onAdd(entry);
      setIsOpen(false);
    },
    [onAdd],
  );

  const close = useCallback(() => setIsOpen(false), []);

  return (
    <>
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={close}
            accessible={false}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Entry</Text>
              <Pressable
                onPress={close}
                accessibilityRole="button"
                accessibilityLabel="Close form"
                hitSlop={8}
              >
                <Ionicons name="close" size={24} color={colors.textTertiary} />
              </Pressable>
            </View>
            <EntryForm onAdd={handleAdd} />
          </View>
        </View>
      </Modal>
      {!isOpen && (
        <Pressable
          style={styles.fab}
          onPress={() => setIsOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Add new entry"
        >
          <Ionicons name="add" size={28} color={colors.white} />
        </Pressable>
      )}
    </>
  );
}

/** Creates styles based on the active color palette. */
function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    fab: {
      position: "absolute",
      bottom: 24,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      elevation: 6,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      zIndex: 20,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.modalOverlay,
      justifyContent: "center",
      padding: 16,
    },
    modalContent: {
      backgroundColor: colors.contentBackground,
      borderRadius: 16,
      overflow: "hidden",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 4,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.textPrimary,
    },
  });
}
