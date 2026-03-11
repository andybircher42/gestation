import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ColorTokens, useTheme } from "@/theme";

import EntryForm from "./EntryForm";

interface EntryFormModalProps {
  onAdd: (entry: { name: string; dueDate: string }) => void;
}

export interface EntryFormModalHandle {
  open: () => void;
}

/** Modal overlay containing the EntryForm. Opened via the imperative `open()` handle. */
const EntryFormModal = forwardRef<EntryFormModalHandle, EntryFormModalProps>(
  function EntryFormModal({ onAdd }, ref) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [isOpen, setIsOpen] = useState(false);
    const formKey = useRef(0);

    const open = useCallback(() => {
      formKey.current += 1;
      setIsOpen(true);
    }, []);

    useImperativeHandle(ref, () => ({ open }), [open]);

    const handleAdd = useCallback(
      (entry: { name: string; dueDate: string }) => {
        onAdd(entry);
        setIsOpen(false);
      },
      [onAdd],
    );

    const close = useCallback(() => setIsOpen(false), []);

    return (
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
              <Text style={styles.modalTitle}>Add someone</Text>
              <Pressable
                onPress={close}
                accessibilityRole="button"
                accessibilityLabel="Close form"
                hitSlop={8}
              >
                <Ionicons name="close" size={24} color={colors.textTertiary} />
              </Pressable>
            </View>
            <EntryForm key={formKey.current} onAdd={handleAdd} />
          </View>
        </View>
      </Modal>
    );
  },
);

export default EntryFormModal;

/** Creates styles based on the active color palette. */
function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
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
      fontSize: 20,
      fontWeight: "700",
      color: colors.textPrimary,
    },
  });
}
