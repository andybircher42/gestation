import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@gestation_entries';
const AGREEMENT_KEY = '@hipaa_agreement_accepted';

export const loadEntries = async () => {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  return json ? JSON.parse(json) : [];
};

export const saveEntries = async (entries) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

export const checkAgreement = async () => {
  const accepted = await AsyncStorage.getItem(AGREEMENT_KEY);
  return !!accepted;
};

export const acceptAgreement = async () => {
  await AsyncStorage.setItem(AGREEMENT_KEY, 'true');
};

export const resetAgreement = async () => {
  await AsyncStorage.removeItem(AGREEMENT_KEY);
};
