import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

/** A single gestation tracking entry. */
export interface Entry {
  id: string;
  name: string;
  dueDate: string;
}

/** A patient record with EDD and birthstone info. */
export interface Patient {
  id: string;
  name: string;
  edd: string; // ISO date YYYY-MM-DD
  lmpDate?: string;
  birthstone: {
    name: string;
    color: string;
  };
}

const STORAGE_KEY = "@gestation_entries";
const AGREEMENT_KEY = "@hipaa_agreement_accepted";
const DEVICE_ID_KEY = "@device_id";
const PATIENTS_KEY = "@idt_patients";
const ONBOARDING_KEY = "@idt_onboarding_complete";

/** Persists the full entries array to AsyncStorage. */
export const saveEntries = async (entries: Entry[]): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

/** Returns whether the user has accepted the HIPAA disclaimer. */
export const checkAgreement = async (): Promise<boolean> => {
  const accepted = await AsyncStorage.getItem(AGREEMENT_KEY);
  return !!accepted;
};

/** Records that the user accepted the HIPAA disclaimer. */
export const acceptAgreement = async (): Promise<void> => {
  await AsyncStorage.setItem(AGREEMENT_KEY, "true");
};

/** Clears the stored HIPAA agreement so the disclaimer is shown again. */
export const resetAgreement = async (): Promise<void> => {
  await AsyncStorage.removeItem(AGREEMENT_KEY);
};

/** Returns a persistent device ID, generating and storing one on first call. */
export const getOrCreateDeviceId = async (): Promise<string> => {
  const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (existing) {
    return existing;
  }
  const id = Crypto.randomUUID();
  await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  return id;
};

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}/;

/** Type guard that validates a value has the shape of a valid Entry. */
export const isValidEntry = (value: unknown): value is Entry => {
  if (value == null || typeof value !== "object") {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === "string" &&
    obj.id.length > 0 &&
    typeof obj.name === "string" &&
    obj.name.length > 0 &&
    typeof obj.dueDate === "string" &&
    ISO_DATE_RE.test(obj.dueDate)
  );
};

/** Result of loading entries with validation info. */
export interface LoadResult {
  entries: Entry[];
  discardedCount: number;
}

/** Loads entries with validation, discarding corrupted items and re-saving if needed. */
export const loadEntries = async (): Promise<LoadResult> => {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  if (json == null) {
    return { entries: [], discardedCount: 0 };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return { entries: [], discardedCount: 1 };
  }

  if (!Array.isArray(parsed)) {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return { entries: [], discardedCount: 1 };
  }

  const entries: Entry[] = [];
  let discardedCount = 0;

  for (const item of parsed) {
    if (isValidEntry(item)) {
      entries.push({ id: item.id, name: item.name, dueDate: item.dueDate });
    } else {
      discardedCount++;
    }
  }

  if (discardedCount > 0) {
    await saveEntries(entries);
  }

  return { entries, discardedCount };
};

// ---------------------------------------------------------------------------
// Patient storage
// ---------------------------------------------------------------------------

/** Type guard that validates a value has the shape of a valid Patient. */
export const isValidPatient = (value: unknown): value is Patient => {
  if (value == null || typeof value !== "object") {
    return false;
  }
  const obj = value as Record<string, unknown>;
  if (
    typeof obj.id !== "string" ||
    obj.id.length === 0 ||
    typeof obj.name !== "string" ||
    obj.name.length === 0 ||
    typeof obj.edd !== "string" ||
    !ISO_DATE_RE.test(obj.edd)
  ) {
    return false;
  }
  if (obj.birthstone == null || typeof obj.birthstone !== "object") {
    return false;
  }
  const bs = obj.birthstone as Record<string, unknown>;
  return (
    typeof bs.name === "string" &&
    bs.name.length > 0 &&
    typeof bs.color === "string" &&
    bs.color.length > 0
  );
};

/** Persists the full patients array to AsyncStorage. */
export const savePatients = async (patients: Patient[]): Promise<void> => {
  await AsyncStorage.setItem(PATIENTS_KEY, JSON.stringify(patients));
};

/** Result of loading patients with validation info. */
export interface PatientLoadResult {
  patients: Patient[];
  discardedCount: number;
}

/** Loads patients with validation, discarding corrupted items and re-saving if needed. */
export const loadPatients = async (): Promise<PatientLoadResult> => {
  const json = await AsyncStorage.getItem(PATIENTS_KEY);
  if (json == null) {
    return { patients: [], discardedCount: 0 };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    await AsyncStorage.removeItem(PATIENTS_KEY);
    return { patients: [], discardedCount: 1 };
  }

  if (!Array.isArray(parsed)) {
    await AsyncStorage.removeItem(PATIENTS_KEY);
    return { patients: [], discardedCount: 1 };
  }

  const patients: Patient[] = [];
  let discardedCount = 0;

  for (const item of parsed) {
    if (isValidPatient(item)) {
      patients.push({
        id: item.id,
        name: item.name,
        edd: item.edd,
        ...(item.lmpDate != null ? { lmpDate: item.lmpDate } : {}),
        birthstone: {
          name: item.birthstone.name,
          color: item.birthstone.color,
        },
      });
    } else {
      discardedCount++;
    }
  }

  if (discardedCount > 0) {
    await savePatients(patients);
  }

  return { patients, discardedCount };
};

/** Returns whether the user has completed onboarding. */
export const checkOnboardingComplete = async (): Promise<boolean> => {
  const value = await AsyncStorage.getItem(ONBOARDING_KEY);
  return !!value;
};

/** Marks onboarding as complete. */
export const setOnboardingComplete = async (): Promise<void> => {
  await AsyncStorage.setItem(ONBOARDING_KEY, "true");
};
