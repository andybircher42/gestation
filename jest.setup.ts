import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";

jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

jest.mock("expo-status-bar", () => ({
  StatusBar: () => null,
}));

jest.mock("expo-updates", () => ({
  checkForUpdateAsync: jest.fn().mockResolvedValue({ isAvailable: false }),
  fetchUpdateAsync: jest.fn(),
  reloadAsync: jest.fn(),
}));

jest.mock("vexo-analytics", () => ({
  vexo: jest.fn(),
  identifyDevice: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/util/buildVersion", () => ({
  checkForNewerBuild: jest.fn().mockResolvedValue({ isOutdated: false }),
}));
