import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Animated,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { BirthstoneIcon } from "@/components";
import { formatDueDate, getBirthstoneImage } from "@/util";

import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "ViewPatient">;

const ANIM_DURATION = 700;
const FADE_DURATION = 300;

/**
 *
 */
export default function ViewPatientScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { patient, allPatients, tileOrigin } = route.params;

  // Animation values — driven directly
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const borderRadius = useRef(new Animated.Value(12)).current;
  const uiFade = useRef(new Animated.Value(tileOrigin ? 0 : 1)).current;

  const [animStarted, setAnimStarted] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const cardRef = useRef<View>(null);

  // Store origin values for reverse animation
  const originDelta = useRef({ dx: 0, dy: 0, scaleRatio: 1 });

  // Measure the card's final screen position, compute delta from tile origin, animate
  const onCardLayout = useCallback(() => {
    if (animStarted || !tileOrigin) {
      return;
    }
    cardRef.current?.measureInWindow((finalX, finalY, finalW, finalH) => {
      if (finalW === 0) {
        return;
      }

      // Center points
      const tileCX = tileOrigin.x + tileOrigin.width / 2;
      const tileCY = tileOrigin.y + tileOrigin.height / 2;
      const cardCX = finalX + finalW / 2;
      const cardCY = finalY + finalH / 2;

      // Both are 1:1, so width ratio is sufficient
      const scaleRatio = tileOrigin.width / finalW;

      // Save for reverse animation
      const dx = tileCX - cardCX;
      const dy = tileCY - cardCY;
      originDelta.current = { dx, dy, scaleRatio };

      // Compensate border radius for scale: 12px visual at tile size
      const initialRadius = 12 / scaleRatio;

      // Set starting state: tile position and size
      translateX.setValue(dx);
      translateY.setValue(dy);
      scale.setValue(scaleRatio);
      rotation.setValue(0);
      borderRadius.setValue(initialRadius);

      setAnimStarted(true);

      // All transitions simultaneously, then fade in surrounding UI
      // Native-driven group (transform + opacity)
      const nativeAnims = Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: ANIM_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: ANIM_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: ANIM_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: 1,
          duration: ANIM_DURATION,
          useNativeDriver: true,
        }),
      ]);
      // Non-native-driven (borderRadius)
      const radiusAnim = Animated.timing(borderRadius, {
        toValue: 12,
        duration: ANIM_DURATION,
        useNativeDriver: false,
      });

      Animated.sequence([
        Animated.parallel([nativeAnims, radiusAnim]),
        Animated.timing(uiFade, {
          toValue: 1,
          duration: FADE_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [
    animStarted,
    tileOrigin,
    translateX,
    translateY,
    scale,
    rotation,
    borderRadius,
    uiFade,
  ]);

  const rotateY = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  // Counter-rotate content so text stays forwards after 180° spin
  const contentRotateY = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-180deg"],
  });

  // Hide card until animation is ready (prevents flash at final position)
  const cardOpacity = tileOrigin && !animStarted ? 0 : 1;

  // Reverse animation: fade out UI, then shrink + move + spin back to tile
  const handleDone = useCallback(() => {
    if (!tileOrigin) {
      navigation.goBack();
      return;
    }
    const { dx, dy, scaleRatio } = originDelta.current;
    const targetRadius = 12 / scaleRatio;
    Animated.sequence([
      Animated.timing(uiFade, {
        toValue: 0,
        duration: FADE_DURATION,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: dx,
          duration: ANIM_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: dy,
          duration: ANIM_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: scaleRatio,
          duration: ANIM_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: 0,
          duration: ANIM_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(borderRadius, {
          toValue: targetRadius,
          duration: ANIM_DURATION,
          useNativeDriver: false,
        }),
      ]),
    ]).start(() => {
      navigation.goBack();
    });
  }, [
    tileOrigin,
    navigation,
    uiFade,
    translateX,
    translateY,
    scale,
    rotation,
    borderRadius,
  ]);

  const handleEdit = useCallback(() => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            "Edit patient",
            "Remove patient",
            "Schedule delivery",
            "Cancel",
          ],
          cancelButtonIndex: 3,
        },
        (index) => handleMenuSelect(index),
      );
    } else {
      setMenuVisible(true);
    }
  }, []);

  const handleMenuSelect = useCallback(
    (index: number) => {
      setMenuVisible(false);
      if (index === 0) {
        navigation.navigate("AddPatient", { editPatient: patient });
      } else if (index === 1) {
        const doRemove = () => {
          navigation.navigate("Home", {
            removedPatientId: patient.id,
          } as never);
        };
        if (Platform.OS === "web") {
          if (
            window.confirm(`Are you sure you want to remove ${patient.name}?`)
          ) {
            doRemove();
          }
        } else {
          Alert.alert(
            "Remove Patient",
            `Are you sure you want to remove ${patient.name}?`,
            [
              { text: "Cancel", style: "cancel" },
              { text: "Remove", style: "destructive", onPress: doRemove },
            ],
          );
        }
      }
      // index === 2: Schedule delivery — not yet implemented
    },
    [navigation, patient],
  );

  // Nearby patients (±14 days, excluding self)
  const nearbyPatients = useMemo(() => {
    const eddTime = new Date(patient.edd).getTime();
    const twoWeeks = 14 * 24 * 60 * 60 * 1000;
    return allPatients
      .filter((p) => {
        if (p.id === patient.id) {
          return false;
        }
        const diff = Math.abs(new Date(p.edd).getTime() - eddTime);
        return diff <= twoWeeks;
      })
      .sort((a, b) => new Date(a.edd).getTime() - new Date(b.edd).getTime());
  }, [patient, allPatients]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Edit — fades in after card animation */}
      <Animated.View style={[styles.topBar, { opacity: uiFade }]}>
        <Pressable style={styles.editButton} onPress={handleEdit}>
          <MaterialIcons name="edit" size={18} color="#391b59" />
          <Text style={styles.editText}>Edit</Text>
        </Pressable>
      </Animated.View>

      <View style={styles.content}>
        {/* Card — moves, spins, grows from tile origin */}
        <Animated.View
          ref={cardRef}
          onLayout={onCardLayout}
          style={[
            styles.card,
            { backgroundColor: patient.birthstone.color },
            {
              opacity: cardOpacity,
              borderRadius,
              transform: [
                { perspective: 800 },
                { translateX },
                { translateY },
                { rotateY },
                { scale },
              ],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.cardInner,
              { transform: [{ rotateY: contentRotateY }] },
            ]}
          >
            <BirthstoneIcon
              image={getBirthstoneImage(patient.birthstone.name)}
              size={148}
            />
            <View style={styles.textGroup}>
              <Text style={styles.cardTitle}>{patient.name}&rsquo;s Baby</Text>
              <Text style={styles.cardDate}>{formatDueDate(patient.edd)}</Text>
            </View>
          </Animated.View>
        </Animated.View>

        {/* Nearby patients — fades in after card animation */}
        {nearbyPatients.length > 0 && (
          <Animated.View style={[styles.nearbyList, { opacity: uiFade }]}>
            {nearbyPatients.map((p) => (
              <View key={p.id} style={styles.nearbyRow}>
                <Text style={styles.nearbyName}>{p.name}&rsquo;s Baby</Text>
                <Text style={styles.nearbyDate}>{formatDueDate(p.edd)}</Text>
              </View>
            ))}
          </Animated.View>
        )}
      </View>

      {/* Done — fades in after card animation */}
      <Animated.View
        style={[
          styles.buttonArea,
          { paddingBottom: insets.bottom + 16, opacity: uiFade },
        ]}
      >
        <Pressable style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneButtonText}>Done</Text>
        </Pressable>
      </Animated.View>

      {/* Context menu (Android/web) */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuSheet}>
            {["Edit patient", "Remove patient", "Schedule delivery"].map(
              (label, i) => (
                <Pressable
                  key={label}
                  style={styles.menuItem}
                  onPress={() => handleMenuSelect(i)}
                >
                  <Text style={styles.menuItemText}>{label}</Text>
                </Pressable>
              ),
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f1d6",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 29,
    paddingVertical: 16,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  editText: {
    fontFamily: "DMSans-Bold",
    fontSize: 18,
    color: "#391b59",
  },
  content: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 24,
  },
  card: {
    borderRadius: 12,
    overflow: "hidden",
    width: "100%",
    aspectRatio: 1,
  },
  cardInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 17,
    gap: 16,
  },
  textGroup: {
    alignItems: "center",
    gap: 4,
    width: "100%",
  },
  cardTitle: {
    fontFamily: "Fraunces-Bold",
    fontSize: 35,
    color: "#ffffff",
    textAlign: "center",
  },
  cardDate: {
    fontFamily: "DMSans-Bold",
    fontSize: 18,
    color: "#ffffff",
    textAlign: "center",
  },
  nearbyList: {
    marginTop: 24,
    gap: 8,
  },
  nearbyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nearbyName: {
    fontFamily: "DMSans-Bold",
    fontSize: 18,
    color: "#391b59",
  },
  nearbyDate: {
    fontFamily: "DMSans-Regular",
    fontSize: 18,
    color: "#391b59",
    textAlign: "right",
  },
  buttonArea: {
    paddingHorizontal: 16,
    justifyContent: "flex-end",
  },
  doneButton: {
    width: "100%",
    height: 64,
    borderRadius: 16,
    backgroundColor: "#391b59",
    justifyContent: "center",
    alignItems: "center",
  },
  doneButtonText: {
    fontFamily: "DMSans-Bold",
    fontSize: 18,
    color: "#ffffff",
  },
  menuOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  menuSheet: {
    backgroundColor: "rgba(245,245,245,0.95)",
    borderRadius: 14,
    minWidth: 220,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 17,
    color: "#333",
  },
});
