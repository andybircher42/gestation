import { fireEvent, screen } from "@testing-library/react-native";

import renderWithTheme from "@/test/renderWithTheme";

import AppInfoModal from "./AppInfoModal";

describe("AppInfoModal", () => {
  it("renders app name and version when visible", () => {
    renderWithTheme(<AppInfoModal visible={true} onClose={jest.fn()} />);

    expect(screen.getByText("About")).toBeTruthy();
    expect(screen.getByText("in due time")).toBeTruthy();
    expect(screen.getByText(/Version/)).toBeTruthy();
    expect(screen.getByText(/Build/)).toBeTruthy();
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

  it("shows 'Up to date' when buildStatus is not outdated", () => {
    renderWithTheme(
      <AppInfoModal
        visible={true}
        onClose={jest.fn()}
        buildStatus={{ isOutdated: false }}
      />,
    );

    expect(screen.getByText("Up to date")).toBeTruthy();
  });

  it("shows new build available when buildStatus is outdated", () => {
    renderWithTheme(
      <AppInfoModal
        visible={true}
        onClose={jest.fn()}
        buildStatus={{ isOutdated: true, latestVersion: "2.5.0" }}
      />,
    );

    expect(
      screen.getByText("New build available (v2.5.0)"),
    ).toBeTruthy();
  });

  it("does not show build status when prop is omitted", () => {
    renderWithTheme(<AppInfoModal visible={true} onClose={jest.fn()} />);

    expect(screen.queryByText("Up to date")).toBeNull();
    expect(screen.queryByText(/New build available/)).toBeNull();
  });
});
