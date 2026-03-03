import { Platform } from "react-native";
import Constants from "expo-constants";

const LATEST_BUILD_URL =
  "https://andybircher42.github.io/gestation/latest-build.json";

interface PlatformBuild {
  buildId: string;
  version: string;
  buildNumber: string;
}

interface LatestBuildData {
  ios: PlatformBuild;
  android: PlatformBuild;
}

interface BuildCheckResult {
  isOutdated: boolean;
  latestVersion?: string;
}

/** Fetches latest build info from GitHub Pages and compares against current build ID. */
export async function checkForNewerBuild(): Promise<BuildCheckResult> {
  try {
    const currentBuildId =
      (Constants.expoConfig?.extra?.easBuildId as string) ?? "";
    if (!currentBuildId || currentBuildId.startsWith("dev-")) {
      return { isOutdated: false };
    }

    const response = await fetch(LATEST_BUILD_URL);
    if (!response.ok) {
      return { isOutdated: false };
    }

    const data = (await response.json()) as LatestBuildData;
    const platform = Platform.OS === "ios" ? "ios" : "android";
    const latest = data[platform];

    if (!latest?.buildId) {
      return { isOutdated: false };
    }

    if (latest.buildId !== currentBuildId) {
      return { isOutdated: true, latestVersion: latest.version };
    }

    return { isOutdated: false };
  } catch {
    return { isOutdated: false };
  }
}
