import { Alert, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/theme";

interface HelpButtonProps {
  /** Alert title (shown bold at top). */
  title: string;
  /** Alert body message. */
  message: string;
  /** Icon size — defaults to 20. */
  size?: number;
}

/** A (?) icon that shows an alert with contextual help text. */
export default function HelpButton({
  title,
  message,
  size = 20,
}: HelpButtonProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={() => Alert.alert(title, message)}
      accessibilityRole="button"
      accessibilityLabel={`${title} info`}
      hitSlop={8}
    >
      <Ionicons
        name="help-circle-outline"
        size={size}
        color={colors.textTertiary}
      />
    </Pressable>
  );
}
