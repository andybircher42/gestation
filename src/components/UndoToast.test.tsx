import { act, fireEvent, screen } from "@testing-library/react-native";

import { Entry } from "@/storage";
import renderWithTheme from "@/test/renderWithTheme";

import UndoToast from "./UndoToast";

// dueDate 2026-09-11 → 12w3d when today is 2026-03-02
const mockEntry: Entry = {
  id: "1",
  name: "Baby A",
  dueDate: "2026-09-11",
};

describe("UndoToast", () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: new Date(2026, 2, 2) });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("displays the deleted entry details", () => {
    renderWithTheme(
      <UndoToast entry={mockEntry} onUndo={jest.fn()} onDismiss={jest.fn()} />,
    );

    expect(screen.getByText("Deleted Baby A (12w 3d)")).toBeTruthy();
  });

  it("shows an Undo button", () => {
    renderWithTheme(
      <UndoToast entry={mockEntry} onUndo={jest.fn()} onDismiss={jest.fn()} />,
    );

    expect(screen.getByText("Undo")).toBeTruthy();
  });

  it("calls onUndo when Undo is pressed", () => {
    const onUndo = jest.fn();
    renderWithTheme(
      <UndoToast entry={mockEntry} onUndo={onUndo} onDismiss={jest.fn()} />,
    );

    fireEvent.press(screen.getByText("Undo"));

    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it("calls onDismiss after 5 seconds", () => {
    const onDismiss = jest.fn();
    renderWithTheme(
      <UndoToast entry={mockEntry} onUndo={jest.fn()} onDismiss={onDismiss} />,
    );

    expect(onDismiss).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("does not call onDismiss before 5 seconds", () => {
    const onDismiss = jest.fn();
    renderWithTheme(
      <UndoToast entry={mockEntry} onUndo={jest.fn()} onDismiss={onDismiss} />,
    );

    act(() => {
      jest.advanceTimersByTime(4999);
    });

    expect(onDismiss).not.toHaveBeenCalled();
  });
});
