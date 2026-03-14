import { useMemo } from "react";
import {
  BackHandler,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ColorTokens, useTheme } from "@/theme";
import { lineHeight } from "@/util";

interface HipaaAgreementModalProps {
  visible: boolean;
  onAccept: () => void;
}

/** Modal that displays the HIPAA non-compliance disclaimer and requires user acceptance. */
export default function HipaaAgreementModal({
  visible,
  onAccept,
}: HipaaAgreementModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.modalOverlay} accessibilityViewIsModal>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>A quick note about privacy</Text>
          <ScrollView style={styles.modalScroll}>
            <Text style={styles.modalText}>
              Use first names or nicknames only — no last names, medical IDs, or
              anything that could identify a patient. Think of this as a
              personal notebook, not a chart.
            </Text>
            <Text style={styles.modalText}>
              Everything stays right here on your device. Nothing is sent to a
              server or backed up to the cloud.
            </Text>
          </ScrollView>
          <Pressable
            style={styles.agreeButton}
            onPress={onAccept}
            accessibilityRole="button"
            accessibilityLabel="Got it, continue to app"
          >
            <Text style={styles.agreeButtonText}>Got it</Text>
          </Pressable>
          <Pressable
            style={styles.disagreeButton}
            onPress={() => BackHandler.exitApp()}
            accessibilityRole="button"
            accessibilityLabel="Not now, exit app"
          >
            <Text style={styles.disagreeButtonText}>Not now</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

/** Creates styles based on the active color palette. */
function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.modalOverlay,
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    modalContent: {
      backgroundColor: colors.contentBackground,
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
      lineHeight: lineHeight(22),
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
    disagreeButton: {
      marginTop: 12,
      padding: 10,
      alignItems: "center",
    },
    disagreeButtonText: {
      color: colors.textTertiary,
      fontSize: 14,
    },
  });
}
