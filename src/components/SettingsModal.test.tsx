import { fireEvent, screen } from "@testing-library/react-native";

import renderWithTheme from "@/test/renderWithTheme";

import SettingsModal from "./SettingsModal";

const defaultProps = {
  visible: true,
  currentDeliveredTTL: 3,
  analyticsOptOut: false,
  onSelectDeliveredTTL: jest.fn(),
  onToggleAnalytics: jest.fn(),
  onClose: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("SettingsModal", () => {
  it("renders delivered cleanup and analytics rows", () => {
    renderWithTheme(<SettingsModal {...defaultProps} />);

    expect(screen.getByText("Delivered cleanup")).toBeTruthy();
    expect(screen.getByText("3 days")).toBeTruthy();
    expect(screen.getByText("Analytics")).toBeTruthy();
    expect(screen.getByText("On")).toBeTruthy();
  });

  it("shows analytics as Off when opted out", () => {
    renderWithTheme(<SettingsModal {...defaultProps} analyticsOptOut />);

    expect(screen.getByText("Off")).toBeTruthy();
  });

  it("calls onToggleAnalytics when analytics row is pressed", () => {
    const onToggleAnalytics = jest.fn();
    renderWithTheme(
      <SettingsModal
        {...defaultProps}
        onToggleAnalytics={onToggleAnalytics}
      />,
    );

    fireEvent.press(screen.getByLabelText("Analytics enabled. Tap to disable."));

    expect(onToggleAnalytics).toHaveBeenCalledTimes(1);
  });

  it("drills into TTL subpage and calls onSelectDeliveredTTL", () => {
    const onSelectDeliveredTTL = jest.fn();
    renderWithTheme(
      <SettingsModal
        {...defaultProps}
        onSelectDeliveredTTL={onSelectDeliveredTTL}
      />,
    );

    fireEvent.press(screen.getByLabelText("Delivered cleanup settings"));
    fireEvent.press(screen.getByText("1 week"));

    expect(onSelectDeliveredTTL).toHaveBeenCalledWith(7);
  });

  it("calls onAppInfo and onClose when version row is pressed", () => {
    const onAppInfo = jest.fn();
    const onClose = jest.fn();
    renderWithTheme(
      <SettingsModal
        {...defaultProps}
        onAppInfo={onAppInfo}
        onClose={onClose}
      />,
    );

    fireEvent.press(screen.getByLabelText("About and help"));

    expect(onAppInfo).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when backdrop is pressed", () => {
    const onClose = jest.fn();
    renderWithTheme(<SettingsModal {...defaultProps} onClose={onClose} />);

    fireEvent.press(screen.getByLabelText("Close settings"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not render content when visible=false", () => {
    renderWithTheme(<SettingsModal {...defaultProps} visible={false} />);

    expect(screen.queryByText("Delivered cleanup")).toBeNull();
  });
});
