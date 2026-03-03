import { act, screen } from "@testing-library/react-native";

import renderWithTheme from "@/test/renderWithTheme";

import InfoToast from "./InfoToast";

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
});
