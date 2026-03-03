import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  acceptAgreement,
  checkAgreement,
  getOrCreateDeviceId,
  isValidEntry,
  loadEntries,
  resetAgreement,
  saveEntries,
} from "./storage";

beforeEach(() => {
  void AsyncStorage.clear();
});

describe("saveEntries", () => {
  it("round-trips with loadEntries", async () => {
    const data = [
      { id: "1", name: "A", dueDate: "2026-09-01" },
      { id: "2", name: "B", dueDate: "2026-06-15" },
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
      { id: "1", name: "A", dueDate: "2026-09-01" },
      { id: "2", name: "B", dueDate: "2026-06-15" },
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

  it("does not re-save when all entries are valid", async () => {
    const data = [{ id: "1", name: "Baby", dueDate: "2026-09-01" }];
    await AsyncStorage.setItem("@gestation_entries", JSON.stringify(data));
    (AsyncStorage.setItem as jest.Mock).mockClear();

    await loadEntries();

    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it("strips extra properties from valid entries", async () => {
    const data = [
      { id: "1", name: "Baby", dueDate: "2026-06-15", weeks: 10, days: 3 },
    ];
    await AsyncStorage.setItem("@gestation_entries", JSON.stringify(data));

    const result = await loadEntries();
    expect(result.entries[0]).toEqual({
      id: "1",
      name: "Baby",
      dueDate: "2026-06-15",
    });
    expect(result.entries[0]).not.toHaveProperty("weeks");
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
