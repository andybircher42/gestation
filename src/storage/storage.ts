import AsyncStorage from "@react-native-async-storage/async-storage";

/** A single gestation tracking entry. */
export interface Entry {
  id: string;
  name: string;
  dueDate: string;
}

const STORAGE_KEY = "@gestation_entries";
const AGREEMENT_KEY = "@hipaa_agreement_accepted";

/** Loads all saved entries from AsyncStorage. */
export const loadEntries = async (): Promise<Entry[]> => {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  return json ? JSON.parse(json) : [];
};

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
