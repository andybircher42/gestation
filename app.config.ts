import { ConfigContext, ExpoConfig } from "expo/config";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const appJson = require("./app.json") as { expo: ExpoConfig };

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...appJson.expo,
  ...config,
  extra: {
    ...appJson.expo.extra,
    appLabel: process.env.APP_LABEL ?? "",
    easBuildId: process.env.EAS_BUILD_ID ?? "",
  },
});
