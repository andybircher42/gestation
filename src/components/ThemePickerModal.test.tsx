import { fireEvent, screen } from "@testing-library/react-native";

import renderWithTheme from "@/test/renderWithTheme";

import ThemePickerModal from "./ThemePickerModal";

const defaultProps = {
  visible: true,
  currentPersonality: "classic" as const,
  currentBrightness: "system" as const,
  currentLayout: "compact" as const,
  onSelectPersonality: jest.fn(),
  onSelectBrightness: jest.fn(),
  onSelectLayout: jest.fn(),
  onClose: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ThemePickerModal", () => {
  it("renders inline theme, brightness, and layout options when visible", () => {
    renderWithTheme(<ThemePickerModal {...defaultProps} />);

    expect(screen.getByText("Classic")).toBeTruthy();
    expect(screen.getByText("Warm")).toBeTruthy();
    expect(screen.getByText("Elegant")).toBeTruthy();

    expect(screen.getByText("System")).toBeTruthy();
    expect(screen.getByText("Light")).toBeTruthy();
    expect(screen.getByText("Dark")).toBeTruthy();

    expect(screen.getByText("Compact")).toBeTruthy();
    expect(screen.getByText("Cozy")).toBeTruthy();
  });

  it("calls onSelectPersonality when a theme pill is pressed", () => {
    const onSelectPersonality = jest.fn();
    renderWithTheme(
      <ThemePickerModal
        {...defaultProps}
        onSelectPersonality={onSelectPersonality}
      />,
    );

    fireEvent.press(screen.getByLabelText("Warm"));

    expect(onSelectPersonality).toHaveBeenCalledWith("warm");
  });

  it("marks the active personality pill as selected", () => {
    renderWithTheme(
      <ThemePickerModal {...defaultProps} currentPersonality="warm" />,
    );

    expect(screen.getByLabelText("Warm").props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
    expect(screen.getByLabelText("Classic").props.accessibilityState).toEqual(
      expect.objectContaining({ selected: false }),
    );
  });

  it("calls onSelectBrightness when a brightness pill is pressed", () => {
    const onSelectBrightness = jest.fn();
    renderWithTheme(
      <ThemePickerModal
        {...defaultProps}
        onSelectBrightness={onSelectBrightness}
      />,
    );

    fireEvent.press(screen.getByLabelText("Light"));

    expect(onSelectBrightness).toHaveBeenCalledWith("light");
  });

  it("marks the active brightness pill as selected", () => {
    renderWithTheme(
      <ThemePickerModal {...defaultProps} currentBrightness="dark" />,
    );

    expect(screen.getByLabelText("Dark").props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
    expect(screen.getByLabelText("System").props.accessibilityState).toEqual(
      expect.objectContaining({ selected: false }),
    );
  });

  it("calls onSelectLayout when a layout pill is pressed", () => {
    const onSelectLayout = jest.fn();
    renderWithTheme(
      <ThemePickerModal {...defaultProps} onSelectLayout={onSelectLayout} />,
    );

    fireEvent.press(screen.getByLabelText("Cozy"));

    expect(onSelectLayout).toHaveBeenCalledWith("cozy");
  });

  it("marks the active layout pill as selected", () => {
    renderWithTheme(
      <ThemePickerModal {...defaultProps} currentLayout="cozy" />,
    );

    expect(screen.getByLabelText("Cozy").props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
    expect(screen.getByLabelText("Compact").props.accessibilityState).toEqual(
      expect.objectContaining({ selected: false }),
    );
  });

  it("calls onClose when backdrop is pressed", () => {
    const onClose = jest.fn();
    renderWithTheme(<ThemePickerModal {...defaultProps} onClose={onClose} />);

    fireEvent.press(screen.getByLabelText("Close appearance"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not render content when visible=false", () => {
    renderWithTheme(<ThemePickerModal {...defaultProps} visible={false} />);

    expect(screen.queryByText("Theme")).toBeNull();
  });
});
