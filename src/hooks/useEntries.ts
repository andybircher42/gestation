import { useCallback, useState } from "react";

import {
  DEFAULT_DELIVERED_TTL_DAYS,
  Entry,
  loadDeliveredTTL,
  loadEntries,
  saveDeliveredTTL,
  saveEntries,
} from "@/storage";
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
  const [deliveredEntry, setDeliveredEntry] = useState<{
    entry: Entry;
    previousEntries: Entry[];
  } | null>(null);
  const [deliveredTTLDays, setDeliveredTTLDays] = useState(
    DEFAULT_DELIVERED_TTL_DAYS,
  );
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
    const ttl = await loadDeliveredTTL();
    setDeliveredTTLDays(ttl);
    const result = await loadEntries(ttl);
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

  const deliver = useCallback(
    (id: string) => {
      setEntries((prev) => {
        const entry = prev.find((e) => e.id === id);
        const updated = prev.map((e) =>
          e.id === id ? { ...e, deliveredAt: Date.now() } : e,
        );
        persistEntries(updated);
        if (entry) {
          setDeliveredEntry({ entry, previousEntries: prev });
        }
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

  const removeAll = useCallback(
    (filter?: "expecting" | "delivered") => {
      setEntries((prev) => {
        const updated =
          filter === "expecting"
            ? prev.filter((e) => !!e.deliveredAt)
            : filter === "delivered"
              ? prev.filter((e) => !e.deliveredAt)
              : [];
        persistEntries(updated);
        return updated;
      });
      setDeletedEntry(null);
    },
    [persistEntries],
  );

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

  const undoDeliver = useCallback(() => {
    if (deliveredEntry) {
      setEntries(deliveredEntry.previousEntries);
      persistEntries(deliveredEntry.previousEntries);
      setDeliveredEntry(null);
    }
  }, [deliveredEntry, persistEntries]);

  const dismissDelivered = useCallback(() => {
    setDeliveredEntry(null);
  }, []);

  const updateDeliveredTTL = useCallback((days: number) => {
    setDeliveredTTLDays(days);
    saveDeliveredTTL(days).catch((e) =>
      reportError("Failed to save TTL preference", e),
    );
    // Cleanup applies on next app launch (in loadEntries), not immediately,
    // so users can scroll through options without accidentally losing entries.
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
    deliveredEntry,
    deliveredTTLDays,
    discardedCount,
    saveError,
    load,
    add,
    deliver,
    remove,
    removeAll,
    seed,
    undo,
    dismissUndo,
    undoDeliver,
    dismissDelivered,
    updateDeliveredTTL,
    dismissDiscarded,
    dismissSaveError,
  };
}
