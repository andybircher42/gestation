import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

import { Birthstone, getBirthstoneForDate } from "@/util/birthstones";

/** A single gestation tracking entry. */
export interface Entry {
  id: string;
  name: string;
  dueDate: string;
  createdAt: number;
  deliveredAt?: number;
  birthstone?: Birthstone;
}

const STORAGE_KEY = "@gestation_entries";
const AGREEMENT_KEY = "@hipaa_agreement_accepted";
const DEVICE_ID_KEY = "@device_id";
const ONBOARDING_KEY = "@onboarding_complete";

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

/** Returns whether the user has completed the onboarding flow. */
export const checkOnboardingComplete = async (): Promise<boolean> => {
  const value = await AsyncStorage.getItem(ONBOARDING_KEY);
  return !!value;
};

/** Records that the user completed onboarding. */
export const setOnboardingComplete = async (): Promise<void> => {
  await AsyncStorage.setItem(ONBOARDING_KEY, "true");
};

/** Clears the stored onboarding completion so it is shown again. */
export const resetOnboarding = async (): Promise<void> => {
  await AsyncStorage.removeItem(ONBOARDING_KEY);
};

/** Fixed base timestamp for migrating legacy entries without createdAt. */
const MIGRATION_BASE_DATE = 1700000000000; // 2023-11-14T22:13:20Z

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
  let needsMigration = false;

  for (const item of parsed) {
    if (isValidEntry(item)) {
      const obj = item as unknown as Record<string, unknown>;
      const birthstone =
        obj.birthstone != null &&
        typeof obj.birthstone === "object" &&
        typeof (obj.birthstone as Record<string, unknown>).name === "string" &&
        typeof (obj.birthstone as Record<string, unknown>).color === "string"
          ? (obj.birthstone as Birthstone)
          : undefined;

      if (!birthstone) {
        needsMigration = true;
      }

      const createdAt =
        typeof obj.createdAt === "number" ? obj.createdAt : undefined;

      if (!createdAt) {
        needsMigration = true;
      }

      entries.push({
        id: item.id,
        name: item.name,
        dueDate: item.dueDate,
        createdAt: createdAt ?? MIGRATION_BASE_DATE + entries.length * 1000,
        birthstone: birthstone ?? getBirthstoneForDate(item.dueDate),
      });
    } else {
      discardedCount++;
    }
  }

  if (discardedCount > 0 || needsMigration) {
    await saveEntries(entries);
  }

  return { entries, discardedCount };
};
