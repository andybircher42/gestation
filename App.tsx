import { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Constants from "expo-constants";
import { StatusBar } from "expo-status-bar";
import * as Updates from "expo-updates";

import DevToolbar from "@/components/DevToolbar";
import EntryForm from "@/components/EntryForm";
import EntryList from "@/components/EntryList";
import HipaaAgreementModal from "@/components/HipaaAgreementModal";
import UndoToast from "@/components/UndoToast";
import useEntries from "@/hooks/useEntries";
import { acceptAgreement, checkAgreement, resetAgreement } from "@/storage";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const splashLogo = require("./assets/splash-icon.png");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const headerLogo = require("./assets/icon.png");

const SPLASH_DURATION_MS = 2000;
const APP_LABEL = (Constants.expoConfig?.extra?.appLabel as string) ?? "";

/** Root component that manages the HIPAA agreement flow and delegates entry state to useEntries. */
export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showAgreement, setShowAgreement] = useState(false);
  const [agreementLoaded, setAgreementLoaded] = useState(false);
  const {
    entries,
    deletedEntry,
    load,
    add,
    remove,
    removeAll,
    seed,
    undo,
    dismissUndo,
  } = useEntries();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function init() {
      const [accepted] = await Promise.all([
        checkAgreement().catch((e) => {
          console.error("Failed to check agreement", e);
          return true;
        }),
        load().catch((e) => console.error("Failed to load entries", e)),
      ]);
      if (!accepted) {
        setShowAgreement(true);
      }
      setAgreementLoaded(true);

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
    }
    init();
  }, [load]);

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

  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <Image
          source={splashLogo}
          style={styles.splashLogo}
          resizeMode="contain"
          testID="splash-logo"
        />
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <Image
          source={headerLogo}
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <Text style={styles.title}>in due time</Text>
        {APP_LABEL !== "" && <Text style={styles.appLabel}>{APP_LABEL}</Text>}
        {__DEV__ && (
          <DevToolbar
            onSeedData={seed}
            onResetAgreement={handleResetAgreement}
          />
        )}
      </View>

      <EntryForm onAdd={add} />
      <EntryList entries={entries} onDelete={remove} onDeleteAll={removeAll} />
      <HipaaAgreementModal
        visible={showAgreement && agreementLoaded}
        onAccept={handleAcceptAgreement}
      />

      {deletedEntry && (
        <UndoToast
          entry={deletedEntry.entry}
          onUndo={undo}
          onDismiss={dismissUndo}
        />
      )}

      <StatusBar style="auto" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f3f1",
  },
  splashLogo: {
    width: 280,
    height: 160,
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    gap: 10,
    zIndex: 10,
    overflow: "visible",
  },
  headerLogo: {
    width: 36,
    height: 36,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },
  appLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4a90d9",
    backgroundColor: "#e8f0fe",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: "hidden",
  },
});
