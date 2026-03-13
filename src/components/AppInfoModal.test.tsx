import { fireEvent, screen } from "@testing-library/react-native";

import renderWithTheme from "@/test/renderWithTheme";

import AppInfoModal from "./AppInfoModal";

describe("AppInfoModal", () => {
  it("renders app name and version when visible", () => {
    renderWithTheme(<AppInfoModal visible={true} onClose={jest.fn()} />);

    expect(screen.getByText("About")).toBeTruthy();
    expect(screen.getByText("in due time")).toBeTruthy();
    expect(screen.getByText(/Version/)).toBeTruthy();
    expect(screen.queryByText(/Build:/)).toBeNull();
    expect(screen.getByText("Development Build")).toBeTruthy();
    expect(screen.getByText(/Android|iOS/)).toBeTruthy();
  });

  it("calls onClose when Close button is pressed", () => {
    const onClose = jest.fn();
    renderWithTheme(<AppInfoModal visible={true} onClose={onClose} />);

    fireEvent.press(screen.getByText("Close"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not render content when visible=false", () => {
    renderWithTheme(<AppInfoModal visible={false} onClose={jest.fn()} />);

    expect(screen.queryByText("About")).toBeNull();
  });
});
