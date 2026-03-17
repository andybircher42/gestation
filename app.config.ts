import { ConfigContext, ExpoConfig } from "expo/config";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const appJson = require("./app.json") as { expo: ExpoConfig };

// Version 1.3.2 already pushed w/ unused permissions removed.
// Bump version AND runtimeVersion together in app.json when native deps change.

const IS_DEV = process.env.APP_VARIANT === "development";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...appJson.expo,
  ...config,
  name: IS_DEV ? "in due time (Dev)" : appJson.expo.name,
  icon: IS_DEV ? "./assets/icon-dark.png" : undefined,
  ios: {
    ...appJson.expo.ios,
    bundleIdentifier: IS_DEV
      ? "com.andybircher.induetime.dev"
      : appJson.expo.ios?.bundleIdentifier,
  },
  android: {
    ...appJson.expo.android,
    package: IS_DEV
      ? "com.andybircher.induetime.dev"
      : appJson.expo.android?.package,
  },
  extra: {
    ...appJson.expo.extra,
    appLabel: process.env.APP_LABEL ?? "",
    easBuildId: process.env.EAS_BUILD_ID ?? "",
  },
});
