import { Image, ImageSourcePropType, View } from "react-native";

interface BirthstoneIconProps {
  image: ImageSourcePropType;
  size?: number;
}

const SHADOW_INSET = 0.15;

/**
 *
 */
export default function BirthstoneIcon({
  image,
  size = 40,
}: BirthstoneIconProps) {
  const padding = size * SHADOW_INSET;
  const imageSize = size + padding * 2;

  return (
    <View style={{ width: size, height: size }}>
      <Image
        source={image}
        style={{
          width: imageSize,
          height: imageSize,
          marginTop: -padding,
          marginLeft: -padding,
        }}
        resizeMode="contain"
      />
    </View>
  );
}
