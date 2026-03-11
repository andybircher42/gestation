import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

import { BirthstoneIcon, Header } from "@/components";
import { Patient } from "@/storage";
import {
  Birthstone,
  computeDueDate,
  formatDueDate,
  getBirthstoneForDate,
  toISODateString,
} from "@/util";

import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "AddPatient">;

type InputMode = "dueDate" | "gestationalAge";

// Helper to generate patient ID
let addPatientIdCounter = 0;
function generatePatientId(): string {
  return `p-${Date.now()}-${addPatientIdCounter++}`;
}

/**
 *
 */
export default function AddPatientScreen({ navigation, route }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("dueDate");
  const [dueDateText, setDueDateText] = useState("");
  const [weeks, setWeeks] = useState("");
  const [days, setDays] = useState("");
  const [error, setError] = useState("");

  // Computed values for step 3
  const [finalEdd, setFinalEdd] = useState("");
  const [finalBirthstone, setFinalBirthstone] = useState<Birthstone>({
    name: "Garnet",
    color: "#d6216e",
  });

  const patientCount = route.params?.patientCount ?? 0;

  const handleStep1Next = () => {
    if (name.trim().length === 0) {
      setError("Please enter a name");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleStep2Next = () => {
    let edd: string;

    if (inputMode === "dueDate") {
      // Parse MM/DD or MM/DD/YYYY
      const cleaned = dueDateText.replace(/\//g, "-");
      const parts = cleaned.split("-");
      if (parts.length < 2) {
        setError("Enter date as MM/DD or MM/DD/YYYY");
        return;
      }
      const month = parseInt(parts[0], 10);
      const day = parseInt(parts[1], 10);
      let year: number;
      if (parts.length >= 3 && parts[2].length > 0) {
        year = parseInt(parts[2], 10);
        if (year < 100) {year += 2000;}
      } else {
        // Default to current or next year based on whether date has passed
        const now = new Date();
        const thisYear = now.getFullYear();
        const candidate = new Date(thisYear, month - 1, day);
        year =
          candidate <
          new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
            ? thisYear + 1
            : thisYear;
      }

      if (month < 1 || month > 12 || day < 1 || day > 31) {
        setError("Invalid date");
        return;
      }

      const date = new Date(year, month - 1, day);
      if (date.getMonth() !== month - 1 || date.getDate() !== day) {
        setError("Invalid date");
        return;
      }

      edd = toISODateString(date);
    } else {
      // GA mode
      const w = parseInt(weeks, 10);
      const d = parseInt(days || "0", 10);
      if (isNaN(w) || w < 0 || w > 42) {
        setError("Weeks must be 0-42");
        return;
      }
      if (isNaN(d) || d < 0 || d > 6) {
        setError("Days must be 0-6");
        return;
      }
      const dueDate = computeDueDate(w, d);
      edd = toISODateString(dueDate);
    }

    setError("");
    setFinalEdd(edd);
    setFinalBirthstone(getBirthstoneForDate(edd));
    setStep(3);
  };

  const handleDone = () => {
    const patient: Patient = {
      id: generatePatientId(),
      name: name.trim(),
      edd: finalEdd,
      birthstone: finalBirthstone,
    };
    // Pass patient back via route params callback or navigation
    navigation.navigate("Home", { newPatient: patient });
  };

  const handleAddAnother = () => {
    const patient: Patient = {
      id: generatePatientId(),
      name: name.trim(),
      edd: finalEdd,
      birthstone: finalBirthstone,
    };
    navigation.navigate("Home", { newPatient: patient });
    // Reset and go back to step 1 after a short delay
    setTimeout(() => {
      setStep(1);
      setName("");
      setDueDateText("");
      setWeeks("");
      setDays("");
      setError("");
      navigation.navigate("AddPatient", { patientCount: patientCount + 1 });
    }, 100);
  };

  // Format due date input with auto-slashes
  const handleDueDateChange = (text: string) => {
    // Remove non-numeric except /
    const cleaned = text.replace(/[^0-9/]/g, "");
    // Auto-add slash after MM
    if (
      cleaned.length === 2 &&
      !cleaned.includes("/") &&
      dueDateText.length < text.length
    ) {
      setDueDateText(cleaned + "/");
    } else if (
      cleaned.length === 5 &&
      cleaned.charAt(2) === "/" &&
      !cleaned.substring(3).includes("/") &&
      dueDateText.length < text.length
    ) {
      setDueDateText(cleaned + "/");
    } else {
      setDueDateText(cleaned);
    }
    setError("");
  };

  const toggleInputMode = () => {
    setInputMode((prev) => (prev === "dueDate" ? "gestationalAge" : "dueDate"));
    setError("");
  };

  return (
    <View style={styles.container}>
      <Header patientCount={patientCount} />
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {step === 1 && (
            <View style={styles.stepContainer}>
              <Text style={styles.question}>
                What is your{"\n"}patient's name?
              </Text>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={(t) => {
                  setName(t);
                  setError("");
                }}
                placeholder="First name"
                placeholderTextColor="#999"
                autoFocus
                returnKeyType="next"
                onSubmitEditing={handleStep1Next}
              />
              {error !== "" && <Text style={styles.error}>{error}</Text>}
              <Pressable
                style={[
                  styles.button,
                  name.trim().length === 0 && styles.buttonDisabled,
                ]}
                onPress={handleStep1Next}
                disabled={name.trim().length === 0}
              >
                <Text style={styles.buttonText}>Next</Text>
              </Pressable>
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContainer}>
              <Text style={styles.question}>
                {inputMode === "dueDate"
                  ? `What is ${name}'s\ndue date?`
                  : `What is ${name}'s\ngestational age?`}
              </Text>

              {inputMode === "dueDate" ? (
                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.textInput, styles.dateInput]}
                    value={dueDateText}
                    onChangeText={handleDueDateChange}
                    placeholder="MM/DD"
                    placeholderTextColor="#999"
                    keyboardType="number-pad"
                    autoFocus
                    maxLength={10}
                  />
                  <Pressable
                    style={styles.swapButton}
                    onPress={toggleInputMode}
                  >
                    <Text style={styles.swapIcon}>⇄</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.textInput, styles.gaInput]}
                    value={weeks}
                    onChangeText={(t) => {
                      setWeeks(t.replace(/[^0-9]/g, ""));
                      setError("");
                    }}
                    placeholder="WW"
                    placeholderTextColor="#999"
                    keyboardType="number-pad"
                    autoFocus
                    maxLength={2}
                  />
                  <Text style={styles.gaLabel}>w</Text>
                  <TextInput
                    style={[styles.textInput, styles.gaInput]}
                    value={days}
                    onChangeText={(t) => {
                      setDays(t.replace(/[^0-9]/g, ""));
                      setError("");
                    }}
                    placeholder="DD"
                    placeholderTextColor="#999"
                    keyboardType="number-pad"
                    maxLength={1}
                  />
                  <Text style={styles.gaLabel}>d</Text>
                  <Pressable
                    style={styles.swapButton}
                    onPress={toggleInputMode}
                  >
                    <Text style={styles.swapIcon}>⇄</Text>
                  </Pressable>
                </View>
              )}

              {error !== "" && <Text style={styles.error}>{error}</Text>}
              <Pressable style={styles.button} onPress={handleStep2Next}>
                <Text style={styles.buttonText}>Next</Text>
              </Pressable>
            </View>
          )}

          {step === 3 && (
            <View style={styles.stepContainer}>
              <View style={styles.confirmGem}>
                <BirthstoneIcon color={finalBirthstone.color} size={64} />
              </View>
              <Text style={styles.confirmTitle}>{name}'s baby</Text>
              <Text style={styles.confirmDetail}>
                Due {formatDueDate(finalEdd)}
              </Text>
              <Text style={styles.confirmDetail}>{finalBirthstone.name}</Text>

              <View style={styles.confirmButtons}>
                <Pressable style={styles.button} onPress={handleDone}>
                  <Text style={styles.buttonText}>Done</Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.secondaryButton]}
                  onPress={handleAddAnother}
                >
                  <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                    Add Another Patient
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f1d6",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  stepContainer: {
    alignItems: "center",
  },
  question: {
    fontFamily: "DMSans-Bold",
    fontSize: 24,
    color: "#391b59",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 32,
  },
  textInput: {
    fontFamily: "DMSans-Regular",
    fontSize: 18,
    color: "#333",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    width: "100%",
    maxWidth: 300,
  },
  dateInput: {
    flex: 1,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
    maxWidth: 300,
  },
  gaInput: {
    width: 70,
    textAlign: "center",
    flex: 0,
  },
  gaLabel: {
    fontFamily: "DMSans-Regular",
    fontSize: 18,
    color: "#391b59",
  },
  swapButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#391b59",
    justifyContent: "center",
    alignItems: "center",
  },
  swapIcon: {
    fontSize: 20,
    color: "#fff",
  },
  error: {
    fontFamily: "DMSans-Regular",
    fontSize: 14,
    color: "#dc2626",
    marginTop: 8,
  },
  button: {
    backgroundColor: "#391b59",
    borderRadius: 16,
    paddingHorizontal: 48,
    paddingVertical: 16,
    marginTop: 24,
    minWidth: 200,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: "DMSans-Bold",
    fontSize: 16,
    color: "#ffffff",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#391b59",
  },
  secondaryButtonText: {
    color: "#391b59",
  },
  confirmGem: {
    marginBottom: 24,
  },
  confirmTitle: {
    fontFamily: "Fraunces-Bold",
    fontSize: 28,
    color: "#391b59",
    marginBottom: 8,
  },
  confirmDetail: {
    fontFamily: "DMSans-Regular",
    fontSize: 16,
    color: "#391b59",
    marginBottom: 4,
  },
  confirmButtons: {
    marginTop: 32,
    gap: 12,
    alignItems: "center",
  },
});
