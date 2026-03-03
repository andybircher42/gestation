import { useCallback, useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import * as Updates from "expo-updates";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

import DevToolbar from "./src/components/DevToolbar";
import EntryForm from "./src/components/EntryForm";
import EntryList from "./src/components/EntryList";
import UndoToast from "./src/components/UndoToast";
import HipaaAgreementModal from "./src/components/HipaaAgreementModal";
import {
  Entry,
  loadEntries,
  saveEntries,
  checkAgreement,
  acceptAgreement,
  resetAgreement,
} from "./src/storage";

/** Root component that manages entries state, persistence, and the HIPAA agreement flow. */
export default function App() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [showAgreement, setShowAgreement] = useState(false);
  const [agreementLoaded, setAgreementLoaded] = useState(false);
  const [deletedEntry, setDeletedEntry] = useState<{
    entry: Entry;
    previousEntries: Entry[];
  } | null>(null);

  useEffect(() => {
    checkAgreement()
      .then((accepted) => {
        if (!accepted) {
          setShowAgreement(true);
        }
      })
      .catch((e) => console.error("Failed to check agreement", e))
      .finally(() => setAgreementLoaded(true));

    loadEntries()
      .then(setEntries)
      .catch((e) => console.error("Failed to load entries", e));

    if (!__DEV__) {
      Updates.checkForUpdateAsync()
        .then(async (update) => {
          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
          }
        })
        .catch((e) => console.error("Failed to check for updates", e));
    }
  }, []);

  const handleAdd = ({
    name,
    weeks,
    days,
    dueDate,
  }: {
    name: string;
    weeks: number;
    days: number;
    dueDate: string;
  }) => {
    const entry = {
      id: Date.now().toString(),
      name,
      weeks,
      days,
      dueDate,
    };
    const newEntries = [entry, ...entries];
    setEntries(newEntries);
    saveEntries(newEntries).catch((e) =>
      console.error("Failed to save entries", e),
    );
  };

  const handleDelete = (id: string) => {
    const entry = entries.find((e) => e.id === id);
    const newEntries = entries.filter((e) => e.id !== id);
    setEntries(newEntries);
    saveEntries(newEntries).catch((e) =>
      console.error("Failed to save entries", e),
    );
    if (entry) {
      setDeletedEntry({ entry, previousEntries: entries });
    }
  };

  const handleUndo = useCallback(() => {
    if (deletedEntry) {
      setEntries(deletedEntry.previousEntries);
      saveEntries(deletedEntry.previousEntries).catch((e) =>
        console.error("Failed to restore entries", e),
      );
      setDeletedEntry(null);
    }
  }, [deletedEntry]);

  const handleDismissUndo = useCallback(() => {
    setDeletedEntry(null);
  }, []);

  const handleDeleteAll = () => {
    setEntries([]);
    saveEntries([]).catch((e) =>
      console.error("Failed to clear entries", e),
    );
  };

  const handleAcceptAgreement = () => {
    acceptAgreement()
      .then(() => setShowAgreement(false))
      .catch((e) => console.error("Failed to save agreement", e));
  };

  const handleResetAgreement = () => {
    resetAgreement()
      .then(() => setShowAgreement(true))
      .catch((e) => console.error("Failed to reset agreement", e));
  };

  const handleSeedData = (seeded: Entry[]) => {
    const newEntries = [...seeded, ...entries];
    setEntries(newEntries);
    saveEntries(newEntries).catch((e) =>
      console.error("Failed to save seeded entries", e),
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Gestation Tracker</Text>
        {__DEV__ && (
          <DevToolbar
            onSeedData={handleSeedData}
            onResetAgreement={handleResetAgreement}
          />
        )}
      </View>

      <EntryForm onAdd={handleAdd} />
      <EntryList entries={entries} onDelete={handleDelete} onDeleteAll={handleDeleteAll} />
      <HipaaAgreementModal
        visible={showAgreement && agreementLoaded}
        onAccept={handleAcceptAgreement}
      />

      {deletedEntry && (
        <UndoToast
          entry={deletedEntry.entry}
          onUndo={handleUndo}
          onDismiss={handleDismissUndo}
        />
      )}

      <StatusBar style="auto" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },
});
