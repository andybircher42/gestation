import { useEffect, useMemo, useRef } from "react";
import { Animated, Dimensions, Modal, StyleSheet, Text, View } from "react-native";

import { ColorTokens, useTheme } from "@/theme";
import { Entry } from "@/storage";
import { getBirthstoneImage } from "@/util";

import BirthstoneIcon from "./BirthstoneIcon";

export type CelebrationStyle = "confetti" | "gentle" | "none";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const PARTICLE_COUNT = 24;
const CONFETTI_DURATION = 2500;
const GENTLE_DURATION = 3500;

const CONFETTI_EMOJIS = ["🎉", "✨", "💫", "⭐", "🌟", "🎊"];
const GENTLE_EMOJIS = ["✨", "💛", "🤍"];

interface CelebrationOverlayProps {
  entry: Entry | null;
  style: CelebrationStyle;
  onComplete: () => void;
}

interface Particle {
  emoji: string;
  x: number;
  delay: number;
  translateY: Animated.Value;
  translateX: Animated.Value;
  opacity: Animated.Value;
  rotate: Animated.Value;
  scale: number;
}

/** Full-screen celebration overlay shown when a baby is delivered. */
export default function CelebrationOverlay({
  entry,
  style,
  onComplete,
}: CelebrationOverlayProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const fadeIn = useRef(new Animated.Value(0)).current;
  const nameScale = useRef(new Animated.Value(0.5)).current;

  const emojis = style === "gentle" ? GENTLE_EMOJIS : CONFETTI_EMOJIS;

  const particles = useMemo<Particle[]>(() => {
    if (!entry || style === "none") return [];
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      emoji: emojis[i % emojis.length],
      x: Math.random() * SCREEN_WIDTH,
      delay: Math.random() * 600,
      translateY: new Animated.Value(-60),
      translateX: new Animated.Value((Math.random() - 0.5) * 80),
      opacity: new Animated.Value(1),
      rotate: new Animated.Value(0),
      scale: 0.6 + Math.random() * 0.8,
    }));
  }, [entry, style, emojis]);

  useEffect(() => {
    if (!entry || style === "none") {
      onComplete();
      return;
    }

    // Fade in + scale name
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(nameScale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate particles
    const particleAnimations = particles.map((p) =>
      Animated.sequence([
        Animated.delay(p.delay),
        Animated.parallel([
          Animated.timing(p.translateY, {
            toValue: SCREEN_HEIGHT + 60,
            duration: style === "gentle" ? 2200 : 1800,
            useNativeDriver: true,
          }),
          Animated.timing(p.translateX, {
            toValue: (Math.random() - 0.5) * 200,
            duration: style === "gentle" ? 2200 : 1800,
            useNativeDriver: true,
          }),
          Animated.timing(p.rotate, {
            toValue: (Math.random() - 0.5) * 4,
            duration: style === "gentle" ? 2200 : 1800,
            useNativeDriver: true,
          }),
          Animated.timing(p.opacity, {
            toValue: 0,
            duration: style === "gentle" ? 2200 : 1800,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    Animated.stagger(30, particleAnimations).start();

    // Auto-dismiss — gentle needs longer for slower particles
    const duration = style === "gentle" ? GENTLE_DURATION : CONFETTI_DURATION;
    const timer = setTimeout(() => {
      Animated.timing(fadeIn, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => onComplete());
    }, duration);

    return () => clearTimeout(timer);
  }, [entry, style, particles, fadeIn, nameScale, onComplete]);

  if (!entry || style === "none") return null;

  const birthstoneImage = entry.birthstone
    ? getBirthstoneImage(entry.birthstone.name)
    : null;

  return (
    <Modal visible transparent animationType="none">
      <Animated.View style={[styles.overlay, { opacity: fadeIn }]}>
        {particles.map((p, i) => (
          <Animated.Text
            key={i}
            style={[
              styles.particle,
              {
                left: p.x,
                fontSize: 20 * p.scale,
                transform: [
                  { translateY: p.translateY },
                  { translateX: p.translateX },
                  {
                    rotate: p.rotate.interpolate({
                      inputRange: [-4, 4],
                      outputRange: ["-720deg", "720deg"],
                    }),
                  },
                ],
                opacity: p.opacity,
              },
            ]}
          >
            {p.emoji}
          </Animated.Text>
        ))}
        <Animated.View
          style={[styles.center, { transform: [{ scale: nameScale }] }]}
        >
          {birthstoneImage && (
            <BirthstoneIcon image={birthstoneImage} size={80} />
          )}
          <Text style={styles.name}>{entry.name}</Text>
          <Text style={styles.subtitle}>delivered 🎉</Text>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.modalOverlay,
      justifyContent: "center",
      alignItems: "center",
    },
    center: {
      alignItems: "center",
      gap: 12,
    },
    name: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.textOnColor,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 18,
      color: colors.textOnColorMuted,
      textAlign: "center",
    },
    particle: {
      position: "absolute",
      top: 0,
    },
  });
}
