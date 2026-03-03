import { Linking } from "react-native";
import { fireEvent, screen } from "@testing-library/react-native";

import renderWithTheme from "@/test/renderWithTheme";

import UpdateBuildToast from "./UpdateBuildToast";

const openURLSpy = jest
  .spyOn(Linking, "openURL")
  .mockResolvedValue(true as unknown as void);

function renderToast(
  overrides: { latestVersion?: string; onDismiss?: jest.Mock } = {},
) {
  const onDismiss = overrides.onDismiss ?? jest.fn();
  const latestVersion = overrides.latestVersion ?? "2.0.0";
  renderWithTheme(
    <UpdateBuildToast latestVersion={latestVersion} onDismiss={onDismiss} />,
  );
  return { onDismiss };
}

describe("UpdateBuildToast", () => {
  beforeEach(() => {
    openURLSpy.mockClear();
  });

  it("renders the new build message with version", () => {
    renderToast();
    expect(screen.getByText("New build available (v2.0.0)")).toBeTruthy();
  });

  it("renders a different version string", () => {
    renderToast({ latestVersion: "3.1.0" });
    expect(screen.getByText("New build available (v3.1.0)")).toBeTruthy();
  });

  it("shows a Details button", () => {
    renderToast();
    expect(screen.getByText("Details")).toBeTruthy();
  });

  it("opens store URL when Details is pressed", () => {
    renderToast();
    fireEvent.press(screen.getByText("Details"));
    expect(Linking.openURL).toHaveBeenCalledTimes(1);
  });

  it("has an accessibility label", () => {
    renderToast();
    expect(screen.getByLabelText("Update build toast")).toBeTruthy();
  });

  it("does not auto-dismiss", () => {
    jest.useFakeTimers();
    const { onDismiss } = renderToast();

    jest.advanceTimersByTime(60_000);
    expect(onDismiss).not.toHaveBeenCalled();

    jest.useRealTimers();
  });
});
