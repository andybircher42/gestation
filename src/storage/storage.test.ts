import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  acceptAgreement,
  checkAgreement,
  loadEntries,
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
