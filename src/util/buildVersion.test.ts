jest.unmock("@/util/buildVersion");

import { checkForNewerBuild } from "./buildVersion";

const mockConstants = {
  expoConfig: {
    extra: {
      easBuildId: "current-build-id-123",
    },
  },
};

jest.mock("expo-constants", () => ({
  __esModule: true,
  default: {
    get expoConfig() {
      return mockConstants.expoConfig;
    },
  },
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
  mockConstants.expoConfig = {
    extra: { easBuildId: "current-build-id-123" },
  };
});

describe("checkForNewerBuild", () => {
  it("returns not outdated when build IDs match", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          ios: {
            buildId: "current-build-id-123",
            version: "1.0.0",
            buildNumber: "1",
          },
          android: {
            buildId: "current-build-id-123",
            version: "1.0.0",
            buildNumber: "1",
          },
        }),
    });

    const result = await checkForNewerBuild();
    expect(result.isOutdated).toBe(false);
  });

  it("returns outdated with latest version when build IDs differ", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          ios: {
            buildId: "newer-build-id-456",
            version: "2.0.0",
            buildNumber: "5",
          },
          android: {
            buildId: "newer-build-id-789",
            version: "2.0.0",
            buildNumber: "3",
          },
        }),
    });

    const result = await checkForNewerBuild();
    expect(result.isOutdated).toBe(true);
    expect(result.latestVersion).toBe("2.0.0");
  });

  it("returns not outdated on network error", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const result = await checkForNewerBuild();
    expect(result.isOutdated).toBe(false);
  });

  it("returns not outdated when response is not ok", async () => {
    mockFetch.mockResolvedValue({ ok: false });

    const result = await checkForNewerBuild();
    expect(result.isOutdated).toBe(false);
  });

  it("returns not outdated for dev builds", async () => {
    mockConstants.expoConfig = {
      extra: { easBuildId: "dev-abc123" },
    };

    const result = await checkForNewerBuild();
    expect(result.isOutdated).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns not outdated when latest buildId is missing", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          ios: { buildId: "", version: "1.0.0", buildNumber: "1" },
          android: { buildId: "", version: "1.0.0", buildNumber: "1" },
        }),
    });

    const result = await checkForNewerBuild();
    expect(result.isOutdated).toBe(false);
  });

  it("returns not outdated when easBuildId is empty string", async () => {
    mockConstants.expoConfig = { extra: { easBuildId: "" } };

    const result = await checkForNewerBuild();
    expect(result.isOutdated).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns not outdated when expoConfig is null", async () => {
    mockConstants.expoConfig = null as never;

    const result = await checkForNewerBuild();
    expect(result.isOutdated).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("fetches the correct GitHub Pages URL", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          ios: {
            buildId: "current-build-id-123",
            version: "1.0.0",
            buildNumber: "1",
          },
          android: {
            buildId: "current-build-id-123",
            version: "1.0.0",
            buildNumber: "1",
          },
        }),
    });

    await checkForNewerBuild();
    expect(mockFetch).toHaveBeenCalledWith(
      "https://andybircher42.github.io/gestation/latest-build.json",
    );
  });

  it("returns not outdated when json() throws", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.reject(new Error("invalid json")),
    });

    const result = await checkForNewerBuild();
    expect(result.isOutdated).toBe(false);
  });

  it("returns not outdated when platform entry is missing from response", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    const result = await checkForNewerBuild();
    expect(result.isOutdated).toBe(false);
  });

  it("does not include latestVersion when not outdated", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          ios: {
            buildId: "current-build-id-123",
            version: "1.0.0",
            buildNumber: "1",
          },
          android: {
            buildId: "current-build-id-123",
            version: "1.0.0",
            buildNumber: "1",
          },
        }),
    });

    const result = await checkForNewerBuild();
    expect(result.latestVersion).toBeUndefined();
  });
});
