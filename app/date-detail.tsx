import { useMemo } from "react";
import {
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { BirthstoneIcon } from "@/components";
import { Entry } from "@/storage";
import { ColorTokens, useTheme } from "@/theme";
import {
  formatDueDate,
  gestationalAgeFromDueDate,
  getBirthstoneImage,
  lineHeight,
} from "@/util";

import splashBgDark from "../assets/splash-bg-dark.png";
import splashBgLight from "../assets/splash-bg-light.png";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatDateHeading(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const month = MONTH_NAMES[m - 1];
  if (!month || isNaN(d) || isNaN(y)) {
    return isoDate;
  }
  return `${month} ${d}, ${y}`;
}

/** Detail screen showing all entries due on a specific date. */
export default function DateDetailScreen() {
  const { colors, rowColors, resolvedTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ date: string; entries: string }>();

  const date = params.date ?? "";
  const entries: Entry[] = useMemo(() => {
    try {
      return JSON.parse(params.entries ?? "[]") as Entry[];
    } catch {
      return [];
    }
  }, [params.entries]);

  const isDark = resolvedTheme === "dark";
  const splashBg = isDark ? splashBgDark : splashBgLight;
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <ImageBackground
      source={splashBg}
      resizeMode="cover"
      style={styles.container}
      accessible={false}
    >
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={10}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerTextGroup}>
          <Text style={styles.headerDate}>{formatDateHeading(date)}</Text>
          <Text style={styles.headerCount}>
            {entries.length} {entries.length === 1 ? "person" : "people"} due
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {entries.map((entry, index) => {
          const { weeks, days } = gestationalAgeFromDueDate(entry.dueDate);
          const bgColor = rowColors[index % rowColors.length];
          return (
            <View
              key={entry.id}
              style={[styles.card, { backgroundColor: bgColor }]}
            >
              <View style={styles.cardHeader}>
                {entry.birthstone && (
                  <BirthstoneIcon
                    image={getBirthstoneImage(entry.birthstone.name)}
                    size={40}
                  />
                )}
                <View style={styles.cardTextGroup}>
                  <Text
                    style={[styles.cardName, { color: colors.textEntryRow }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {entry.name}
                  </Text>
                  <Text
                    style={[styles.cardDueDate, { color: colors.textEntryRow }]}
                  >
                    Due {formatDueDate(entry.dueDate)}
                  </Text>
                </View>
              </View>
              <View style={styles.cardDetails}>
                <View style={styles.detailItem}>
                  <Text
                    style={[styles.detailLabel, { color: colors.textEntryRow }]}
                  >
                    Gestational age
                  </Text>
                  <Text
                    style={[styles.detailValue, { color: colors.textEntryRow }]}
                  >
                    {weeks}w {days}d
                  </Text>
                </View>
                {entry.birthstone && (
                  <View style={styles.detailItem}>
                    <Text
                      style={[
                        styles.detailLabel,
                        { color: colors.textEntryRow },
                      ]}
                    >
                      Birthstone
                    </Text>
                    <Text
                      style={[
                        styles.detailValue,
                        { color: colors.textEntryRow },
                      ]}
                    >
                      {entry.birthstone.name}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          style={[styles.doneButton, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Done"
        >
          <Text style={[styles.doneButtonText, { color: colors.white }]}>
            Done
          </Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}

function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingBottom: 16,
      paddingHorizontal: 20,
      backgroundColor: colors.contentBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 12,
    },
    backButton: {
      width: 36,
      height: 36,
      justifyContent: "center",
      alignItems: "center",
    },
    headerTextGroup: {
      flex: 1,
    },
    headerDate: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    headerCount: {
      fontSize: 14,
      color: colors.textTertiary,
      marginTop: 2,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 16,
      gap: 12,
    },
    card: {
      borderRadius: 12,
      padding: 16,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    cardTextGroup: {
      flex: 1,
    },
    cardName: {
      fontSize: 18,
      fontWeight: "700",
    },
    cardDueDate: {
      fontSize: 14,
      marginTop: 2,
    },
    cardDetails: {
      marginTop: 12,
      gap: 8,
    },
    detailItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    detailLabel: {
      fontSize: 14,
      opacity: 0.7,
    },
    detailValue: {
      fontSize: 14,
      fontWeight: "600",
      lineHeight: lineHeight(18),
    },
    footer: {
      paddingHorizontal: 16,
      paddingTop: 12,
    },
    doneButton: {
      width: "100%",
      height: 52,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    doneButtonText: {
      fontSize: 16,
      fontWeight: "600",
    },
  });
}
