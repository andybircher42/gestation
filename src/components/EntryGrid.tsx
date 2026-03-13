import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  LayoutAnimation,
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
import EntryForm from "./EntryForm";

interface EntryGridProps {
  entries: Entry[];
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
  onAdd: (entry: { name: string; dueDate: string }) => void;
}

type GridItem = Entry | "add";

/** Cozy 2-column card grid layout for entries. */
export default function EntryGrid({
  entries,
  onDelete,
  onDeleteAll,
  onAdd,
}: EntryGridProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [showForm, setShowForm] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
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

  const handleLongPress = useCallback(
    (entry: Entry) => {
      Alert.alert("Remove", `Remove ${entry.name}?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => onDelete(entry.id),
        },
      ]);
    },
    [onDelete],
  );

  const gridData: GridItem[] = useMemo(
    () => [...entries, "add" as const],
    [entries],
  );

  const renderItem = useCallback(
    ({ item }: { item: GridItem }) => {
      if (item === "add") {
        return (
          <Pressable
            style={styles.addCard}
            onPress={toggleForm}
            accessibilityRole="button"
            accessibilityLabel="Add someone new"
            testID="add-card"
          >
            <BirthstoneIcon
              image={getBirthstoneImage(
                getBirthstone(new Date().getMonth() + 1).name,
              )}
              size={40}
            />
            <Text style={styles.addText}>Add someone</Text>
          </Pressable>
        );
      }
      return <EntryCard entry={item} onLongPress={handleLongPress} />;
    },
    [styles, toggleForm, handleLongPress],
  );

  const keyExtractor = useCallback(
    (item: GridItem) => (typeof item === "string" ? "add-btn" : item.id),
    [],
  );

  if (entries.length === 0 && !showForm) {
    return (
      <View style={styles.container}>
        <Pressable
          style={[
            styles.addButtonFull,
            {
              borderColor: colors.primary,
              backgroundColor: colors.primaryLightBg,
            },
          ]}
          onPress={toggleForm}
          accessibilityRole="button"
          accessibilityLabel="Add someone new"
        >
          <BirthstoneIcon
            image={getBirthstoneImage(
              getBirthstone(new Date().getMonth() + 1).name,
            )}
            size={28}
          />
          <Text style={[styles.addButtonFullText, { color: colors.primary }]}>
            Add someone
          </Text>
          <BirthstoneIcon
            image={getBirthstoneImage(
              getBirthstone(new Date().getMonth() + 1).name,
            )}
            size={28}
          />
        </Pressable>
        <View style={styles.emptyContent}>
          <Ionicons
            name="calendar-outline"
            size={48}
            color={colors.textTertiary}
          />
          <Text style={styles.emptyTitle}>Ready when you are</Text>
          <Text style={styles.emptySubtitle}>
            Tap Add someone to get started
          </Text>
        </View>
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
              <Ionicons name="close" size={24} color={colors.textTertiary} />
            </Pressable>
          </View>
          <EntryForm key={formKeyRef.current} onAdd={onAdd} batch={batchMode} />
        </View>
      ) : null}
      {entries.length > 0 && (
        <View style={styles.toolbarRow}>
          <View style={styles.toolbarSpacer} />
          <Pressable
            style={styles.deleteAllButton}
            onPress={() =>
              Alert.alert(
                "Remove everyone?",
                `This will remove all ${entries.length} people you're tracking. You can't undo this.`,
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
    addButtonFull: {
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
    addButtonFullText: {
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
      paddingHorizontal: 16,
      paddingTop: 12,
    },
    batchToggleText: {
      fontSize: 14,
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
