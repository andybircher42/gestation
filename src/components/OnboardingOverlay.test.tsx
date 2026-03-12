import { act, fireEvent, screen } from "@testing-library/react-native";

import renderWithTheme from "@/test/renderWithTheme";

import OnboardingOverlay from "./OnboardingOverlay";

jest.useFakeTimers();

describe("OnboardingOverlay", () => {
  it("renders all lines of text when visible", () => {
    renderWithTheme(
      <OnboardingOverlay visible={true} onComplete={jest.fn()} />,
    );

    expect(
      screen.getByText("You'll support dozens of families this year."),
    ).toBeTruthy();
    expect(
      screen.getByText("Each one trusting you to remember the details."),
    ).toBeTruthy();
    expect(screen.getByText("In Due Time keeps track,")).toBeTruthy();
    expect(screen.getByText("so you can focus on care.")).toBeTruthy();
  });

  it("does not render content when visible=false", () => {
    renderWithTheme(
      <OnboardingOverlay visible={false} onComplete={jest.fn()} />,
    );

    expect(
      screen.queryByText("You'll support dozens of families this year."),
    ).toBeNull();
  });

  it('renders "Get Started" button (initially transparent, visible after delay)', () => {
    renderWithTheme(
      <OnboardingOverlay visible={true} onComplete={jest.fn()} />,
    );

    // Button is always in the DOM but starts transparent
    expect(screen.getByText("Get Started")).toBeTruthy();
  });

  it("calls onComplete when Get Started is pressed", () => {
    const onComplete = jest.fn();
    renderWithTheme(
      <OnboardingOverlay visible={true} onComplete={onComplete} />,
    );

    act(() => {
      jest.advanceTimersByTime(7000);
    });

    fireEvent.press(screen.getByText("Get Started"));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('"Get Started" button has accessible role and label', () => {
    renderWithTheme(
      <OnboardingOverlay visible={true} onComplete={jest.fn()} />,
    );

    expect(screen.getByRole("button", { name: "Get started" })).toBeTruthy();
  });
});
