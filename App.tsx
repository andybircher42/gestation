import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import EntryForm from './src/components/EntryForm';
import EntryList from './src/components/EntryList';
import HipaaAgreementModal from './src/components/HipaaAgreementModal';
import {
  Entry,
  loadEntries,
  saveEntries,
  checkAgreement,
  acceptAgreement,
  resetAgreement,
} from './src/storage';

export default function App() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [showAgreement, setShowAgreement] = useState(false);
  const [agreementLoaded, setAgreementLoaded] = useState(false);

  useEffect(() => {
    checkAgreement()
      .then((accepted) => {
        if (!accepted) setShowAgreement(true);
      })
      .catch((e) => console.error('Failed to check agreement', e))
      .finally(() => setAgreementLoaded(true));

    loadEntries()
      .then(setEntries)
      .catch((e) => console.error('Failed to load entries', e));
  }, []);

  const handleAdd = ({ name, weeks, days }: { name: string; weeks: number; days: number }) => {
    const entry = {
      id: Date.now().toString(),
      name,
      weeks,
      days,
    };
    const newEntries = [entry, ...entries];
    setEntries(newEntries);
    saveEntries(newEntries).catch((e) =>
      console.error('Failed to save entries', e)
    );
  };

  const handleDelete = (id: string) => {
    const newEntries = entries.filter((e) => e.id !== id);
    setEntries(newEntries);
    saveEntries(newEntries).catch((e) =>
      console.error('Failed to save entries', e)
    );
  };

  const handleAcceptAgreement = () => {
    acceptAgreement()
      .then(() => setShowAgreement(false))
      .catch((e) => console.error('Failed to save agreement', e));
  };

  const handleResetAgreement = () => {
    resetAgreement()
      .then(() => setShowAgreement(true))
      .catch((e) => console.error('Failed to reset agreement', e));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Gestation Tracker</Text>
        {__DEV__ && (
          <Pressable onPress={handleResetAgreement} style={styles.devButton}>
            <Text style={styles.devButtonText}>Reset HIPAA</Text>
          </Pressable>
        )}
      </View>

      <EntryForm onAdd={handleAdd} />
      <EntryList entries={entries} onDelete={handleDelete} />
      <HipaaAgreementModal
        visible={showAgreement && agreementLoaded}
        onAccept={handleAcceptAgreement}
      />

      <StatusBar style="auto" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  devButton: {
    position: 'absolute',
    right: 20,
    bottom: 16,
    backgroundColor: '#ff6b6b',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  devButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
});
