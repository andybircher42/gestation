import { Text } from "react-native";
import { screen } from "@testing-library/react-native";

import { Entry } from "@/storage";
import renderWithTheme from "@/test/renderWithTheme";

import InfoToast from "./InfoToast";
import ToastStack from "./ToastStack";
import UndoToast from "./UndoToast";

const mockInsets = { top: 0, bottom: 0, left: 0, right: 0 };

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => mockInsets,
}));

const mockEntry: Entry = {
  id: "1",
  name: "Sam",
  dueDate: "2026-09-11",
  createdAt: 1000,
};

describe("ToastStack", () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: new Date(2026, 2, 2) });
    mockInsets.bottom = 0;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders children", () => {
    renderWithTheme(
      <ToastStack>
        <Text>Toast A</Text>
        <Text>Toast B</Text>
      </ToastStack>,
    );

    expect(screen.getByText("Toast A")).toBeTruthy();
    expect(screen.getByText("Toast B")).toBeTruthy();
  });

  it("renders multiple embedded toasts simultaneously", () => {
    renderWithTheme(
      <ToastStack>
        <UndoToast
          entry={mockEntry}
          onUndo={jest.fn()}
          onDismiss={jest.fn()}
          embedded
        />
        <InfoToast message="Save failed" onDismiss={jest.fn()} embedded />
      </ToastStack>,
    );

    expect(screen.getByText(/Removed Sam/)).toBeTruthy();
    expect(screen.getByText("Save failed")).toBeTruthy();
  });

  it("applies safe area bottom inset to the stack container", () => {
    mockInsets.bottom = 34;
    renderWithTheme(
      <ToastStack>
        <Text testID="child">Hello</Text>
      </ToastStack>,
    );

    const container = screen.getByTestId("toast-stack");
    const flatStyle = Array.isArray(container.props.style)
      ? Object.assign({}, ...container.props.style.flat())
      : container.props.style;
    // max(34, 16) + 16 = 50
    expect(flatStyle.bottom).toBe(50);
  });

  it("renders conditionally — only shows active toasts", () => {
    const showDelete = true;
    const showDeliver = false;

    renderWithTheme(
      <ToastStack>
        {showDelete && (
          <UndoToast
            entry={mockEntry}
            onUndo={jest.fn()}
            onDismiss={jest.fn()}
            embedded
          />
        )}
        {showDeliver && (
          <UndoToast
            entry={{ ...mockEntry, id: "2", name: "Alex" }}
            action="Delivered"
            onUndo={jest.fn()}
            onDismiss={jest.fn()}
            embedded
          />
        )}
      </ToastStack>,
    );

    expect(screen.getByText(/Removed Sam/)).toBeTruthy();
    expect(screen.queryByText(/Delivered Alex/)).toBeNull();
  });
});
