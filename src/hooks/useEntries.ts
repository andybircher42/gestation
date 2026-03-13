import { useCallback, useState } from "react";

import { Entry, loadEntries, saveEntries } from "@/storage";
import { reportError } from "@/util";
import { getBirthstoneForDate } from "@/util/birthstones";

let idCounter = 0;

/** Generates a unique ID using timestamp + counter to avoid collisions on rapid calls. */
function generateId(): string {
  return `${Date.now()}-${idCounter++}`;
}

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
  const [saveError, setSaveError] = useState(false);

  /** Persists entries to AsyncStorage with one retry on failure. */
  const persistEntries = useCallback((updated: Entry[]) => {
    setSaveError(false);
    saveEntries(updated)
      .catch(() => saveEntries(updated))
      .catch((e) => {
        reportError("Failed to save entries after retry", e);
        setSaveError(true);
      });
  }, []);

  /** Hydrates entries from AsyncStorage. Call once during app initialization. */
  const load = useCallback(async () => {
    const result = await loadEntries();
    setEntries(result.entries);
    setDiscardedCount(result.discardedCount);
  }, []);

  const add = useCallback(
    ({ name, dueDate }: { name: string; dueDate: string }) => {
      const entry: Entry = {
        id: generateId(),
        name,
        dueDate,
        createdAt: Date.now(),
        birthstone: getBirthstoneForDate(dueDate),
      };
      setEntries((prev) => {
        const updated = [entry, ...prev];
        persistEntries(updated);
        return updated;
      });
    },
    [persistEntries],
  );

  const remove = useCallback(
    (id: string) => {
      setEntries((prev) => {
        const entry = prev.find((e) => e.id === id);
        const updated = prev.filter((e) => e.id !== id);
        persistEntries(updated);
        if (entry) {
          setDeletedEntry({ entry, previousEntries: prev });
        }
        return updated;
      });
    },
    [persistEntries],
  );

  const removeAll = useCallback(() => {
    setEntries([]);
    persistEntries([]);
    setDeletedEntry(null);
  }, [persistEntries]);

  const seed = useCallback(
    (seeded: Entry[]) => {
      setEntries((prev) => {
        const updated = [...seeded, ...prev];
        persistEntries(updated);
        return updated;
      });
    },
    [persistEntries],
  );

  const undo = useCallback(() => {
    if (deletedEntry) {
      setEntries(deletedEntry.previousEntries);
      persistEntries(deletedEntry.previousEntries);
      setDeletedEntry(null);
    }
  }, [deletedEntry, persistEntries]);

  const dismissUndo = useCallback(() => {
    setDeletedEntry(null);
  }, []);

  /** Clears the discarded-entry notification. */
  const dismissDiscarded = useCallback(() => {
    setDiscardedCount(0);
  }, []);

  /** Clears the save-error notification. */
  const dismissSaveError = useCallback(() => {
    setSaveError(false);
  }, []);

  return {
    entries,
    deletedEntry,
    discardedCount,
    saveError,
    load,
    add,
    remove,
    removeAll,
    seed,
    undo,
    dismissUndo,
    dismissDiscarded,
    dismissSaveError,
  };
}
