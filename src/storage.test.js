import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loadEntries,
  saveEntries,
  checkAgreement,
  acceptAgreement,
  resetAgreement,
} from './storage';

beforeEach(() => {
  AsyncStorage.clear();
});

describe('loadEntries / saveEntries', () => {
  it('returns [] when empty', async () => {
    const entries = await loadEntries();
    expect(entries).toEqual([]);
  });

  it('returns parsed entries when they exist', async () => {
    const data = [{ id: '1', name: 'Baby', weeks: 10, days: 3 }];
    await AsyncStorage.setItem('@gestation_entries', JSON.stringify(data));
    const entries = await loadEntries();
    expect(entries).toEqual(data);
  });

  it('round-trips with saveEntries', async () => {
    const data = [
      { id: '1', name: 'A', weeks: 5, days: 2 },
      { id: '2', name: 'B', weeks: 20, days: 0 },
    ];
    await saveEntries(data);
    const loaded = await loadEntries();
    expect(loaded).toEqual(data);
  });
});

describe('agreement helpers', () => {
  it('checkAgreement returns false by default', async () => {
    expect(await checkAgreement()).toBe(false);
  });

  it('checkAgreement returns true after acceptAgreement', async () => {
    await acceptAgreement();
    expect(await checkAgreement()).toBe(true);
  });

  it('resetAgreement clears a previously accepted agreement', async () => {
    await acceptAgreement();
    await resetAgreement();
    expect(await checkAgreement()).toBe(false);
  });
});
