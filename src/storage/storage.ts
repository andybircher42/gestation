import AsyncStorage from "@react-native-async-storage/async-storage";

/** A single gestation tracking entry. */
export interface Entry {
  id: string;
  name: string;
  dueDate: string;
}

const STORAGE_KEY = "@gestation_entries";
const AGREEMENT_KEY = "@hipaa_agreement_accepted";

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
