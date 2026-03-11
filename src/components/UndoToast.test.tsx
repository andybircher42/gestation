import { act, fireEvent, screen } from "@testing-library/react-native";

import { Entry } from "@/storage";
import renderWithTheme from "@/test/renderWithTheme";

import UndoToast from "./UndoToast";

const mockInsets = { top: 0, bottom: 0, left: 0, right: 0 };

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => mockInsets,
}));

// dueDate 2026-09-11 → 12w3d when today is 2026-03-02
const mockEntry: Entry = {
  id: "1",
  name: "Baby A",
  dueDate: "2026-09-11",
};

/** Renders UndoToast with defaults for onUndo/onDismiss. Returns the mocks. */
function renderToast(
  overrides: { onUndo?: jest.Mock; onDismiss?: jest.Mock } = {},
) {
  const onUndo = overrides.onUndo ?? jest.fn();
  const onDismiss = overrides.onDismiss ?? jest.fn();
  renderWithTheme(
    <UndoToast entry={mockEntry} onUndo={onUndo} onDismiss={onDismiss} />,
  );
  return { onUndo, onDismiss };
}

describe("UndoToast", () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: new Date(2026, 2, 2) });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("displays the deleted entry details", () => {
    renderToast();
    expect(screen.getByText("Removed Baby A (12w 3d)")).toBeTruthy();
  });

  it("is announced by screen readers as an alert", () => {
    renderToast();
    const toast = screen.getByTestId("undo-toast");
    expect(toast.props.accessibilityRole).toBe("alert");
    expect(toast.props.accessibilityLiveRegion).toBe("polite");
    expect(toast.props.accessibilityLabel).toBe(
      "Removed Baby A, 12 weeks 3 days",
    );
  });

  it("shows an Undo button", () => {
    renderToast();
    expect(screen.getByText("Undo")).toBeTruthy();
  });

  it("calls onUndo when Undo is pressed", () => {
    const { onUndo } = renderToast();
    fireEvent.press(screen.getByText("Undo"));
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it("calls onDismiss after 5 seconds", () => {
    const { onDismiss } = renderToast();

    expect(onDismiss).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("does not call onDismiss before 5 seconds", () => {
    const { onDismiss } = renderToast();

    act(() => {
      jest.advanceTimersByTime(4999);
    });

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("applies safe area bottom inset to positioning", () => {
    mockInsets.bottom = 34;
    renderToast();

    const toast = screen.getByTestId("undo-toast");
    const flatStyle = Array.isArray(toast.props.style)
      ? Object.assign({}, ...toast.props.style.flat())
      : toast.props.style;
    // max(34, 16) + 16 = 50
    expect(flatStyle.bottom).toBe(50);
    mockInsets.bottom = 0;
  });
});
