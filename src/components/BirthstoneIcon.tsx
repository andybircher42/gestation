import { Image, ImageSourcePropType, StyleSheet } from "react-native";

interface BirthstoneIconProps {
  image: ImageSourcePropType;
  size?: number;
}

/**
 *
 */
export default function BirthstoneIcon({
  image,
  size = 40,
}: BirthstoneIconProps) {
  return (
    <Image
      source={image}
      style={[styles.gem, { width: size, height: size }]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  gem: {},
});
