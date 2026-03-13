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
  it("renders theme, brightness, and layout sections when visible", () => {
    renderWithTheme(<ThemePickerModal {...defaultProps} />);

    expect(screen.getByText("Theme")).toBeTruthy();
    expect(screen.getByText("Classic")).toBeTruthy();
    expect(screen.getByText("Warm")).toBeTruthy();
    expect(screen.getByText("Elegant")).toBeTruthy();
    expect(screen.getByText("Playful")).toBeTruthy();
    expect(screen.getByText("Modern")).toBeTruthy();
    expect(screen.getByText("B&W")).toBeTruthy();

    expect(screen.getByText("Brightness")).toBeTruthy();
    expect(screen.getByText("System")).toBeTruthy();
    expect(screen.getByText("Light")).toBeTruthy();
    expect(screen.getByText("Dark")).toBeTruthy();

    expect(screen.getByText("Layout")).toBeTruthy();
    expect(screen.getByText("Compact")).toBeTruthy();
    expect(screen.getByText("Cozy")).toBeTruthy();
  });

  it("shows checkmark on the active personality", () => {
    renderWithTheme(
      <ThemePickerModal {...defaultProps} currentPersonality="warm" />,
    );

    expect(screen.getByTestId("checkmark-theme-warm")).toBeTruthy();
    expect(screen.queryByTestId("checkmark-theme-classic")).toBeNull();
    expect(screen.queryByTestId("checkmark-theme-mono")).toBeNull();
  });

  it("shows checkmark on the active brightness", () => {
    renderWithTheme(
      <ThemePickerModal {...defaultProps} currentBrightness="dark" />,
    );

    expect(screen.getByTestId("checkmark-brightness-dark")).toBeTruthy();
    expect(screen.queryByTestId("checkmark-brightness-system")).toBeNull();
    expect(screen.queryByTestId("checkmark-brightness-light")).toBeNull();
  });

  it("shows checkmark on the active layout", () => {
    renderWithTheme(
      <ThemePickerModal {...defaultProps} currentLayout="cozy" />,
    );

    expect(screen.getByTestId("checkmark-layout-cozy")).toBeTruthy();
    expect(screen.queryByTestId("checkmark-layout-compact")).toBeNull();
  });

  it("calls onSelectLayout when a layout option is pressed", () => {
    const onSelectLayout = jest.fn();
    renderWithTheme(
      <ThemePickerModal {...defaultProps} onSelectLayout={onSelectLayout} />,
    );

    fireEvent.press(screen.getByText("Cozy"));

    expect(onSelectLayout).toHaveBeenCalledWith("cozy");
  });

  it("calls onSelectPersonality when a theme option is pressed", () => {
    const onSelectPersonality = jest.fn();
    renderWithTheme(
      <ThemePickerModal
        {...defaultProps}
        onSelectPersonality={onSelectPersonality}
      />,
    );

    fireEvent.press(screen.getByText("Warm"));

    expect(onSelectPersonality).toHaveBeenCalledWith("warm");
  });

  it("calls onSelectBrightness when a brightness option is pressed", () => {
    const onSelectBrightness = jest.fn();
    renderWithTheme(
      <ThemePickerModal
        {...defaultProps}
        onSelectBrightness={onSelectBrightness}
      />,
    );

    fireEvent.press(screen.getByText("Light"));

    expect(onSelectBrightness).toHaveBeenCalledWith("light");
  });

  it("calls onClose when backdrop is pressed", () => {
    const onClose = jest.fn();
    renderWithTheme(<ThemePickerModal {...defaultProps} onClose={onClose} />);

    fireEvent.press(screen.getByLabelText("Close theme picker"));

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
});
