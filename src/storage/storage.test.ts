import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  acceptAgreement,
  checkAgreement,
  checkOnboardingComplete,
  getOrCreateDeviceId,
  isValidEntry,
  loadEntries,
  resetAgreement,
  resetOnboarding,
  saveEntries,
  setOnboardingComplete,
} from "./storage";

beforeEach(() => {
  void AsyncStorage.clear();
});

describe("saveEntries", () => {
  it("round-trips with loadEntries", async () => {
    const data = [
      {
        id: "1",
        name: "A",
        dueDate: "2026-09-01",
        createdAt: 1000,
        birthstone: { name: "Sapphire", color: "#1565C0" },
      },
      {
        id: "2",
        name: "B",
        dueDate: "2026-06-15",
        createdAt: 2000,
        birthstone: { name: "Pearl", color: "#B0B8E8" },
      },
    ];
    await saveEntries(data);
    const result = await loadEntries();
    expect(result.entries).toEqual(data);
  });
});

describe("isValidEntry", () => {
  it("accepts a valid entry", () => {
    expect(isValidEntry({ id: "1", name: "Baby", dueDate: "2026-06-15" })).toBe(
      true,
    );
  });

  it("accepts an entry with extra properties", () => {
    expect(
      isValidEntry({
        id: "1",
        name: "Baby",
        dueDate: "2026-06-15",
        weeks: 10,
      }),
    ).toBe(true);
  });

  it("rejects null", () => {
    expect(isValidEntry(null)).toBe(false);
  });

  it("rejects undefined", () => {
    expect(isValidEntry(undefined)).toBe(false);
  });

  it("rejects an object with missing id", () => {
    expect(isValidEntry({ name: "Baby", dueDate: "2026-06-15" })).toBe(false);
  });

  it("rejects an object with empty id", () => {
    expect(isValidEntry({ id: "", name: "Baby", dueDate: "2026-06-15" })).toBe(
      false,
    );
  });

  it("rejects an object with missing name", () => {
    expect(isValidEntry({ id: "1", dueDate: "2026-06-15" })).toBe(false);
  });

  it("rejects an object with empty name", () => {
    expect(isValidEntry({ id: "1", name: "", dueDate: "2026-06-15" })).toBe(
      false,
    );
  });

  it("rejects an object with missing dueDate", () => {
    expect(isValidEntry({ id: "1", name: "Baby" })).toBe(false);
  });

  it("rejects an object with non-ISO dueDate", () => {
    expect(isValidEntry({ id: "1", name: "Baby", dueDate: "not-a-date" })).toBe(
      false,
    );
  });
});

describe("loadEntries", () => {
  it("returns empty when storage is empty", async () => {
    const result = await loadEntries();
    expect(result).toEqual({ entries: [], discardedCount: 0 });
  });

  it("returns all entries when all are valid", async () => {
    const data = [
      {
        id: "1",
        name: "A",
        dueDate: "2026-09-01",
        createdAt: 1000,
        birthstone: { name: "Sapphire", color: "#1565C0" },
      },
      {
        id: "2",
        name: "B",
        dueDate: "2026-06-15",
        createdAt: 2000,
        birthstone: { name: "Pearl", color: "#B0B8E8" },
      },
    ];
    await AsyncStorage.setItem("@gestation_entries", JSON.stringify(data));

    const result = await loadEntries();
    expect(result.entries).toEqual(data);
    expect(result.discardedCount).toBe(0);
  });

  it("filters out invalid entries and re-saves", async () => {
    const data = [
      { id: "1", name: "Good", dueDate: "2026-09-01" },
      { id: "", name: "Bad", dueDate: "2026-06-15" },
      null,
      { id: "3", name: "Also good", dueDate: "2026-07-01" },
    ];
    await AsyncStorage.setItem("@gestation_entries", JSON.stringify(data));

    const result = await loadEntries();
    expect(result.entries).toHaveLength(2);
    expect(result.entries[0].name).toBe("Good");
    expect(result.entries[1].name).toBe("Also good");
    expect(result.discardedCount).toBe(2);

    // Verify re-save occurred
    const stored = await AsyncStorage.getItem("@gestation_entries");
    expect(JSON.parse(stored!)).toHaveLength(2);
  });

  it("handles total JSON corruption", async () => {
    await AsyncStorage.setItem("@gestation_entries", "{not valid json");

    const result = await loadEntries();
    expect(result).toEqual({ entries: [], discardedCount: 1 });

    // Verify key was removed
    const stored = await AsyncStorage.getItem("@gestation_entries");
    expect(stored).toBeNull();
  });

  it("handles non-array JSON value", async () => {
    await AsyncStorage.setItem(
      "@gestation_entries",
      JSON.stringify({ not: "an array" }),
    );

    const result = await loadEntries();
    expect(result).toEqual({ entries: [], discardedCount: 1 });

    const stored = await AsyncStorage.getItem("@gestation_entries");
    expect(stored).toBeNull();
  });

  it("does not re-save when all entries are valid and have birthstone and createdAt", async () => {
    const data = [
      {
        id: "1",
        name: "Baby",
        dueDate: "2026-09-01",
        createdAt: 1000,
        birthstone: { name: "Sapphire", color: "#1565C0" },
      },
    ];
    await AsyncStorage.setItem("@gestation_entries", JSON.stringify(data));
    (AsyncStorage.setItem as jest.Mock).mockClear();

    await loadEntries();

    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it("strips extra properties from valid entries", async () => {
    const data = [
      {
        id: "1",
        name: "Baby",
        dueDate: "2026-06-15",
        createdAt: 1000,
        weeks: 10,
        days: 3,
      },
    ];
    await AsyncStorage.setItem("@gestation_entries", JSON.stringify(data));

    const result = await loadEntries();
    expect(result.entries[0]).not.toHaveProperty("weeks");
  });

  it("backfills createdAt for entries that lack one", async () => {
    const data = [
      {
        id: "1",
        name: "First",
        dueDate: "2026-06-15",
        birthstone: { name: "Pearl", color: "#B0B8E8" },
      },
      {
        id: "2",
        name: "Second",
        dueDate: "2026-07-15",
        birthstone: { name: "Ruby", color: "#E53935" },
      },
    ];
    await AsyncStorage.setItem("@gestation_entries", JSON.stringify(data));

    const result = await loadEntries();
    expect(typeof result.entries[0].createdAt).toBe("number");
    expect(typeof result.entries[1].createdAt).toBe("number");
    // Second entry should have a later createdAt than first
    expect(result.entries[1].createdAt).toBeGreaterThan(
      result.entries[0].createdAt,
    );

    // Verify re-save occurred with createdAt
    const stored = JSON.parse(
      (await AsyncStorage.getItem("@gestation_entries"))!,
    );
    expect(stored[0].createdAt).toBe(result.entries[0].createdAt);
  });

  it("backfills birthstone for entries that lack one", async () => {
    const data = [{ id: "1", name: "Baby", dueDate: "2026-06-15" }];
    await AsyncStorage.setItem("@gestation_entries", JSON.stringify(data));

    const result = await loadEntries();
    expect(result.entries[0].birthstone).toEqual({
      name: "Pearl",
      color: "#B0B8E8",
    });

    // Verify re-save occurred with birthstone
    const stored = JSON.parse(
      (await AsyncStorage.getItem("@gestation_entries"))!,
    );
    expect(stored[0].birthstone).toEqual({
      name: "Pearl",
      color: "#B0B8E8",
    });
  });

  it("preserves existing birthstone from storage", async () => {
    const data = [
      {
        id: "1",
        name: "Baby",
        dueDate: "2026-06-15",
        createdAt: 1000,
        birthstone: { name: "Pearl", color: "#B0B8E8" },
      },
    ];
    await AsyncStorage.setItem("@gestation_entries", JSON.stringify(data));
    (AsyncStorage.setItem as jest.Mock).mockClear();

    const result = await loadEntries();
    expect(result.entries[0].birthstone).toEqual({
      name: "Pearl",
      color: "#B0B8E8",
    });
    // No re-save needed since birthstone and createdAt already present
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });
});

describe("getOrCreateDeviceId", () => {
  it("generates and persists a UUID on first call", async () => {
    const id = await getOrCreateDeviceId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );

    const stored = await AsyncStorage.getItem("@device_id");
    expect(stored).toBe(id);
  });

  it("returns the same value on subsequent calls", async () => {
    const first = await getOrCreateDeviceId();
    const second = await getOrCreateDeviceId();
    expect(second).toBe(first);
  });
});

describe("agreement helpers", () => {
  it("checkAgreement returns false by default", async () => {
    expect(await checkAgreement()).toBe(false);
  });

  it("checkAgreement returns true after acceptAgreement", async () => {
    await acceptAgreement();
    expect(await checkAgreement()).toBe(true);
  });

  it("resetAgreement clears a previously accepted agreement", async () => {
    await acceptAgreement();
    await resetAgreement();
    expect(await checkAgreement()).toBe(false);
  });
});

describe("onboarding helpers", () => {
  it("checkOnboardingComplete returns false by default", async () => {
    expect(await checkOnboardingComplete()).toBe(false);
  });

  it("checkOnboardingComplete returns true after setOnboardingComplete", async () => {
    await setOnboardingComplete();
    expect(await checkOnboardingComplete()).toBe(true);
  });

  it("resetOnboarding clears a previously completed onboarding", async () => {
    await setOnboardingComplete();
    await resetOnboarding();
    expect(await checkOnboardingComplete()).toBe(false);
  });
});
