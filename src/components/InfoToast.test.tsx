import { act, screen } from "@testing-library/react-native";

import renderWithTheme from "@/test/renderWithTheme";

import InfoToast from "./InfoToast";

const mockInsets = { top: 0, bottom: 0, left: 0, right: 0 };

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => mockInsets,
}));

describe("InfoToast", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders the message", () => {
    renderWithTheme(
      <InfoToast
        message="1 entry was corrupted and removed"
        onDismiss={jest.fn()}
      />,
    );

    expect(screen.getByText("1 entry was corrupted and removed")).toBeTruthy();
  });

  it("is announced by screen readers as an alert", () => {
    renderWithTheme(
      <InfoToast message="Something happened" onDismiss={jest.fn()} />,
    );
    const toast = screen.getByLabelText("Something happened");
    expect(toast.props.accessibilityRole).toBe("alert");
    expect(toast.props.accessibilityLiveRegion).toBe("assertive");
  });

  it("calls onDismiss after 5 seconds", () => {
    const onDismiss = jest.fn();
    renderWithTheme(<InfoToast message="Test message" onDismiss={onDismiss} />);

    expect(onDismiss).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("does not call onDismiss before 5 seconds", () => {
    const onDismiss = jest.fn();
    renderWithTheme(<InfoToast message="Test message" onDismiss={onDismiss} />);

    act(() => {
      jest.advanceTimersByTime(4999);
    });

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("applies safe area bottom inset to positioning", () => {
    mockInsets.bottom = 34;
    renderWithTheme(
      <InfoToast message="Safe area test" onDismiss={jest.fn()} />,
    );

    const toast = screen.getByLabelText("Safe area test");
    const flatStyle = Array.isArray(toast.props.style)
      ? Object.assign({}, ...toast.props.style.flat())
      : toast.props.style;
    // max(34, 16) + 16 = 50
    expect(flatStyle.bottom).toBe(50);
    mockInsets.bottom = 0;
  });
});
