import { StyleSheet, View } from "react-native";

interface BirthstoneIconProps {
  color: string;
  size?: number;
}

/**
 *
 */
export default function BirthstoneIcon({
  color,
  size = 40,
}: BirthstoneIconProps) {
  return (
    <View
      style={[
        styles.gem,
        {
          width: size,
          height: size,
          backgroundColor: color,
          transform: [{ rotate: "45deg" }],
          borderRadius: size * 0.2,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  gem: {
    opacity: 0.9,
  },
});
