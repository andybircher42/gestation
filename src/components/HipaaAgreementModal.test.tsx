import { fireEvent, screen } from "@testing-library/react-native";

import renderWithTheme from "@/test/renderWithTheme";

import HipaaAgreementModal from "./HipaaAgreementModal";

describe("HipaaAgreementModal", () => {
  it("renders title and disclaimer text when visible", () => {
    renderWithTheme(
      <HipaaAgreementModal visible={true} onAccept={jest.fn()} />,
    );

    expect(screen.getByText("Important Notice")).toBeTruthy();
    expect(screen.getByText(/not HIPAA compliant/)).toBeTruthy();
    expect(screen.getByText("I Agree")).toBeTruthy();
    expect(screen.getByText("Disagree, exit app")).toBeTruthy();
  });

  it('calls onAccept when "I Agree" pressed', () => {
    const onAccept = jest.fn();
    renderWithTheme(<HipaaAgreementModal visible={true} onAccept={onAccept} />);

    fireEvent.press(screen.getByText("I Agree"));
    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it('"I Agree" button has accessible role and label', () => {
    renderWithTheme(
      <HipaaAgreementModal visible={true} onAccept={jest.fn()} />,
    );

    expect(
      screen.getByRole("button", { name: "I agree, continue to app" }),
    ).toBeTruthy();
  });

  it('"Disagree" button has accessible role and label', () => {
    renderWithTheme(
      <HipaaAgreementModal visible={true} onAccept={jest.fn()} />,
    );

    expect(
      screen.getByRole("button", { name: "Disagree and exit app" }),
    ).toBeTruthy();
  });

  it("does not render content when visible=false", () => {
    renderWithTheme(
      <HipaaAgreementModal visible={false} onAccept={jest.fn()} />,
    );

    expect(screen.queryByText("Important Notice")).toBeNull();
  });
});
