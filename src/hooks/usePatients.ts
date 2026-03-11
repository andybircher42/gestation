import { useCallback, useState } from "react";

import { loadPatients, Patient, savePatients } from "@/storage";

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
    setPatients(result.patients);
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
    remove,
    undo,
    dismissUndo,
    dismissDiscarded,
  };
}
