import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  acceptAgreement,
  checkAgreement,
  isValidEntry,
  loadEntries,
  loadEntriesSafe,
  resetAgreement,
  saveEntries,
} from "./storage";

beforeEach(() => {
  void AsyncStorage.clear();
});

describe("loadEntries / saveEntries", () => {
  it("returns [] when empty", async () => {
    const entries = await loadEntries();
    expect(entries).toEqual([]);
  });

  it("returns parsed entries when they exist", async () => {
    const data = [{ id: "1", name: "Baby", dueDate: "2026-06-15" }];
    await AsyncStorage.setItem("@gestation_entries", JSON.stringify(data));
    const entries = await loadEntries();
    expect(entries).toEqual(data);
  });

  it("loads legacy entries that contain extra weeks/days fields", async () => {
    const legacy = [
      { id: "1", name: "Baby", weeks: 10, days: 3, dueDate: "2026-06-15" },
    ];
    await AsyncStorage.setItem("@gestation_entries", JSON.stringify(legacy));
    const entries = await loadEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0].id).toBe("1");
    expect(entries[0].name).toBe("Baby");
    expect(entries[0].dueDate).toBe("2026-06-15");
  });

  it("round-trips with saveEntries", async () => {
    const data = [
      { id: "1", name: "A", dueDate: "2026-09-01" },
      { id: "2", name: "B", dueDate: "2026-06-15" },
    ];
    await saveEntries(data);
    const loaded = await loadEntries();
    expect(loaded).toEqual(data);
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

describe("loadEntriesSafe", () => {
  it("returns empty when storage is empty", async () => {
    const result = await loadEntriesSafe();
    expect(result).toEqual({ entries: [], discardedCount: 0 });
  });

  it("returns all entries when all are valid", async () => {
    const data = [
      { id: "1", name: "A", dueDate: "2026-09-01" },
      { id: "2", name: "B", dueDate: "2026-06-15" },
    ];
    await AsyncStorage.setItem("@gestation_entries", JSON.stringify(data));

    const result = await loadEntriesSafe();
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

    const result = await loadEntriesSafe();
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

    const result = await loadEntriesSafe();
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

    const result = await loadEntriesSafe();
    expect(result).toEqual({ entries: [], discardedCount: 1 });

    const stored = await AsyncStorage.getItem("@gestation_entries");
    expect(stored).toBeNull();
  });

  it("does not re-save when all entries are valid", async () => {
    const data = [{ id: "1", name: "Baby", dueDate: "2026-09-01" }];
    await AsyncStorage.setItem("@gestation_entries", JSON.stringify(data));
    (AsyncStorage.setItem as jest.Mock).mockClear();

    await loadEntriesSafe();

    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it("strips extra properties from valid entries", async () => {
    const data = [
      { id: "1", name: "Baby", dueDate: "2026-06-15", weeks: 10, days: 3 },
    ];
    await AsyncStorage.setItem("@gestation_entries", JSON.stringify(data));

    const result = await loadEntriesSafe();
    expect(result.entries[0]).toEqual({
      id: "1",
      name: "Baby",
      dueDate: "2026-06-15",
    });
    expect(result.entries[0]).not.toHaveProperty("weeks");
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
