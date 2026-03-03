import { useCallback, useState } from "react";

import { Entry, loadEntriesSafe, saveEntries } from "@/storage";

/**
 * Manages entry CRUD operations, persistence, and undo state.
 * Call `load()` during app init to hydrate entries from storage.
 */
export default function useEntries() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [deletedEntry, setDeletedEntry] = useState<{
    entry: Entry;
    previousEntries: Entry[];
  } | null>(null);
  const [discardedCount, setDiscardedCount] = useState(0);

  /** Persists entries to AsyncStorage with error logging. */
  const persistEntries = (updated: Entry[]) => {
    saveEntries(updated).catch((e) =>
      console.error("Failed to save entries", e),
    );
  };

  /** Hydrates entries from AsyncStorage. Call once during app initialization. */
  const load = useCallback(async () => {
    const result = await loadEntriesSafe();
    setEntries(result.entries);
    setDiscardedCount(result.discardedCount);
  }, []);

  const add = ({ name, dueDate }: { name: string; dueDate: string }) => {
    const entry: Entry = {
      id: Date.now().toString(),
      name,
      dueDate,
    };
    const newEntries = [entry, ...entries];
    setEntries(newEntries);
    persistEntries(newEntries);
  };

  const remove = (id: string) => {
    const entry = entries.find((e) => e.id === id);
    const newEntries = entries.filter((e) => e.id !== id);
    setEntries(newEntries);
    persistEntries(newEntries);
    if (entry) {
      setDeletedEntry({ entry, previousEntries: entries });
    }
  };

  const removeAll = () => {
    setEntries([]);
    persistEntries([]);
  };

  const seed = (seeded: Entry[]) => {
    const newEntries = [...seeded, ...entries];
    setEntries(newEntries);
    persistEntries(newEntries);
  };

  const undo = useCallback(() => {
    if (deletedEntry) {
      setEntries(deletedEntry.previousEntries);
      persistEntries(deletedEntry.previousEntries);
      setDeletedEntry(null);
    }
  }, [deletedEntry]);

  const dismissUndo = useCallback(() => {
    setDeletedEntry(null);
  }, []);

  /** Clears the discarded-entry notification. */
  const dismissDiscarded = useCallback(() => {
    setDiscardedCount(0);
  }, []);

  return {
    entries,
    deletedEntry,
    discardedCount,
    load,
    add,
    remove,
    removeAll,
    seed,
    undo,
    dismissUndo,
    dismissDiscarded,
  };
}
