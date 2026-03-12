/* eslint-disable @typescript-eslint/no-require-imports */
import { ImageSourcePropType } from "react-native";

export interface Birthstone {
  name: string;
  color: string;
}

interface BirthstoneData extends Birthstone {
  image: ImageSourcePropType;
}

const BIRTHSTONES: Record<number, BirthstoneData> = {
  1: {
    name: "Garnet",
    color: "#D81B7A",
    image:
      require("../../assets/birthstones/1-january-garnet.png") as ImageSourcePropType,
  },
  2: {
    name: "Amethyst",
    color: "#8B44CC",
    image:
      require("../../assets/birthstones/2-february-amethyst.png") as ImageSourcePropType,
  },
  3: {
    name: "Aquamarine",
    color: "#00D4D4",
    image:
      require("../../assets/birthstones/3-march-aquamarine.png") as ImageSourcePropType,
  },
  4: {
    name: "Diamond",
    color: "#29B6F6",
    image:
      require("../../assets/birthstones/4-april-diamond.png") as ImageSourcePropType,
  },
  5: {
    name: "Emerald",
    color: "#3A9A6A",
    image:
      require("../../assets/birthstones/5-may-emerald.png") as ImageSourcePropType,
  },
  6: {
    name: "Pearl",
    color: "#B0B8E8",
    image:
      require("../../assets/birthstones/6-june-pearl.png") as ImageSourcePropType,
  },
  7: {
    name: "Ruby",
    color: "#E53935",
    image:
      require("../../assets/birthstones/7-july-ruby.png") as ImageSourcePropType,
  },
  8: {
    name: "Peridot",
    color: "#6EE635",
    image:
      require("../../assets/birthstones/8-august-peridot.png") as ImageSourcePropType,
  },
  9: {
    name: "Sapphire",
    color: "#1565C0",
    image:
      require("../../assets/birthstones/9-september-sapphire.png") as ImageSourcePropType,
  },
  10: {
    name: "Opal",
    color: "#F5C48A",
    image:
      require("../../assets/birthstones/10-october-opal.png") as ImageSourcePropType,
  },
  11: {
    name: "Topaz",
    color: "#FFA000",
    image:
      require("../../assets/birthstones/11-november-topaz.png") as ImageSourcePropType,
  },
  12: {
    name: "Turquoise",
    color: "#1E88E5",
    image:
      require("../../assets/birthstones/12-december-turquoise.png") as ImageSourcePropType,
  },
};

export { BIRTHSTONES };

/** Returns the birthstone for a given month (1-12). Falls back to January for invalid input. */
export function getBirthstone(month: number): Birthstone {
  const data =
    month < 1 || month > 12 || !Number.isInteger(month)
      ? BIRTHSTONES[1]
      : BIRTHSTONES[month];
  return { name: data.name, color: data.color };
}

/** Returns the birthstone for a given ISO date string based on its month. */
export function getBirthstoneForDate(isoDate: string): Birthstone {
  const month = new Date(isoDate).getUTCMonth() + 1;
  return getBirthstone(month);
}

/** Look up the birthstone image by name (for rendering from stored entry data). */
const IMAGE_BY_NAME = new Map<string, ImageSourcePropType>(
  Object.values(BIRTHSTONES).map((b) => [b.name, b.image]),
);

/** Returns the image source for a birthstone by name. Falls back to Garnet. */
export function getBirthstoneImage(name: string): ImageSourcePropType {
  return IMAGE_BY_NAME.get(name) ?? BIRTHSTONES[1].image;
}
