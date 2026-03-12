import { screen } from "@testing-library/react-native";

import renderWithTheme from "@/test/renderWithTheme";

import CalendarView from "./CalendarView";

describe("CalendarView", () => {
  it("shows empty state when no entries", () => {
    renderWithTheme(<CalendarView entries={[]} />);
    expect(screen.getByText("No one to show yet")).toBeTruthy();
    expect(
      screen.getByText("Switch to the list view to add someone"),
    ).toBeTruthy();
  });

  it("renders month components when entries exist", () => {
    jest.useFakeTimers({ now: new Date(2026, 2, 2) });
    const entries = [
      {
        id: "1",
        name: "Baby",
        dueDate: "2026-06-15",
        birthstone: { name: "Pearl", color: "#B0B8E8" },
      },
    ];
    renderWithTheme(<CalendarView entries={entries} />);

    // Should show current month (March 2026)
    expect(screen.getByText("March 2026")).toBeTruthy();
    // Should show future months
    expect(screen.getByText("June 2026")).toBeTruthy();

    jest.useRealTimers();
  });

  it("renders 11 months total", () => {
    jest.useFakeTimers({ now: new Date(2026, 0, 1) });
    const entries = [
      {
        id: "1",
        name: "Baby",
        dueDate: "2026-06-15",
        birthstone: { name: "Pearl", color: "#B0B8E8" },
      },
    ];
    renderWithTheme(<CalendarView entries={entries} />);

    // January through November 2026
    expect(screen.getByText("January 2026")).toBeTruthy();
    expect(screen.getByText("November 2026")).toBeTruthy();

    jest.useRealTimers();
  });
});
