import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook, waitFor } from "@testing-library/react-native";

import useEntries from "./useEntries";

beforeEach(() => {
  void AsyncStorage.clear();
});

/** Renders the hook and returns the result ref. */
function setup() {
  return renderHook(() => useEntries()).result;
}

/** Adds an entry and returns its id. */
function addEntry(
  result: ReturnType<typeof setup>,
  name = "Baby",
  dueDate = "2026-09-01",
) {
  act(() => {
    result.current.add({ name, dueDate });
  });
  return result.current.entries[0].id;
}

describe("useEntries", () => {
  it("load hydrates entries from storage", async () => {
    await AsyncStorage.setItem(
      "@gestation_entries",
      JSON.stringify([{ id: "1", name: "A", dueDate: "2026-09-01" }]),
    );

    const result = setup();

    await act(async () => {
      await result.current.load();
    });

    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].name).toBe("A");
  });

  it("add creates an entry and persists it", async () => {
    const result = setup();
    addEntry(result, "Baby", "2026-08-01");

    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].name).toBe("Baby");
    expect(result.current.entries[0].dueDate).toBe("2026-08-01");

    await waitFor(async () => {
      const stored = await AsyncStorage.getItem("@gestation_entries");
      expect(JSON.parse(stored!)).toHaveLength(1);
    });
  });

  it("remove deletes an entry and sets deletedEntry", () => {
    const result = setup();
    const id = addEntry(result);

    act(() => {
      result.current.remove(id);
    });

    expect(result.current.entries).toHaveLength(0);
    expect(result.current.deletedEntry).not.toBeNull();
    expect(result.current.deletedEntry!.entry.name).toBe("Baby");
  });

  it("undo restores previous entries", () => {
    const result = setup();
    const id = addEntry(result);

    act(() => {
      result.current.remove(id);
    });

    expect(result.current.entries).toHaveLength(0);

    act(() => {
      result.current.undo();
    });

    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].name).toBe("Baby");
    expect(result.current.deletedEntry).toBeNull();
  });

  it("dismissUndo clears deletedEntry", () => {
    const result = setup();
    const id = addEntry(result);

    act(() => {
      result.current.remove(id);
    });

    expect(result.current.deletedEntry).not.toBeNull();

    act(() => {
      result.current.dismissUndo();
    });

    expect(result.current.deletedEntry).toBeNull();
  });

  it("removeAll clears all entries", async () => {
    const result = setup();

    act(() => {
      result.current.add({ name: "A", dueDate: "2026-09-01" });
      result.current.add({ name: "B", dueDate: "2026-06-01" });
    });

    act(() => {
      result.current.removeAll();
    });

    expect(result.current.entries).toHaveLength(0);

    await waitFor(async () => {
      const stored = await AsyncStorage.getItem("@gestation_entries");
      expect(JSON.parse(stored!)).toHaveLength(0);
    });
  });

  it("removeAll clears deletedEntry so undo cannot restore", () => {
    const result = setup();
    const id = addEntry(result);

    act(() => {
      result.current.remove(id);
    });

    expect(result.current.deletedEntry).not.toBeNull();

    act(() => {
      result.current.removeAll();
    });

    expect(result.current.deletedEntry).toBeNull();
  });

  it("seed prepends seeded entries", () => {
    const result = setup();
    addEntry(result, "Existing");

    act(() => {
      result.current.seed([
        { id: "s1", name: "Seeded", dueDate: "2026-11-01" },
      ]);
    });

    expect(result.current.entries).toHaveLength(2);
    expect(result.current.entries[0].name).toBe("Seeded");
    expect(result.current.entries[1].name).toBe("Existing");
  });

  it("two rapid add calls both persist", () => {
    const result = setup();

    act(() => {
      result.current.add({ name: "A", dueDate: "2026-09-01" });
      result.current.add({ name: "B", dueDate: "2026-06-01" });
    });

    expect(result.current.entries).toHaveLength(2);
  });

  it("two rapid remove calls both take effect", () => {
    const result = setup();

    act(() => {
      result.current.add({ name: "A", dueDate: "2026-09-01" });
      result.current.add({ name: "B", dueDate: "2026-06-01" });
    });

    const idA = result.current.entries.find((e) => e.name === "A")!.id;
    const idB = result.current.entries.find((e) => e.name === "B")!.id;

    act(() => {
      result.current.remove(idA);
      result.current.remove(idB);
    });

    expect(result.current.entries).toHaveLength(0);
  });

  it("sets discardedCount when corrupted entries are found", async () => {
    const data = [
      { id: "1", name: "Good", dueDate: "2026-09-01" },
      null,
      { id: "", name: "Bad", dueDate: "2026-06-15" },
    ];
    await AsyncStorage.setItem("@gestation_entries", JSON.stringify(data));

    const { result } = renderHook(() => useEntries());

    await act(async () => {
      await result.current.load();
    });

    expect(result.current.entries).toHaveLength(1);
    expect(result.current.discardedCount).toBe(2);
  });

  it("discardedCount is 0 when no corruption", async () => {
    const data = [{ id: "1", name: "A", dueDate: "2026-09-01" }];
    await AsyncStorage.setItem("@gestation_entries", JSON.stringify(data));

    const { result } = renderHook(() => useEntries());

    await act(async () => {
      await result.current.load();
    });

    expect(result.current.discardedCount).toBe(0);
  });

  it("dismissDiscarded clears the discardedCount", async () => {
    const data = [null, { id: "1", name: "Good", dueDate: "2026-09-01" }];
    await AsyncStorage.setItem("@gestation_entries", JSON.stringify(data));

    const { result } = renderHook(() => useEntries());

    await act(async () => {
      await result.current.load();
    });

    expect(result.current.discardedCount).toBe(1);

    act(() => {
      result.current.dismissDiscarded();
    });

    expect(result.current.discardedCount).toBe(0);
  });
});
