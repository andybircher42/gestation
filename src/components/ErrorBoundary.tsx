import React, { Component, ErrorInfo, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ColorTokens, lightColors, useTheme } from "@/theme";

interface Props {
  children: React.ReactNode;
}

interface InnerProps extends Props {
  colors: ColorTokens;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/** Inner class component that catches errors. Receives theme colors as props. */
class ErrorBoundaryInner extends Component<InnerProps, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (__DEV__) {
      console.error("ErrorBoundary caught:", error, info.componentStack);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
          colors={this.props.colors}
        />
      );
    }

    return this.props.children;
  }
}

/** Themed fallback UI shown when an error is caught. */
function ErrorFallback({
  error,
  onRetry,
  colors,
}: {
  error: Error | null;
  onRetry: () => void;
  colors: ColorTokens;
}) {
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container} testID="error-boundary">
      <Ionicons name="warning-outline" size={56} color={colors.destructive} />
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>
        {error?.message ?? "An unexpected error occurred"}
      </Text>
      <Pressable
        style={styles.button}
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Try again"
      >
        <Ionicons name="refresh" size={18} color={colors.white} />
        <Text style={styles.buttonText}>Try again</Text>
      </Pressable>
    </View>
  );
}

/** Hook that returns theme colors, falling back to classic light if outside ThemeProvider. */
function useThemeSafe(): ColorTokens {
  try {
    return useTheme().colors;
  } catch {
    return lightColors;
  }
}

/** Catches unhandled errors and shows a themed recovery UI instead of a blank screen. */
export default function ErrorBoundary({ children }: Props) {
  const colors = useThemeSafe();
  return <ErrorBoundaryInner colors={colors}>{children}</ErrorBoundaryInner>;
}

function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 32,
      backgroundColor: colors.background,
      gap: 12,
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.textPrimary,
      marginTop: 8,
    },
    message: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
    button: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 10,
      marginTop: 12,
    },
    buttonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "600",
    },
  });
}
