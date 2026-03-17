import { ReactElement } from "react";
import { render } from "@testing-library/react-native";

import { Brightness, Layout, Personality, ThemeProvider } from "@/theme";

/**
 * Renders a component wrapped in ThemeProvider for testing.
 * Defaults to classic personality with light brightness and compact layout.
 */
export default function renderWithTheme(
  ui: ReactElement,
  {
    personality = "classic",
    brightness = "light",
    layout = "compact",
  }: {
    personality?: Personality;
    brightness?: Brightness;
    layout?: Layout;
  } = {},
) {
  return render(
    <ThemeProvider
      personality={personality}
      brightness={brightness}
      layout={layout}
      celebrationStyle="confetti"
      setPersonality={jest.fn()}
      setBrightness={jest.fn()}
      setLayout={jest.fn()}
      setCelebrationStyle={jest.fn()}
    >
      {ui}
    </ThemeProvider>,
  );
}
