import {
  BackHandler,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface HipaaDisclaimerProps {
  visible: boolean;
  onAccept: () => void;
}

/**
 *
 */
export default function HipaaDisclaimer({
  visible,
  onAccept,
}: HipaaDisclaimerProps) {
  const handleDecline = () => {
    if (Platform.OS === "web") {
      // Can't really quit a web app, just show alert
      alert("You must accept to use this app.");
    } else {
      BackHandler.exitApp();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.content}>
            <Text style={styles.title}>Important Notice</Text>
            <Text style={styles.body}>
              This app is not HIPAA compliant. By using this app, you agree that
              you will not enter any Protected Health Information (PHI) as
              defined by HIPAA, including but not limited to patient last names,
              medical record numbers, or any other information that could be
              used to identify a patient.
            </Text>
            <Text style={styles.body}>
              This app stores data locally on your device without encryption and
              is intended for personal, non-clinical use only.
            </Text>
          </View>
          <View style={styles.divider} />
          <Pressable
            style={styles.button}
            onPress={onAccept}
            accessibilityRole="button"
          >
            <Text style={styles.acceptText}>I Agree</Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable
            style={styles.button}
            onPress={handleDecline}
            accessibilityRole="button"
          >
            <Text style={styles.declineText}>Decline — quit app</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 14,
    width: "100%",
    maxWidth: 300,
    overflow: "hidden",
  },
  content: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    color: "#000",
    marginBottom: 12,
  },
  body: {
    fontSize: 13,
    color: "#333",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  button: {
    paddingVertical: 12,
    alignItems: "center",
  },
  acceptText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#007AFF",
  },
  declineText: {
    fontSize: 17,
    color: "#FF3B30",
  },
});
