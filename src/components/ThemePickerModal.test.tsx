import { Linking } from "react-native";
import { fireEvent, screen } from "@testing-library/react-native";

import renderWithTheme from "@/test/renderWithTheme";

import ThemePickerModal from "./ThemePickerModal";

const defaultProps = {
  visible: true,
  currentPersonality: "classic" as const,
  currentBrightness: "system" as const,
  currentLayout: "compact" as const,
  currentDeliveredTTL: 3,
  onSelectPersonality: jest.fn(),
  onSelectBrightness: jest.fn(),
  onSelectLayout: jest.fn(),
  onSelectDeliveredTTL: jest.fn(),
  onClose: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ThemePickerModal", () => {
  it("renders inline theme, brightness, and layout options when visible", () => {
    renderWithTheme(<ThemePickerModal {...defaultProps} />);

    // Theme pills are visible inline
    expect(screen.getByText("Classic")).toBeTruthy();
    expect(screen.getByText("Warm")).toBeTruthy();
    expect(screen.getByText("Elegant")).toBeTruthy();

    // Brightness pills are visible inline
    expect(screen.getByText("System")).toBeTruthy();
    expect(screen.getByText("Light")).toBeTruthy();
    expect(screen.getByText("Dark")).toBeTruthy();

    // Layout pills are visible inline
    expect(screen.getByText("Compact")).toBeTruthy();
    expect(screen.getByText("Cozy")).toBeTruthy();

    // Delivered cleanup is still a drill-down row
    expect(screen.getByText("Delivered cleanup")).toBeTruthy();
  });

  it("shows current values on main menu rows", () => {
    renderWithTheme(
      <ThemePickerModal
        {...defaultProps}
        currentPersonality="warm"
        currentBrightness="dark"
        currentLayout="cozy"
        currentDeliveredTTL={7}
      />,
    );

    expect(screen.getByText("Warm")).toBeTruthy();
    expect(screen.getByText("Dark")).toBeTruthy();
    expect(screen.getByText("Cozy")).toBeTruthy();
    expect(screen.getByText("1 week")).toBeTruthy();
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

    fireEvent.press(screen.getByLabelText("Close settings"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("opens bug report form with pre-filled version and closes modal on press", () => {
    const spy = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);
    const onClose = jest.fn();
    renderWithTheme(<ThemePickerModal {...defaultProps} onClose={onClose} />);

    fireEvent.press(screen.getByLabelText("Report a Bug"));

    const url = spy.mock.calls[0][0] as string;
    expect(url).toContain("docs.google.com/forms");
    expect(url).toContain("entry.1845428880=");
    expect(url).toContain("entry.765646897=");
    expect(onClose).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it("opens feature request form and closes modal on press", () => {
    const spy = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);
    const onClose = jest.fn();
    renderWithTheme(<ThemePickerModal {...defaultProps} onClose={onClose} />);

    fireEvent.press(screen.getByLabelText("Request a Feature"));

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("docs.google.com/forms"),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it("does not render content when visible=false", () => {
    renderWithTheme(<ThemePickerModal {...defaultProps} visible={false} />);

    expect(screen.queryByText("Theme")).toBeNull();
  });

  it("calls onAppInfo and onClose when App Info row is pressed", () => {
    const onAppInfo = jest.fn();
    const onClose = jest.fn();
    renderWithTheme(
      <ThemePickerModal
        {...defaultProps}
        onAppInfo={onAppInfo}
        onClose={onClose}
      />,
    );

    fireEvent.press(screen.getByLabelText("App Info"));

    expect(onAppInfo).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("drills into TTL subpage and calls onSelectDeliveredTTL", () => {
    const onSelectDeliveredTTL = jest.fn();
    renderWithTheme(
      <ThemePickerModal
        {...defaultProps}
        onSelectDeliveredTTL={onSelectDeliveredTTL}
      />,
    );

    fireEvent.press(screen.getByLabelText("Delivered cleanup settings"));
    fireEvent.press(screen.getByText("1 week"));

    expect(onSelectDeliveredTTL).toHaveBeenCalledWith(7);
  });
});
