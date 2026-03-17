import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ColorTokens, RadiiTokens, useTheme } from "@/theme";

import EntryForm from "./EntryForm";
import HelpButton from "./HelpButton";

interface InlineFormWrapperProps {
  formKey: number;
  batchMode: boolean;
  onAdd: (entry: { name: string; dueDate: string }) => void;
  onToggleBatchMode: () => void;
  onClose: () => void;
}

/** Shared inline form container with batch toggle and close button. */
export default function InlineFormWrapper({
  formKey,
  batchMode,
  onAdd,
  onToggleBatchMode,
  onClose,
}: InlineFormWrapperProps) {
  const { colors, radii } = useTheme();
  const styles = useMemo(() => createStyles(colors, radii), [colors, radii]);

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <View style={styles.leftGroup}>
          <Pressable
            onPress={onToggleBatchMode}
            accessibilityRole="button"
            accessibilityLabel={
              batchMode ? "Switch to single entry" : "Switch to batch entry"
            }
          >
            <Text style={styles.batchToggleText}>
              {batchMode ? "Add one at a time" : "Add multiple"}
            </Text>
          </Pressable>
          <HelpButton
            title="Birth symbols"
            message="Each person gets a birthstone gem, birth flower, or zodiac sign based on their due date month. Tap any entry to see which one they got."
            size={14}
          />
        </View>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close form"
          hitSlop={8}
        >
          <Ionicons name="close" size={20} color={colors.textTertiary} />
        </Pressable>
      </View>
      <EntryForm key={formKey} onAdd={onAdd} batch={batchMode} />
    </View>
  );
}

function createStyles(colors: ColorTokens, radii: RadiiTokens) {
  return StyleSheet.create({
    container: {
      marginHorizontal: 16,
      marginTop: 12,
      borderRadius: radii.lg,
      backgroundColor: colors.contentBackground,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    toolbar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingTop: 6,
      paddingBottom: 2,
    },
    leftGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    batchToggleText: {
      fontSize: 12,
      color: colors.primary,
      textDecorationLine: "underline",
    },
  });
}
