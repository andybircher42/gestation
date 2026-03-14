import { useMemo } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Entry } from "@/storage";
import { ColorTokens, useTheme } from "@/theme";
import {
  deliveryTimingLabel,
  formatDueDate,
  gestationalAgeFromDueDate,
  getBirthstoneImage,
  lineHeight,
} from "@/util";

import BirthstoneIcon from "./BirthstoneIcon";

interface EntryDetailModalProps {
  entry: Entry | null;
  onClose: () => void;
}

/** Modal showing detailed info for a single entry. */
export default function EntryDetailModal({
  entry,
  onClose,
}: EntryDetailModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!entry) {
    return null;
  }

  const { weeks, days } = gestationalAgeFromDueDate(entry.dueDate);
  const isDelivered = !!entry.deliveredAt;

  const deliveredDateStr = isDelivered
    ? new Date(entry.deliveredAt!).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const timingLabel = isDelivered
    ? deliveryTimingLabel(entry.dueDate, entry.deliveredAt!)
    : "";

  return (
    <Modal
      visible={!!entry}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close details"
      >
        <Pressable
          style={[
            styles.card,
            entry.birthstone && { backgroundColor: entry.birthstone.color },
          ]}
          onPress={() => {}}
          accessible={false}
        >
          {isDelivered && <Text style={styles.deliveredEmoji}>👶</Text>}
          {entry.birthstone && !isDelivered && (
            <BirthstoneIcon
              image={getBirthstoneImage(entry.birthstone.name)}
              size={48}
            />
          )}
          <Text style={styles.name}>{entry.name}</Text>

          <View style={styles.details}>
            {isDelivered && (
              <>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Delivered</Text>
                  <Text style={styles.detailValue}>{deliveredDateStr}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Timing</Text>
                  <Text style={styles.detailValue}>{timingLabel}</Text>
                </View>
              </>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Due date</Text>
              <Text style={styles.detailValue}>
                {formatDueDate(entry.dueDate)}
              </Text>
            </View>
            {!isDelivered && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Gestational age</Text>
                <Text style={styles.detailValue}>
                  {weeks}w {days}d
                </Text>
              </View>
            )}
            {entry.birthstone && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Birthstone</Text>
                <Text style={styles.detailValue}>{entry.birthstone.name}</Text>
              </View>
            )}
          </View>

          <Pressable
            style={styles.closeButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Text style={styles.closeText}>Done</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: colors.modalOverlay,
      justifyContent: "center",
      alignItems: "center",
      padding: 32,
    },
    card: {
      width: "100%",
      backgroundColor: colors.primary,
      borderRadius: 16,
      padding: 24,
      alignItems: "center",
      gap: 12,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 12,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    deliveredEmoji: {
      fontSize: 48,
    },
    name: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.textOnColor,
      textAlign: "center",
    },
    details: {
      width: "100%",
      gap: 8,
      marginTop: 4,
    },
    detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    detailLabel: {
      fontSize: 14,
      color: colors.textOnColorMuted,
    },
    detailValue: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textOnColor,
      lineHeight: lineHeight(18),
    },
    closeButton: {
      marginTop: 8,
      paddingVertical: 10,
      paddingHorizontal: 32,
      borderRadius: 8,
      backgroundColor: colors.overlayOnColor,
    },
    closeText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textOnColor,
    },
  });
}
