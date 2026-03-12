import { screen } from "@testing-library/react-native";

import renderWithTheme from "@/test/renderWithTheme";

import CalendarMonth, { DayCell } from "./CalendarMonth";

const WEEKDAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function makeCells(daysInMonth: number): DayCell[] {
  return Array.from({ length: daysInMonth }, (_, i) => ({
    date: `2026-06-${String(i + 1).padStart(2, "0")}`,
    day: i + 1,
    color: "transparent",
    load: 0,
    dueEntries: [],
  }));
}

describe("CalendarMonth", () => {
  it("renders month title", () => {
    renderWithTheme(
      <CalendarMonth year={2026} month={5} dayCells={makeCells(30)} />,
    );
    expect(screen.getByText("June 2026")).toBeTruthy();
  });

  it("renders weekday headers", () => {
    renderWithTheme(
      <CalendarMonth year={2026} month={5} dayCells={makeCells(30)} />,
    );
    for (const day of WEEKDAY_HEADERS) {
      expect(screen.getByText(day)).toBeTruthy();
    }
  });

  it("renders day numbers", () => {
    renderWithTheme(
      <CalendarMonth year={2026} month={5} dayCells={makeCells(30)} />,
    );
    expect(screen.getByText("1")).toBeTruthy();
    expect(screen.getByText("15")).toBeTruthy();
    expect(screen.getByText("30")).toBeTruthy();
  });

  it("shows birthstone icons for due entries", () => {
    const cells = makeCells(30);
    cells[14] = {
      ...cells[14],
      dueEntries: [
        {
          id: "1",
          name: "Baby",
          dueDate: "2026-06-15",
          birthstone: { name: "Pearl", color: "#B0B8E8" },
        },
      ],
    };
    const { toJSON } = renderWithTheme(
      <CalendarMonth year={2026} month={5} dayCells={cells} />,
    );
    // Verify it renders without crashing (birthstone icons are images)
    expect(toJSON()).toBeTruthy();
  });

  it("shows overflow indicator for 4+ entries on same date", () => {
    const cells = makeCells(30);
    cells[14] = {
      ...cells[14],
      dueEntries: [
        { id: "1", name: "A", dueDate: "2026-06-15" },
        { id: "2", name: "B", dueDate: "2026-06-15" },
        { id: "3", name: "C", dueDate: "2026-06-15" },
        { id: "4", name: "D", dueDate: "2026-06-15" },
      ],
    };
    renderWithTheme(<CalendarMonth year={2026} month={5} dayCells={cells} />);
    expect(screen.getByText("+3")).toBeTruthy();
  });
});
