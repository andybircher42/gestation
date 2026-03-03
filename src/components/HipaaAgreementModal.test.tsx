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
  });

  it('calls onAccept when "I Agree" pressed', () => {
    const onAccept = jest.fn();
    renderWithTheme(<HipaaAgreementModal visible={true} onAccept={onAccept} />);

    fireEvent.press(screen.getByText("I Agree"));
    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it("does not render content when visible=false", () => {
    renderWithTheme(
      <HipaaAgreementModal visible={false} onAccept={jest.fn()} />,
    );

    expect(screen.queryByText("Important Notice")).toBeNull();
  });
});
