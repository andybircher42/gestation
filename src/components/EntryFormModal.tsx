import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ColorTokens, useTheme } from "@/theme";

import EntryForm from "./EntryForm";

interface EntryFormModalProps {
  onAdd: (entry: { name: string; dueDate: string }) => void;
}

export interface EntryFormModalHandle {
  open: () => void;
}

/** FAB that opens EntryForm in a centered modal overlay. */
const EntryFormModal = forwardRef<EntryFormModalHandle, EntryFormModalProps>(
  function EntryFormModal({ onAdd }, ref) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [isOpen, setIsOpen] = useState(false);
    const formKey = useRef(0);
    const fabScale = useRef(new Animated.Value(1)).current;

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

    useEffect(() => {
      Animated.timing(fabScale, {
        toValue: isOpen ? 0 : 1,
        duration: isOpen ? 150 : 250,
        easing: isOpen
          ? Easing.out(Easing.quad)
          : Easing.out(Easing.bezier(0.25, 1, 0.5, 1)),
        useNativeDriver: true,
      }).start();
    }, [isOpen, fabScale]);

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
                  <Ionicons
                    name="close"
                    size={24}
                    color={colors.textTertiary}
                  />
                </Pressable>
              </View>
              <EntryForm key={formKey.current} onAdd={handleAdd} />
            </View>
          </View>
        </Modal>
        <Animated.View
          style={[
            styles.fabContainer,
            { transform: [{ scale: fabScale }], opacity: fabScale },
          ]}
          pointerEvents={isOpen ? "none" : "auto"}
        >
          <Pressable
            style={styles.fab}
            onPress={open}
            accessibilityRole="button"
            accessibilityLabel="Add new entry"
          >
            <Ionicons name="add" size={28} color={colors.white} />
          </Pressable>
        </Animated.View>
      </>
    );
  },
);

export default EntryFormModal;

/** Creates styles based on the active color palette. */
function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    fabContainer: {
      position: "absolute",
      bottom: 24,
      right: 20,
      zIndex: 20,
    },
    fab: {
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
      fontSize: 20,
      fontWeight: "700",
      color: colors.textPrimary,
    },
  });
}
