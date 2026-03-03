import { Alert } from "react-native";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { Entry } from "@/storage";

import EntryList from "./EntryList";

/** Creates a test entry with a default dueDate. */
function makeEntry(
  fields: Omit<Entry, "dueDate"> & { dueDate?: string },
): Entry {
  return { dueDate: "2026-06-15", ...fields };
}

// Fixed "today" for all tests so gestationalAgeFromDueDate produces predictable values.
beforeEach(() => {
  jest.useFakeTimers({ now: new Date(2026, 2, 2) });
});

afterEach(() => {
  jest.useRealTimers();
});

describe("EntryList", () => {
  it('shows "No entries yet" when empty', () => {
    render(
      <EntryList entries={[]} onDelete={jest.fn()} onDeleteAll={jest.fn()} />,
    );
    expect(screen.getByText("No entries yet")).toBeTruthy();
  });

  it("renders entry name and formatted age", () => {
    // dueDate 2026-09-11 → 12w3d when today is 2026-03-02
    const entries = [
      makeEntry({ id: "1", name: "Baby A", dueDate: "2026-09-11" }),
    ];
    render(
      <EntryList
        entries={entries}
        onDelete={jest.fn()}
        onDeleteAll={jest.fn()}
      />,
    );

    expect(screen.getByText("Baby A")).toBeTruthy();
    expect(screen.getByText("12w 3d")).toBeTruthy();
  });

  it("renders singular values", () => {
    // dueDate 2026-11-29 → 1w1d
    const entries = [
      makeEntry({ id: "1", name: "Baby", dueDate: "2026-11-29" }),
    ];
    render(
      <EntryList
        entries={entries}
        onDelete={jest.fn()}
        onDeleteAll={jest.fn()}
      />,
    );

    expect(screen.getByText("1w 1d")).toBeTruthy();
  });

  it("renders zero values", () => {
    // dueDate 2026-12-07 → 0w0d
    const entries = [
      makeEntry({ id: "1", name: "Baby", dueDate: "2026-12-07" }),
    ];
    render(
      <EntryList
        entries={entries}
        onDelete={jest.fn()}
        onDeleteAll={jest.fn()}
      />,
    );

    expect(screen.getByText("0w 0d")).toBeTruthy();
  });

  it("calls onDelete with correct id", () => {
    const onDelete = jest.fn();
    const entries = [
      makeEntry({ id: "abc", name: "Baby", dueDate: "2026-10-31" }),
    ];
    render(
      <EntryList
        entries={entries}
        onDelete={onDelete}
        onDeleteAll={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByText("✕"));
    expect(onDelete).toHaveBeenCalledWith("abc");
  });

  it("renders multiple entries", () => {
    const entries = [
      makeEntry({ id: "1", name: "Baby A", dueDate: "2026-09-28" }),
      makeEntry({ id: "2", name: "Baby B", dueDate: "2026-07-15" }),
      makeEntry({ id: "3", name: "Baby C", dueDate: "2026-04-04" }),
    ];
    render(
      <EntryList
        entries={entries}
        onDelete={jest.fn()}
        onDeleteAll={jest.fn()}
      />,
    );

    expect(screen.getByText("Baby A")).toBeTruthy();
    expect(screen.getByText("Baby B")).toBeTruthy();
    expect(screen.getByText("Baby C")).toBeTruthy();
  });

  it("sorts by due date descending (oldest gestational age first) by default", () => {
    // Young=10w0d (late dueDate), Old=35w2d (early dueDate), Middle=20w5d
    const entries = [
      makeEntry({ id: "1", name: "Young", dueDate: "2026-09-28" }),
      makeEntry({ id: "2", name: "Old", dueDate: "2026-04-04" }),
      makeEntry({ id: "3", name: "Middle", dueDate: "2026-07-15" }),
    ];
    render(
      <EntryList
        entries={entries}
        onDelete={jest.fn()}
        onDeleteAll={jest.fn()}
      />,
    );

    const names = screen.getAllByText(/Young|Old|Middle/);
    expect(names[0]).toHaveTextContent("Old");
    expect(names[1]).toHaveTextContent("Middle");
    expect(names[2]).toHaveTextContent("Young");
  });

  it("toggles due date to ascending when tapped again", () => {
    const entries = [
      makeEntry({ id: "1", name: "Young", dueDate: "2026-09-28" }),
      makeEntry({ id: "2", name: "Old", dueDate: "2026-04-04" }),
      makeEntry({ id: "3", name: "Middle", dueDate: "2026-07-15" }),
    ];
    render(
      <EntryList
        entries={entries}
        onDelete={jest.fn()}
        onDeleteAll={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByText(/Due Date/));

    const names = screen.getAllByText(/Young|Old|Middle/);
    expect(names[0]).toHaveTextContent("Young");
    expect(names[1]).toHaveTextContent("Middle");
    expect(names[2]).toHaveTextContent("Old");
  });

  it("sorts by name ascending when Name sort is selected", () => {
    const entries = [
      makeEntry({ id: "1", name: "Charlie", dueDate: "2026-09-28" }),
      makeEntry({ id: "2", name: "Alice", dueDate: "2026-04-04" }),
      makeEntry({ id: "3", name: "Bob", dueDate: "2026-07-15" }),
    ];
    render(
      <EntryList
        entries={entries}
        onDelete={jest.fn()}
        onDeleteAll={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByText("Name"));

    const names = screen.getAllByText(/Alice|Bob|Charlie/);
    expect(names[0]).toHaveTextContent("Alice");
    expect(names[1]).toHaveTextContent("Bob");
    expect(names[2]).toHaveTextContent("Charlie");
  });

  it("toggles name to descending when tapped again", () => {
    const entries = [
      makeEntry({ id: "1", name: "Charlie", dueDate: "2026-09-28" }),
      makeEntry({ id: "2", name: "Alice", dueDate: "2026-04-04" }),
      makeEntry({ id: "3", name: "Bob", dueDate: "2026-07-15" }),
    ];
    render(
      <EntryList
        entries={entries}
        onDelete={jest.fn()}
        onDeleteAll={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByText("Name"));
    fireEvent.press(screen.getByText(/Name/));

    const names = screen.getAllByText(/Alice|Bob|Charlie/);
    expect(names[0]).toHaveTextContent("Charlie");
    expect(names[1]).toHaveTextContent("Bob");
    expect(names[2]).toHaveTextContent("Alice");
  });

  it("resets to default direction when switching sort field", () => {
    const entries = [
      makeEntry({ id: "1", name: "Charlie", dueDate: "2026-09-28" }),
      makeEntry({ id: "2", name: "Alice", dueDate: "2026-04-04" }),
      makeEntry({ id: "3", name: "Bob", dueDate: "2026-07-15" }),
    ];
    render(
      <EntryList
        entries={entries}
        onDelete={jest.fn()}
        onDeleteAll={jest.fn()}
      />,
    );

    // Toggle due date to ascending
    fireEvent.press(screen.getByText(/Due Date/));
    // Switch to name — should default to ascending (A-Z)
    fireEvent.press(screen.getByText("Name"));

    const names = screen.getAllByText(/Alice|Bob|Charlie/);
    expect(names[0]).toHaveTextContent("Alice");
    expect(names[1]).toHaveTextContent("Bob");
    expect(names[2]).toHaveTextContent("Charlie");

    // Switch back to due date — should reset to descending (oldest first)
    fireEvent.press(screen.getByText(/Due Date/));

    const names2 = screen.getAllByText(/Alice|Bob|Charlie/);
    expect(names2[0]).toHaveTextContent("Alice");
    expect(names2[1]).toHaveTextContent("Bob");
    expect(names2[2]).toHaveTextContent("Charlie");
  });

  it("shows direction arrow on active sort button", () => {
    const entries = [
      makeEntry({ id: "1", name: "Baby", dueDate: "2026-09-28" }),
    ];
    render(
      <EntryList
        entries={entries}
        onDelete={jest.fn()}
        onDeleteAll={jest.fn()}
      />,
    );

    // Default: due date descending
    expect(screen.getByText(/Due Date ↓/)).toBeTruthy();

    // Toggle to ascending
    fireEvent.press(screen.getByText(/Due Date/));
    expect(screen.getByText(/Due Date ↑/)).toBeTruthy();

    // Switch to name — ascending by default
    fireEvent.press(screen.getByText("Name"));
    expect(screen.getByText(/Name ↑/)).toBeTruthy();

    // Toggle name to descending
    fireEvent.press(screen.getByText(/Name/));
    expect(screen.getByText(/Name ↓/)).toBeTruthy();
  });

  it("breaks due date ties by name ascending", () => {
    const entries = [
      makeEntry({ id: "1", name: "Charlie", dueDate: "2026-07-20" }),
      makeEntry({ id: "2", name: "Alice", dueDate: "2026-07-20" }),
      makeEntry({ id: "3", name: "Bob", dueDate: "2026-07-20" }),
    ];
    render(
      <EntryList
        entries={entries}
        onDelete={jest.fn()}
        onDeleteAll={jest.fn()}
      />,
    );

    const names = screen.getAllByText(/Alice|Bob|Charlie/);
    expect(names[0]).toHaveTextContent("Alice");
    expect(names[1]).toHaveTextContent("Bob");
    expect(names[2]).toHaveTextContent("Charlie");
  });

  it("keeps name-ascending tiebreaker when toggling due date direction", () => {
    const entries = [
      makeEntry({ id: "1", name: "Charlie", dueDate: "2026-07-20" }),
      makeEntry({ id: "2", name: "Alice", dueDate: "2026-07-20" }),
      makeEntry({ id: "3", name: "Bob", dueDate: "2026-07-20" }),
    ];
    render(
      <EntryList
        entries={entries}
        onDelete={jest.fn()}
        onDeleteAll={jest.fn()}
      />,
    );

    // Toggle due date to ascending
    fireEvent.press(screen.getByText(/Due Date/));

    const names = screen.getAllByText(/Alice|Bob|Charlie/);
    expect(names[0]).toHaveTextContent("Alice");
    expect(names[1]).toHaveTextContent("Bob");
    expect(names[2]).toHaveTextContent("Charlie");
  });

  it("breaks name ties by due date descending", () => {
    // Same name, different dueDates → tiebreaker sorts earliest dueDate first (highest GA)
    const entries = [
      makeEntry({ id: "1", name: "Sam", dueDate: "2026-09-28" }), // 10w0d
      makeEntry({ id: "2", name: "Sam", dueDate: "2026-05-11" }), // 30w0d
      makeEntry({ id: "3", name: "Sam", dueDate: "2026-07-20" }), // 20w0d
    ];
    render(
      <EntryList
        entries={entries}
        onDelete={jest.fn()}
        onDeleteAll={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByText("Name"));

    const ages = screen.getAllByText(/\d+w \d+d/);
    expect(ages[0]).toHaveTextContent("30w 0d");
    expect(ages[1]).toHaveTextContent("20w 0d");
    expect(ages[2]).toHaveTextContent("10w 0d");
  });

  it("keeps due-date-descending tiebreaker when toggling name direction", () => {
    const entries = [
      makeEntry({ id: "1", name: "Sam", dueDate: "2026-09-28" }), // 10w0d
      makeEntry({ id: "2", name: "Sam", dueDate: "2026-05-11" }), // 30w0d
      makeEntry({ id: "3", name: "Sam", dueDate: "2026-07-20" }), // 20w0d
    ];
    render(
      <EntryList
        entries={entries}
        onDelete={jest.fn()}
        onDeleteAll={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByText("Name"));
    fireEvent.press(screen.getByText(/Name/));

    const ages = screen.getAllByText(/\d+w \d+d/);
    expect(ages[0]).toHaveTextContent("30w 0d");
    expect(ages[1]).toHaveTextContent("20w 0d");
    expect(ages[2]).toHaveTextContent("10w 0d");
  });

  it("sorts correctly when entries span different years", () => {
    const entries = [
      makeEntry({ id: "1", name: "NewYear", dueDate: "2027-01-15" }),
      makeEntry({ id: "2", name: "EndOfYear", dueDate: "2026-12-01" }),
      makeEntry({ id: "3", name: "MidYear", dueDate: "2026-07-20" }),
    ];
    render(
      <EntryList
        entries={entries}
        onDelete={jest.fn()}
        onDeleteAll={jest.fn()}
      />,
    );

    // Default: due date descending → earliest dueDate (highest GA) first
    const names = screen.getAllByText(/NewYear|EndOfYear|MidYear/);
    expect(names[0]).toHaveTextContent("MidYear");
    expect(names[1]).toHaveTextContent("EndOfYear");
    expect(names[2]).toHaveTextContent("NewYear");
  });

  it("does not show sort controls when list is empty", () => {
    render(
      <EntryList entries={[]} onDelete={jest.fn()} onDeleteAll={jest.fn()} />,
    );

    expect(screen.queryByText(/Due Date/)).toBeNull();
    expect(screen.queryByText(/Name/)).toBeNull();
    expect(screen.queryByText("Delete All")).toBeNull();
  });

  it("shows Delete All button when entries exist", () => {
    const entries = [makeEntry({ id: "1", name: "Baby" })];
    render(
      <EntryList
        entries={entries}
        onDelete={jest.fn()}
        onDeleteAll={jest.fn()}
      />,
    );

    expect(screen.getByText("Delete All")).toBeTruthy();
  });

  it("shows confirmation dialog when Delete All is pressed", () => {
    const alertSpy = jest.spyOn(Alert, "alert");
    const entries = [makeEntry({ id: "1", name: "Baby" })];
    render(
      <EntryList
        entries={entries}
        onDelete={jest.fn()}
        onDeleteAll={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByText("Delete All"));

    expect(alertSpy).toHaveBeenCalledWith(
      "Delete All",
      "Are you sure you want to delete all entries?",
      expect.any(Array),
    );
    alertSpy.mockRestore();
  });

  it("calls onDeleteAll when user confirms deletion", () => {
    const alertSpy = jest.spyOn(Alert, "alert");
    const onDeleteAll = jest.fn();
    const entries = [makeEntry({ id: "1", name: "Baby" })];
    render(
      <EntryList
        entries={entries}
        onDelete={jest.fn()}
        onDeleteAll={onDeleteAll}
      />,
    );

    fireEvent.press(screen.getByText("Delete All"));

    // Simulate pressing the "Delete" button in the alert
    const buttons = alertSpy.mock.calls[0][2] as Array<{
      text: string;
      onPress?: () => void;
    }>;
    const deleteButton = buttons.find((b) => b.text === "Delete");
    deleteButton?.onPress?.();

    expect(onDeleteAll).toHaveBeenCalledTimes(1);
    alertSpy.mockRestore();
  });

  it("does not call onDeleteAll when user cancels", () => {
    const alertSpy = jest.spyOn(Alert, "alert");
    const onDeleteAll = jest.fn();
    const entries = [makeEntry({ id: "1", name: "Baby" })];
    render(
      <EntryList
        entries={entries}
        onDelete={jest.fn()}
        onDeleteAll={onDeleteAll}
      />,
    );

    fireEvent.press(screen.getByText("Delete All"));

    // Simulate pressing the "Cancel" button in the alert
    const buttons = alertSpy.mock.calls[0][2] as Array<{
      text: string;
      onPress?: () => void;
    }>;
    const cancelButton = buttons.find((b) => b.text === "Cancel");
    cancelButton?.onPress?.();

    expect(onDeleteAll).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it("renders due date in the row", () => {
    const entries = [
      makeEntry({ id: "1", name: "Baby", dueDate: "2026-06-15" }),
    ];
    render(
      <EntryList
        entries={entries}
        onDelete={jest.fn()}
        onDeleteAll={jest.fn()}
      />,
    );

    expect(screen.getByText("Jun 15")).toBeTruthy();
  });

  it("renders due date with year suffix when different year", () => {
    const entries = [
      makeEntry({ id: "1", name: "Baby", dueDate: "2027-01-03" }),
    ];
    render(
      <EntryList
        entries={entries}
        onDelete={jest.fn()}
        onDeleteAll={jest.fn()}
      />,
    );

    expect(screen.getByText("Jan 3 '27")).toBeTruthy();
  });

  it("assigns rainbow background colors to rows in order", () => {
    const entries = [
      makeEntry({ id: "1", name: "A" }),
      makeEntry({ id: "2", name: "B" }),
      makeEntry({ id: "3", name: "C" }),
    ];
    render(
      <EntryList
        entries={entries}
        onDelete={jest.fn()}
        onDeleteAll={jest.fn()}
      />,
    );

    const rows = screen.getAllByTestId("entry-row");
    expect(rows[0].props.style).toEqual(
      expect.objectContaining({ backgroundColor: "#EF9A9A" }),
    );
    expect(rows[1].props.style).toEqual(
      expect.objectContaining({ backgroundColor: "#FFCC80" }),
    );
    expect(rows[2].props.style).toEqual(
      expect.objectContaining({ backgroundColor: "#FFF176" }),
    );
  });

  it("cycles rainbow colors after 7 rows", () => {
    const entries = Array.from({ length: 8 }, (_, i) =>
      makeEntry({ id: String(i), name: `Baby ${i}` }),
    );
    render(
      <EntryList
        entries={entries}
        onDelete={jest.fn()}
        onDeleteAll={jest.fn()}
      />,
    );

    const rows = screen.getAllByTestId("entry-row");
    // 8th row (index 7) should wrap back to the first color (red)
    expect(rows[7].props.style).toEqual(
      expect.objectContaining({ backgroundColor: "#EF9A9A" }),
    );
  });

  it("renders delete background behind entry rows", () => {
    const entries = [makeEntry({ id: "1", name: "Baby" })];
    render(
      <EntryList
        entries={entries}
        onDelete={jest.fn()}
        onDeleteAll={jest.fn()}
      />,
    );

    expect(screen.getByTestId("delete-background")).toBeTruthy();
  });

  it("renders a delete background for each entry", () => {
    const entries = [
      makeEntry({ id: "1", name: "Baby A" }),
      makeEntry({ id: "2", name: "Baby B" }),
    ];
    render(
      <EntryList
        entries={entries}
        onDelete={jest.fn()}
        onDeleteAll={jest.fn()}
      />,
    );

    expect(screen.getAllByTestId("delete-background")).toHaveLength(2);
  });
});
