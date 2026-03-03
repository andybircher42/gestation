import { render, screen, fireEvent, act } from "@testing-library/react-native";
import UndoToast from "./UndoToast";
import { Entry } from "../storage";

const mockEntry: Entry = {
  id: "1",
  name: "Baby A",
  weeks: 12,
  days: 3,
  dueDate: "2026-06-15",
};

describe("UndoToast", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("displays the deleted entry details", () => {
    render(
      <UndoToast entry={mockEntry} onUndo={jest.fn()} onDismiss={jest.fn()} />,
    );

    expect(screen.getByText("Deleted Baby A (12w 3d)")).toBeTruthy();
  });

  it("shows an Undo button", () => {
    render(
      <UndoToast entry={mockEntry} onUndo={jest.fn()} onDismiss={jest.fn()} />,
    );

    expect(screen.getByText("Undo")).toBeTruthy();
  });

  it("calls onUndo when Undo is pressed", () => {
    const onUndo = jest.fn();
    render(
      <UndoToast entry={mockEntry} onUndo={onUndo} onDismiss={jest.fn()} />,
    );

    fireEvent.press(screen.getByText("Undo"));

    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it("calls onDismiss after 5 seconds", () => {
    const onDismiss = jest.fn();
    render(
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
    render(
      <UndoToast entry={mockEntry} onUndo={jest.fn()} onDismiss={onDismiss} />,
    );

    act(() => {
      jest.advanceTimersByTime(4999);
    });

    expect(onDismiss).not.toHaveBeenCalled();
  });
});
