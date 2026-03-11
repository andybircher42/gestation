import { useCallback, useState } from "react";

import { loadPatients, Patient, savePatients } from "@/storage";
import { getBirthstone } from "@/util/birthstones";

let patientIdCounter = 0;

/** Generates a unique patient ID using timestamp + counter to avoid collisions. */
function generatePatientId(): string {
  return `p-${Date.now()}-${patientIdCounter++}`;
}

/**
 * Manages patient CRUD operations, persistence, and undo state.
 * Call `load()` during app init to hydrate patients from storage.
 */
export default function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [deletedPatient, setDeletedPatient] = useState<{
    patient: Patient;
    previousPatients: Patient[];
  } | null>(null);
  const [discardedCount, setDiscardedCount] = useState(0);

  /** Persists patients to AsyncStorage with error logging. */
  const persistPatients = useCallback((updated: Patient[]) => {
    savePatients(updated).catch((e) =>
      console.error("Failed to save patients", e),
    );
  }, []);

  /** Hydrates patients from AsyncStorage. Call once during app initialization. */
  const load = useCallback(async () => {
    const result = await loadPatients();
    // Refresh birthstone colors from current spec (handles stale stored colors)
    const refreshed = result.patients.map((p) => {
      const month = parseInt(p.edd.split("-")[1], 10);
      const current = getBirthstone(month);
      if (
        current.color !== p.birthstone.color ||
        current.name !== p.birthstone.name
      ) {
        return {
          ...p,
          birthstone: { name: current.name, color: current.color },
        };
      }
      return p;
    });
    setPatients(refreshed);
    setDiscardedCount(result.discardedCount);
  }, []);

  const add = useCallback(
    ({
      name,
      edd,
      birthstone,
    }: {
      name: string;
      edd: string;
      birthstone: { name: string; color: string };
    }) => {
      const patient: Patient = {
        id: generatePatientId(),
        name,
        edd,
        birthstone,
      };
      setPatients((prev) => {
        const updated = [patient, ...prev];
        persistPatients(updated);
        return updated;
      });
    },
    [persistPatients],
  );

  const update = useCallback(
    (updated: Patient) => {
      setPatients((prev) => {
        const next = prev.map((p) => (p.id === updated.id ? updated : p));
        persistPatients(next);
        return next;
      });
    },
    [persistPatients],
  );

  const remove = useCallback(
    (id: string) => {
      setPatients((prev) => {
        const patient = prev.find((p) => p.id === id);
        const updated = prev.filter((p) => p.id !== id);
        persistPatients(updated);
        if (patient) {
          setDeletedPatient({ patient, previousPatients: prev });
        }
        return updated;
      });
    },
    [persistPatients],
  );

  const undo = useCallback(() => {
    if (deletedPatient) {
      setPatients(deletedPatient.previousPatients);
      persistPatients(deletedPatient.previousPatients);
      setDeletedPatient(null);
    }
  }, [deletedPatient, persistPatients]);

  const dismissUndo = useCallback(() => {
    setDeletedPatient(null);
  }, []);

  /** Clears the discarded-patient notification. */
  const dismissDiscarded = useCallback(() => {
    setDiscardedCount(0);
  }, []);

  return {
    patients,
    deletedPatient,
    discardedCount,
    load,
    add,
    update,
    remove,
    undo,
    dismissUndo,
    dismissDiscarded,
  };
}
