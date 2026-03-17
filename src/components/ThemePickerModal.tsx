import { useMemo } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Brightness,
  ColorTokens,
  Layout,
  Personality,
  RadiiTokens,
  useTheme,
} from "@/theme";

import PillSelector from "./PillSelector";
import type { Ionicons } from "@expo/vector-icons";

const THEME_OPTIONS: {
  value: Personality;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { value: "classic", label: "Classic", icon: "color-palette-outline" },
  { value: "warm", label: "Warm", icon: "flame-outline" },
  { value: "elegant", label: "Elegant", icon: "diamond-outline" },
  { value: "playful", label: "Playful", icon: "heart-outline" },
  { value: "modern", label: "Modern", icon: "cube-outline" },
  { value: "mono", label: "B&W", icon: "ellipse-outline" },
];

const LAYOUT_OPTIONS: {
  value: Layout;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { value: "compact", label: "Compact", icon: "list-outline" },
  { value: "cozy", label: "Cozy", icon: "grid-outline" },
];

const BRIGHTNESS_OPTIONS: {
  value: Brightness;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { value: "system", label: "System", icon: "contrast-outline" },
  { value: "light", label: "Light", icon: "sunny-outline" },
  { value: "dark", label: "Dark", icon: "moon-outline" },
];

interface ThemePickerModalProps {
  visible: boolean;
  currentPersonality: Personality;
  currentBrightness: Brightness;
  currentLayout: Layout;
  onSelectPersonality: (p: Personality) => void;
  onSelectBrightness: (b: Brightness) => void;
  onSelectLayout: (l: Layout) => void;
  onClose: () => void;
  anchor?: { top: number; right: number };
}

/** Dropdown modal for selecting theme, brightness, and layout. */
export default function ThemePickerModal({
  visible,
  currentPersonality,
  currentBrightness,
  currentLayout,
  onSelectPersonality,
  onSelectBrightness,
  onSelectLayout,
  onClose,
  anchor,
}: ThemePickerModalProps) {
  const { colors, radii } = useTheme();
  const styles = useMemo(() => createStyles(colors, radii), [colors, radii]);
  const dropdownPosition = anchor ?? { top: 100, right: 12 };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.container} accessibilityViewIsModal>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close appearance"
        />
        <View style={[styles.dropdown, dropdownPosition]}>
          <Text style={styles.title}>Theme</Text>
          <PillSelector
            options={THEME_OPTIONS}
            selected={currentPersonality}
            onSelect={onSelectPersonality}
          />
          <View style={styles.separator} />
          <Text style={styles.title}>Brightness</Text>
          <PillSelector
            options={BRIGHTNESS_OPTIONS}
            selected={currentBrightness}
            onSelect={onSelectBrightness}
          />
          <View style={styles.separator} />
          <Text style={styles.title}>Layout</Text>
          <PillSelector
            options={LAYOUT_OPTIONS}
            selected={currentLayout}
            onSelect={onSelectLayout}
          />
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: ColorTokens, radii: RadiiTokens) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    dropdown: {
      position: "absolute",
      backgroundColor: colors.contentBackground,
      borderRadius: radii.lg,
      paddingVertical: 8,
      paddingHorizontal: 16,
      minWidth: 220,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    title: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textTertiary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginTop: 4,
      marginBottom: 4,
    },
    separator: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.textTertiary,
      marginVertical: 4,
    },
  });
}
