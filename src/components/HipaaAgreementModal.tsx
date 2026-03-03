import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import colors from "@/theme/colors";

interface HipaaAgreementModalProps {
  visible: boolean;
  onAccept: () => void;
}

/** Modal that displays the HIPAA non-compliance disclaimer and requires user acceptance. */
export default function HipaaAgreementModal({
  visible,
  onAccept,
}: HipaaAgreementModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Important Notice</Text>
          <ScrollView style={styles.modalScroll}>
            <Text style={styles.modalText}>
              This app is not HIPAA compliant. By using this app, you agree that
              you will not enter any Protected Health Information (PHI) as
              defined by HIPAA, including but not limited to patient last names,
              medical record numbers, or any other information that could be
              used to identify a patient.
            </Text>
            <Text style={styles.modalText}>
              This app stores data locally on your device without encryption and
              is intended for personal, non-clinical use only.
            </Text>
          </ScrollView>
          <Pressable style={styles.agreeButton} onPress={onAccept}>
            <Text style={styles.agreeButtonText}>I Agree</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 16,
    textAlign: "center",
  },
  modalScroll: {
    marginBottom: 20,
  },
  modalText: {
    fontSize: 15,
    color: colors.textModal,
    lineHeight: 22,
    marginBottom: 12,
  },
  agreeButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  agreeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
