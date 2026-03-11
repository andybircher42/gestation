import { Linking } from "react-native";
import { fireEvent, screen } from "@testing-library/react-native";

import renderWithTheme from "@/test/renderWithTheme";

import ThemePickerModal from "./ThemePickerModal";

const defaultProps = {
  visible: true,
  currentMode: "system" as const,
  onSelect: jest.fn(),
  onClose: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ThemePickerModal", () => {
  it("renders all 4 option labels when visible", () => {
    renderWithTheme(<ThemePickerModal {...defaultProps} />);

    expect(screen.getByText("Appearance")).toBeTruthy();
    expect(screen.getByText("System")).toBeTruthy();
    expect(screen.getByText("Light")).toBeTruthy();
    expect(screen.getByText("Dark")).toBeTruthy();
    expect(screen.getByText("B&W")).toBeTruthy();
  });

  it("shows checkmark on the active mode", () => {
    renderWithTheme(<ThemePickerModal {...defaultProps} currentMode="dark" />);

    expect(screen.getByTestId("checkmark-dark")).toBeTruthy();
    expect(screen.queryByTestId("checkmark-system")).toBeNull();
    expect(screen.queryByTestId("checkmark-light")).toBeNull();
    expect(screen.queryByTestId("checkmark-mono")).toBeNull();
  });

  it("calls onSelect and onClose when an option is pressed", () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();
    renderWithTheme(
      <ThemePickerModal
        {...defaultProps}
        onSelect={onSelect}
        onClose={onClose}
      />,
    );

    fireEvent.press(screen.getByText("Light"));

    expect(onSelect).toHaveBeenCalledWith("light");
    expect(onClose).toHaveBeenCalledTimes(1);
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

    expect(screen.queryByText("Choose Theme")).toBeNull();
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
