import { fireEvent, screen } from "@testing-library/react-native";

import renderWithTheme from "@/test/renderWithTheme";

import HipaaAgreementModal from "./HipaaAgreementModal";

describe("HipaaAgreementModal", () => {
  it("renders title and disclaimer text when visible", () => {
    renderWithTheme(
      <HipaaAgreementModal visible={true} onAccept={jest.fn()} />,
    );

    expect(screen.getByText("A quick note")).toBeTruthy();
    expect(screen.getByText(/not HIPAA compliant/)).toBeTruthy();
    expect(screen.getByText("Got it")).toBeTruthy();
  });

  it('calls onAccept when "Got it" pressed', () => {
    const onAccept = jest.fn();
    renderWithTheme(<HipaaAgreementModal visible={true} onAccept={onAccept} />);

    fireEvent.press(screen.getByText("Got it"));
    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it('"Got it" button has accessible role and label', () => {
    renderWithTheme(
      <HipaaAgreementModal visible={true} onAccept={jest.fn()} />,
    );

    expect(
      screen.getByRole("button", { name: "Got it, continue to app" }),
    ).toBeTruthy();
  });

  it("does not render content when visible=false", () => {
    renderWithTheme(
      <HipaaAgreementModal visible={false} onAccept={jest.fn()} />,
    );

    expect(screen.queryByText("A quick note")).toBeNull();
  });
});
