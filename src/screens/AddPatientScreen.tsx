import { ReactNode, useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

import { BirthstoneIcon, GestationalAgeInput } from "@/components";
import { Patient } from "@/storage";
import {
  Birthstone,
  computeDueDate,
  formatDueDate,
  gestationalAgeFromDueDate,
  getBirthstoneForDate,
  getBirthstoneImage,
  toISODateString,
} from "@/util";

import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "AddPatient">;

type InputMode = "dueDate" | "gestationalAge";

const STEP_LABELS = ["Name", "Due date", "Avatar"] as const;

// Helper to generate patient ID
let addPatientIdCounter = 0;
function generatePatientId(): string {
  return `p-${Date.now()}-${addPatientIdCounter++}`;
}

// ---------------------------------------------------------------------------
// Shared layout: progress bar + content + bottom buttons
// ---------------------------------------------------------------------------

const KEYBOARD_OFFSET = Platform.OS === "web" ? 316 : 0;

interface StepLayoutProps {
  step: 1 | 2 | 3;
  insets: { top: number };
  onBack: () => void;
  onStepTap?: (step: 1 | 2 | 3) => void;
  contentFade?: Animated.Value;
  floatButtons?: boolean;
  children: ReactNode;
  buttons: ReactNode;
}

function StepLayout({
  step,
  insets,
  onBack,
  onStepTap,
  contentFade,
  floatButtons,
  children,
  buttons,
}: StepLayoutProps) {
  return (
    <View style={styles.container}>
      {/* Progress indicator */}
      <View style={[styles.progressBar, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <View style={styles.stepPills}>
          {STEP_LABELS.map((label, i) => {
            const stepNum = (i + 1) as 1 | 2 | 3;
            const isActive = stepNum === step;
            const isCompleted = stepNum < step;
            return (
              <Pressable
                key={label}
                onPress={() => onStepTap?.(stepNum)}
                style={[
                  styles.pill,
                  isActive && styles.pillActive,
                  isCompleted && styles.pillCompleted,
                  !isActive && !isCompleted && styles.pillFuture,
                ]}
              >
                <Text
                  style={[
                    styles.pillText,
                    isActive && styles.pillTextActive,
                    isCompleted && styles.pillTextCompleted,
                    !isActive && !isCompleted && styles.pillTextFuture,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Animated.View
          style={[
            styles.contentArea,
            contentFade ? { opacity: contentFade } : undefined,
          ]}
        >
          {children}
        </Animated.View>
        {!floatButtons && (
          <Animated.View
            style={[
              styles.buttonArea,
              contentFade ? { opacity: contentFade } : undefined,
            ]}
          >
            {buttons}
          </Animated.View>
        )}
      </KeyboardAvoidingView>
      {floatButtons && (
        <Animated.View
          style={[
            styles.buttonArea,
            styles.buttonAreaFloat,
            contentFade ? { opacity: contentFade } : undefined,
          ]}
        >
          {buttons}
        </Animated.View>
      )}
      <StatusBar style="dark" />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Shared question + input layout (steps 1 & 2)
// ---------------------------------------------------------------------------

interface QuestionStepProps {
  question: string;
  error: string;
  children: ReactNode; // the input field(s)
}

function QuestionStep({ question, error, children }: QuestionStepProps) {
  return (
    <View style={styles.questionStepContent}>
      <Text style={styles.question}>{question}</Text>
      {children}
      {error !== "" && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

/**
 *
 */
export default function AddPatientScreen({ navigation, route }: Props) {
  const editPatient = route.params?.editPatient;
  const isEditMode = !!editPatient;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState(editPatient?.name ?? "");
  const [inputMode, setInputMode] = useState<InputMode>("dueDate");
  const [dueDateText, setDueDateText] = useState(() => {
    if (!editPatient) {
      return "";
    }
    const [, m, d] = editPatient.edd.split("-");
    return `${m}/${d}`;
  });
  const [weeks, setWeeks] = useState("");
  const [days, setDays] = useState("");
  const [error, setError] = useState("");

  // Computed values for step 3
  const [finalEdd, setFinalEdd] = useState(editPatient?.edd ?? "");
  const [finalBirthstone, setFinalBirthstone] = useState<Birthstone>(
    editPatient?.birthstone ?? { name: "Garnet", color: "#d6216e" },
  );

  // Track highest step reached (for tappable pills)
  const [maxStepReached, setMaxStepReached] = useState<1 | 2 | 3>(
    isEditMode ? 3 : 1,
  );

  // Fade between steps
  const contentFade = useRef(new Animated.Value(1)).current;

  // Step 3 card spin animation
  const hasSeenStep3 = useRef(false);
  const cardSpinX = useRef(new Animated.Value(0)).current;
  const cardSpinY = useRef(new Animated.Value(0)).current;
  const cardFadeIn = useRef(new Animated.Value(0)).current;

  const playCardSpin = () => {
    cardSpinX.setValue(0);
    cardSpinY.setValue(0);
    cardFadeIn.setValue(0);
    Animated.parallel([
      Animated.timing(cardSpinX, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(cardSpinY, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(cardFadeIn, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const cardRotateX = cardSpinX.interpolate({
    inputRange: [0, 1],
    outputRange: ["90deg", "0deg"],
  });
  const cardRotateY = cardSpinY.interpolate({
    inputRange: [0, 1],
    outputRange: ["90deg", "0deg"],
  });

  const changeStep = (next: 1 | 2 | 3) => {
    Animated.timing(contentFade, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      setStep(next);
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start(() => {
        if (next === 3) {
          if (!hasSeenStep3.current) {
            hasSeenStep3.current = true;
            playCardSpin();
          }
        }
      });
    });
  };

  const nameInputRef = useRef<TextInput>(null);
  const patientCount = route.params?.patientCount ?? 0;
  const insets = useSafeAreaInsets();

  // Fade animation for step 1 arrow button
  const step1ButtonOpacity = useRef(new Animated.Value(0)).current;
  const hasName = name.trim().length > 0;

  useEffect(() => {
    Animated.timing(step1ButtonOpacity, {
      toValue: hasName ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [hasName, step1ButtonOpacity]);

  // Fade animation for step 2 arrow button
  const step2ButtonOpacity = useRef(new Animated.Value(0)).current;
  const hasDateInput =
    inputMode === "dueDate"
      ? dueDateText.length === 5 && dueDateText.charAt(2) === "/"
      : weeks.length >= 2 && days.length >= 1;

  useEffect(() => {
    Animated.timing(step2ButtonOpacity, {
      toValue: hasDateInput ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [hasDateInput, step2ButtonOpacity]);

  // Focus name input when on step 1 (handles edit mode navigation)
  useEffect(() => {
    if (step === 1) {
      setTimeout(() => nameInputRef.current?.focus(), 150);
    }
  }, [step]);

  const handleBack = () => {
    if (step === 1) {
      navigation.goBack();
    } else {
      changeStep((step - 1) as 1 | 2);
      setError("");
    }
  };

  const handleStepTap = (target: 1 | 2 | 3) => {
    if (target <= maxStepReached && target !== step) {
      setError("");
      changeStep(target);
    }
  };

  const handleStep1Next = () => {
    if (name.trim().length === 0) {
      setError("Please enter a name");
      return;
    }
    setError("");
    changeStep(2);
    setMaxStepReached((prev) => Math.max(prev, 2) as 1 | 2 | 3);
  };

  const handleStep2Next = () => {
    let edd: string;

    if (inputMode === "dueDate") {
      const parts = dueDateText.split("/");
      if (parts.length < 2 || parts[1].length === 0) {
        setError("Enter date as MM/DD");
        return;
      }
      const month = parseInt(parts[0], 10);
      const day = parseInt(parts[1], 10);

      if (month < 1 || month > 12 || day < 1 || day > 31) {
        setError("Invalid date");
        return;
      }

      // Infer year: use current year, or next year if the date has passed
      const now = new Date();
      const thisYear = now.getFullYear();
      const candidate = new Date(thisYear, month - 1, day);
      const year =
        candidate <
        new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
          ? thisYear + 1
          : thisYear;

      const date = new Date(year, month - 1, day);
      if (date.getMonth() !== month - 1 || date.getDate() !== day) {
        setError("Invalid date");
        return;
      }

      edd = toISODateString(date);
    } else {
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
    changeStep(3);
    setMaxStepReached(3);
  };

  const buildPatient = (): Patient => ({
    id: editPatient?.id ?? generatePatientId(),
    name: name.trim(),
    edd: finalEdd,
    birthstone: finalBirthstone,
  });

  const handleDone = () => {
    if (isEditMode) {
      navigation.navigate("Home", { updatedPatient: buildPatient() });
    } else {
      navigation.navigate("Home", { newPatient: buildPatient() });
    }
  };

  const handleAddAnother = () => {
    navigation.navigate("Home", { newPatient: buildPatient() });
    setTimeout(() => {
      setStep(1);
      setName("");
      setDueDateText("");
      setWeeks("");
      setDays("");
      setError("");
      hasSeenStep3.current = false;
      cardFadeIn.setValue(0);
      navigation.navigate("AddPatient", { patientCount: patientCount + 1 });
    }, 100);
  };

  const handleDueDateChange = (text: string) => {
    const cleaned = text.replace(/[^0-9/]/g, "").slice(0, 5);
    if (
      cleaned.length === 2 &&
      !cleaned.includes("/") &&
      dueDateText.length < text.length
    ) {
      setDueDateText(cleaned + "/");
    } else {
      setDueDateText(cleaned);
    }
    setError("");
  };

  const toggleInputMode = () => {
    if (inputMode === "dueDate") {
      // Convert MM/DD → gestational age if complete
      if (dueDateText.length === 5 && dueDateText.charAt(2) === "/") {
        const parts = dueDateText.split("/");
        const month = parseInt(parts[0], 10);
        const day = parseInt(parts[1], 10);
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          const now = new Date();
          const thisYear = now.getFullYear();
          const candidate = new Date(thisYear, month - 1, day);
          const year =
            candidate <
            new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
              ? thisYear + 1
              : thisYear;
          const edd = toISODateString(new Date(year, month - 1, day));
          const ga = gestationalAgeFromDueDate(edd);
          setWeeks(String(ga.weeks).padStart(2, "0"));
          setDays(String(ga.days));
        }
      } else {
        setWeeks("");
        setDays("");
      }
      setInputMode("gestationalAge");
    } else {
      // Convert GA → due date if weeks is entered
      if (weeks.length > 0) {
        const w = parseInt(weeks, 10);
        const d = parseInt(days || "0", 10);
        if (!isNaN(w) && w >= 0 && w <= 42 && !isNaN(d) && d >= 0 && d <= 6) {
          const dueDate = computeDueDate(w, d);
          const m = String(dueDate.getMonth() + 1).padStart(2, "0");
          const dd = String(dueDate.getDate()).padStart(2, "0");
          setDueDateText(`${m}/${dd}`);
        }
      } else {
        setDueDateText("");
      }
      setInputMode("dueDate");
    }
    setError("");
  };

  // --- Arrow button (shared by steps 1 & 2) ---
  const arrowButton = (
    onPress: () => void,
    opacity: Animated.Value,
    enabled: boolean,
  ) => (
    <Animated.View
      style={{ opacity, width: "100%" }}
      pointerEvents={enabled ? "auto" : "none"}
    >
      <Pressable style={styles.arrowButton} onPress={onPress}>
        <Text style={styles.arrowButtonText}>→</Text>
      </Pressable>
    </Animated.View>
  );

  // --- Date input field ---
  const dueDateInput = (
    <View style={styles.inputRow}>
      <TextInput
        style={styles.fieldInput}
        value={dueDateText}
        onChangeText={handleDueDateChange}
        placeholder="MM/DD"
        placeholderTextColor="rgba(0,0,0,0.1)"
        keyboardType="number-pad"
        autoFocus
        maxLength={5}
      />
      <Pressable style={styles.swapButton} onPress={toggleInputMode}>
        <MaterialIcons name="swap-calls" size={28} color="#391b59" />
      </Pressable>
    </View>
  );

  // --- GA input (same inputRow wrapper as due date) ---
  const gaInput = (
    <View style={styles.inputRow}>
      <GestationalAgeInput
        weeks={weeks}
        days={days}
        onChangeWeeks={(w) => {
          setWeeks(w);
          setError("");
        }}
        onChangeDays={(d) => {
          setDays(d);
          setError("");
        }}
      />
      <Pressable style={styles.swapButton} onPress={toggleInputMode}>
        <MaterialIcons name="swap-calls" size={28} color="#391b59" />
      </Pressable>
    </View>
  );

  // =========================================================================
  // Render
  // =========================================================================

  if (step === 1) {
    return (
      <StepLayout
        step={1}
        insets={insets}
        onBack={handleBack}
        onStepTap={handleStepTap}
        contentFade={contentFade}
        floatButtons
        buttons={arrowButton(handleStep1Next, step1ButtonOpacity, hasName)}
      >
        <QuestionStep
          question={`What is your patient's\nfirst name?`}
          error={error}
        >
          <TextInput
            ref={nameInputRef}
            style={styles.fieldInput}
            value={name}
            onChangeText={(t) => {
              setName(t);
              setError("");
            }}
            autoFocus
            returnKeyType="next"
            onSubmitEditing={handleStep1Next}
          />
        </QuestionStep>
      </StepLayout>
    );
  }

  if (step === 2) {
    const questionText =
      inputMode === "dueDate"
        ? `What is ${name}'s\ndue date?`
        : `What is the gestational age\nof ${name}'s baby?`;

    return (
      <StepLayout
        step={2}
        insets={insets}
        onBack={handleBack}
        onStepTap={handleStepTap}
        contentFade={contentFade}
        floatButtons
        buttons={arrowButton(handleStep2Next, step2ButtonOpacity, hasDateInput)}
      >
        <QuestionStep question={questionText} error={error}>
          {inputMode === "dueDate" ? dueDateInput : gaInput}
        </QuestionStep>
      </StepLayout>
    );
  }

  // Step 3: Avatar / confirmation
  return (
    <StepLayout
      step={3}
      insets={insets}
      onBack={handleBack}
      onStepTap={handleStepTap}
      buttons={
        <>
          <Pressable style={styles.primaryButton} onPress={handleDone}>
            <Text style={styles.primaryButtonText}>Done</Text>
          </Pressable>
          {!isEditMode && (
            <Pressable
              style={styles.secondaryButton}
              onPress={handleAddAnother}
            >
              <Text style={styles.secondaryButtonText}>
                Add Another Patient
              </Text>
            </Pressable>
          )}
        </>
      }
    >
      <View style={styles.confirmContent}>
        <Animated.View
          style={[
            styles.confirmCard,
            { backgroundColor: finalBirthstone.color },
            {
              opacity: cardFadeIn,
              transform: [
                { perspective: 800 },
                { rotateX: cardRotateX },
                { rotateY: cardRotateY },
              ],
            },
          ]}
        >
          <BirthstoneIcon
            image={getBirthstoneImage(finalBirthstone.name)}
            size={148}
          />
          <View style={styles.confirmTextGroup}>
            <Text style={styles.confirmTitle}>{name}&rsquo;s Baby</Text>
            <Text style={styles.confirmDetail}>{formatDueDate(finalEdd)}</Text>
          </View>
        </Animated.View>
      </View>
    </StepLayout>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  // Shell
  container: {
    flex: 1,
    backgroundColor: "#f0f1d6",
  },
  content: {
    flex: 1,
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 48,
  },
  buttonArea: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  buttonAreaFloat: {
    position: "absolute",
    bottom: KEYBOARD_OFFSET,
    left: 0,
    right: 0,
  },

  // Progress bar
  progressBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backArrow: {
    fontSize: 24,
    color: "#391b59",
  },
  stepPills: {
    flexDirection: "row",
    gap: 6,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pillActive: {
    backgroundColor: "#391b59",
  },
  pillCompleted: {
    borderWidth: 1,
    borderColor: "#391b59",
  },
  pillFuture: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  pillText: {
    fontFamily: "DMSans-Bold",
    fontSize: 18,
  },
  pillTextActive: {
    color: "#f0f1d6",
  },
  pillTextCompleted: {
    color: "#391b59",
  },
  pillTextFuture: {
    color: "rgba(0,0,0,0.1)",
  },

  // Shared question + input layout
  questionStepContent: {
    alignItems: "flex-start",
    width: "100%",
  },
  question: {
    fontFamily: "Fraunces-Regular",
    fontSize: 24,
    color: "#391b59",
    textAlign: "left",
    marginBottom: 32,
  },
  fieldInput: {
    fontFamily: "DMSans-Bold",
    fontSize: 48,
    color: "#391b59",
    textAlign: "left",
    width: "100%",
    outlineStyle: "none",
  } as never,
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    flexWrap: "nowrap",
  },
  swapButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    fontFamily: "DMSans-Regular",
    fontSize: 14,
    color: "#dc2626",
    marginTop: 8,
  },

  // Arrow button (steps 1 & 2)
  arrowButton: {
    width: "100%",
    height: 64,
    borderRadius: 16,
    backgroundColor: "#391b59",
    justifyContent: "center",
    alignItems: "center",
  },
  arrowButtonText: {
    fontFamily: "DMSans-Bold",
    fontSize: 18,
    color: "#ffffff",
  },

  // Confirmation (step 3) — content
  confirmContent: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: -6, // 28px contentArea padding → 22px effective margin
  },
  confirmCard: {
    borderRadius: 12,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    aspectRatio: 1,
    gap: 16,
  },
  confirmTextGroup: {
    alignItems: "center",
    gap: 4,
    width: "100%",
  },
  confirmTitle: {
    fontFamily: "Fraunces-Bold",
    fontSize: 35,
    color: "#ffffff",
    textAlign: "center",
  },
  confirmDetail: {
    fontFamily: "DMSans-Bold",
    fontSize: 18,
    color: "#ffffff",
    textAlign: "center",
  },

  // Buttons (step 3)
  primaryButton: {
    width: "100%",
    height: 64,
    borderRadius: 16,
    backgroundColor: "#391b59",
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: {
    fontFamily: "DMSans-Bold",
    fontSize: 18,
    color: "#ffffff",
  },
  secondaryButton: {
    width: "100%",
    height: 64,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    fontFamily: "DMSans-Bold",
    fontSize: 18,
    color: "#391b59",
  },
});
