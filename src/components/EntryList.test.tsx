import { Alert } from "react-native";
import { fireEvent, screen } from "@testing-library/react-native";

import { Entry } from "@/storage";
import renderWithTheme from "@/test/renderWithTheme";
import { lightRowColors } from "@/theme";

import EntryList from "./EntryList";

/** Creates a test entry with a default dueDate. */
function makeEntry(
  fields: Omit<Entry, "dueDate"> & { dueDate?: string },
): Entry {
  return { dueDate: "2026-06-15", ...fields };
}

/** Renders EntryList with defaults for onDelete/onDeleteAll/onAdd. Returns the mocks. */
function renderList(
  entries: Entry[],
  overrides: {
    onDelete?: jest.Mock;
    onDeleteAll?: jest.Mock;
    onAdd?: jest.Mock;
  } = {},
) {
  const onDelete = overrides.onDelete ?? jest.fn();
  const onDeleteAll = overrides.onDeleteAll ?? jest.fn();
  const onAdd = overrides.onAdd ?? jest.fn();
  renderWithTheme(
    <EntryList
      entries={entries}
      onDelete={onDelete}
      onDeleteAll={onDeleteAll}
      onAdd={onAdd}
    />,
  );
  return { onDelete, onDeleteAll, onAdd };
}

/** Three entries with different due dates for sort tests. */
const ageSortEntries = [
  makeEntry({ id: "1", name: "Young", dueDate: "2026-09-28" }),
  makeEntry({ id: "2", name: "Old", dueDate: "2026-04-04" }),
  makeEntry({ id: "3", name: "Middle", dueDate: "2026-07-15" }),
];

/** Three entries with different names for sort tests. */
const nameSortEntries = [
  makeEntry({ id: "1", name: "Charlie", dueDate: "2026-09-28" }),
  makeEntry({ id: "2", name: "Alice", dueDate: "2026-04-04" }),
  makeEntry({ id: "3", name: "Bob", dueDate: "2026-07-15" }),
];

/** Three entries with same due date for tiebreaker tests. */
const sameDateEntries = [
  makeEntry({ id: "1", name: "Charlie", dueDate: "2026-07-20" }),
  makeEntry({ id: "2", name: "Alice", dueDate: "2026-07-20" }),
  makeEntry({ id: "3", name: "Bob", dueDate: "2026-07-20" }),
];

/** Three entries with same name for tiebreaker tests. */
const sameNameEntries = [
  makeEntry({ id: "1", name: "Sam", dueDate: "2026-09-28" }), // 10w0d
  makeEntry({ id: "2", name: "Sam", dueDate: "2026-05-11" }), // 30w0d
  makeEntry({ id: "3", name: "Sam", dueDate: "2026-07-20" }), // 20w0d
];

// Fixed "today" for all tests so gestationalAgeFromDueDate produces predictable values.
beforeEach(() => {
  jest.useFakeTimers({ now: new Date(2026, 2, 2) });
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe("EntryList", () => {
  it("shows empty state with guidance when no entries", () => {
    renderList([]);
    expect(screen.getByText("Ready when you are")).toBeTruthy();
    expect(screen.getByText("Tap Add someone to get started")).toBeTruthy();
  });

  it("renders entry name and formatted age", () => {
    // dueDate 2026-09-11 → 12w3d when today is 2026-03-02
    renderList([makeEntry({ id: "1", name: "Baby A", dueDate: "2026-09-11" })]);

    expect(screen.getByText("Baby A")).toBeTruthy();
    expect(screen.getByText("12w 3d")).toBeTruthy();
  });

  it("renders singular values", () => {
    // dueDate 2026-11-29 → 1w1d
    renderList([makeEntry({ id: "1", name: "Baby", dueDate: "2026-11-29" })]);

    expect(screen.getByText("1w 1d")).toBeTruthy();
  });

  it("renders zero values", () => {
    // dueDate 2026-12-07 → 0w0d
    renderList([makeEntry({ id: "1", name: "Baby", dueDate: "2026-12-07" })]);

    expect(screen.getByText("0w 0d")).toBeTruthy();
  });

  it("calls onDelete with correct id", () => {
    const { onDelete } = renderList([
      makeEntry({ id: "abc", name: "Baby", dueDate: "2026-10-31" }),
    ]);

    fireEvent.press(screen.getByLabelText("Remove Baby"));
    expect(onDelete).toHaveBeenCalledWith("abc");
  });

  it("delete button has accessible role and label", () => {
    renderList([makeEntry({ id: "1", name: "Baby A" })]);

    const deleteButton = screen.getByLabelText("Remove Baby A");
    expect(deleteButton).toBeTruthy();
    expect(deleteButton.props.accessibilityRole).toBe("button");
  });

  it("renders multiple entries", () => {
    renderList([
      makeEntry({ id: "1", name: "Baby A", dueDate: "2026-09-28" }),
      makeEntry({ id: "2", name: "Baby B", dueDate: "2026-07-15" }),
      makeEntry({ id: "3", name: "Baby C", dueDate: "2026-04-04" }),
    ]);

    expect(screen.getByText("Baby A")).toBeTruthy();
    expect(screen.getByText("Baby B")).toBeTruthy();
    expect(screen.getByText("Baby C")).toBeTruthy();
  });

  it("sorts by due date descending (oldest gestational age first) by default", () => {
    renderList(ageSortEntries);

    const names = screen.getAllByText(/Young|Old|Middle/);
    expect(names[0]).toHaveTextContent("Old");
    expect(names[1]).toHaveTextContent("Middle");
    expect(names[2]).toHaveTextContent("Young");
  });

  it("toggles due date to ascending when tapped again", () => {
    renderList(ageSortEntries);

    fireEvent.press(screen.getByText(/Due Date/));

    const names = screen.getAllByText(/Young|Old|Middle/);
    expect(names[0]).toHaveTextContent("Young");
    expect(names[1]).toHaveTextContent("Middle");
    expect(names[2]).toHaveTextContent("Old");
  });

  it("sorts by name ascending when Name sort is selected", () => {
    renderList(nameSortEntries);

    fireEvent.press(screen.getByText("Name"));

    const names = screen.getAllByText(/Alice|Bob|Charlie/);
    expect(names[0]).toHaveTextContent("Alice");
    expect(names[1]).toHaveTextContent("Bob");
    expect(names[2]).toHaveTextContent("Charlie");
  });

  it("toggles name to descending when tapped again", () => {
    renderList(nameSortEntries);

    fireEvent.press(screen.getByText("Name"));
    fireEvent.press(screen.getByText(/Name/));

    const names = screen.getAllByText(/Alice|Bob|Charlie/);
    expect(names[0]).toHaveTextContent("Charlie");
    expect(names[1]).toHaveTextContent("Bob");
    expect(names[2]).toHaveTextContent("Alice");
  });

  it("resets to default direction when switching sort field", () => {
    renderList(nameSortEntries);

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
    renderList([makeEntry({ id: "1", name: "Baby", dueDate: "2026-09-28" })]);

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

  it("sort buttons communicate selected state for accessibility", () => {
    renderList([makeEntry({ id: "1", name: "Baby", dueDate: "2026-09-28" })]);

    const dueDateButton = screen.getByRole("button", { name: /Due Date/ });
    const nameButton = screen.getByRole("button", { name: "Name" });

    expect(dueDateButton.props.accessibilityState).toEqual({ selected: true });
    expect(nameButton.props.accessibilityState).toEqual({ selected: false });

    fireEvent.press(nameButton);

    const dueDateButton2 = screen.getByRole("button", { name: /Due Date/ });
    const nameButton2 = screen.getByRole("button", { name: /Name/ });

    expect(dueDateButton2.props.accessibilityState).toEqual({
      selected: false,
    });
    expect(nameButton2.props.accessibilityState).toEqual({ selected: true });
  });

  it("breaks due date ties by name ascending", () => {
    renderList(sameDateEntries);

    const names = screen.getAllByText(/Alice|Bob|Charlie/);
    expect(names[0]).toHaveTextContent("Alice");
    expect(names[1]).toHaveTextContent("Bob");
    expect(names[2]).toHaveTextContent("Charlie");
  });

  it("keeps name-ascending tiebreaker when toggling due date direction", () => {
    renderList(sameDateEntries);

    // Toggle due date to ascending
    fireEvent.press(screen.getByText(/Due Date/));

    const names = screen.getAllByText(/Alice|Bob|Charlie/);
    expect(names[0]).toHaveTextContent("Alice");
    expect(names[1]).toHaveTextContent("Bob");
    expect(names[2]).toHaveTextContent("Charlie");
  });

  it("breaks name ties by due date descending", () => {
    renderList(sameNameEntries);

    fireEvent.press(screen.getByText("Name"));

    const ages = screen.getAllByText(/\d+w \d+d/);
    expect(ages[0]).toHaveTextContent("30w 0d");
    expect(ages[1]).toHaveTextContent("20w 0d");
    expect(ages[2]).toHaveTextContent("10w 0d");
  });

  it("keeps due-date-descending tiebreaker when toggling name direction", () => {
    renderList(sameNameEntries);

    fireEvent.press(screen.getByText("Name"));
    fireEvent.press(screen.getByText(/Name/));

    const ages = screen.getAllByText(/\d+w \d+d/);
    expect(ages[0]).toHaveTextContent("30w 0d");
    expect(ages[1]).toHaveTextContent("20w 0d");
    expect(ages[2]).toHaveTextContent("10w 0d");
  });

  it("sorts correctly when entries span different years", () => {
    renderList([
      makeEntry({ id: "1", name: "NewYear", dueDate: "2027-01-15" }),
      makeEntry({ id: "2", name: "EndOfYear", dueDate: "2026-12-01" }),
      makeEntry({ id: "3", name: "MidYear", dueDate: "2026-07-20" }),
    ]);

    // Default: due date descending → earliest dueDate (highest GA) first
    const names = screen.getAllByText(/NewYear|EndOfYear|MidYear/);
    expect(names[0]).toHaveTextContent("MidYear");
    expect(names[1]).toHaveTextContent("EndOfYear");
    expect(names[2]).toHaveTextContent("NewYear");
  });

  it("does not show sort controls when list is empty", () => {
    renderList([]);

    expect(screen.queryByText(/Due Date/)).toBeNull();
    expect(screen.queryByText(/Name/)).toBeNull();
    expect(screen.queryByText("Remove all")).toBeNull();
  });

  it("shows Remove all button when entries exist", () => {
    renderList([makeEntry({ id: "1", name: "Baby" })]);

    expect(screen.getByText("Remove all")).toBeTruthy();
  });

  it("shows confirmation dialog when Remove all is pressed", () => {
    const alertSpy = jest.spyOn(Alert, "alert");
    renderList([makeEntry({ id: "1", name: "Baby" })]);

    fireEvent.press(screen.getByText("Remove all"));

    expect(alertSpy).toHaveBeenCalledWith(
      "Remove everyone?",
      expect.stringContaining("remove all"),
      expect.any(Array),
    );
  });

  it("calls onDeleteAll when user confirms removal", () => {
    const alertSpy = jest.spyOn(Alert, "alert");
    const { onDeleteAll } = renderList([makeEntry({ id: "1", name: "Baby" })]);

    fireEvent.press(screen.getByText("Remove all"));

    const buttons = alertSpy.mock.calls[0][2] as Array<{
      text: string;
      onPress?: () => void;
    }>;
    buttons.find((b) => b.text === "Remove all")?.onPress?.();

    expect(onDeleteAll).toHaveBeenCalledTimes(1);
  });

  it("does not call onDeleteAll when user cancels", () => {
    const alertSpy = jest.spyOn(Alert, "alert");
    const { onDeleteAll } = renderList([makeEntry({ id: "1", name: "Baby" })]);

    fireEvent.press(screen.getByText("Remove all"));

    const buttons = alertSpy.mock.calls[0][2] as Array<{
      text: string;
      onPress?: () => void;
    }>;
    buttons.find((b) => b.text === "Cancel")?.onPress?.();

    expect(onDeleteAll).not.toHaveBeenCalled();
  });

  it("renders due date in the row", () => {
    renderList([makeEntry({ id: "1", name: "Baby", dueDate: "2026-06-15" })]);

    expect(screen.getByText("Jun 15")).toBeTruthy();
  });

  it("renders due date with year suffix when different year", () => {
    renderList([makeEntry({ id: "1", name: "Baby", dueDate: "2027-01-03" })]);

    expect(screen.getByText("Jan 3 '27")).toBeTruthy();
  });

  it("assigns rainbow background colors to rows in order", () => {
    renderList([
      makeEntry({ id: "1", name: "A" }),
      makeEntry({ id: "2", name: "B" }),
      makeEntry({ id: "3", name: "C" }),
    ]);

    const rows = screen.getAllByTestId("entry-row");
    expect(rows[0].props.style).toEqual(
      expect.objectContaining({ backgroundColor: lightRowColors[0] }),
    );
    expect(rows[1].props.style).toEqual(
      expect.objectContaining({ backgroundColor: lightRowColors[1] }),
    );
    expect(rows[2].props.style).toEqual(
      expect.objectContaining({ backgroundColor: lightRowColors[2] }),
    );
  });

  it("cycles rainbow colors after 7 rows", () => {
    renderList(
      Array.from({ length: 8 }, (_, i) =>
        makeEntry({ id: String(i), name: `Baby ${i}` }),
      ),
    );

    const rows = screen.getAllByTestId("entry-row");
    // 8th row (index 7) should wrap back to the first color (red)
    expect(rows[7].props.style).toEqual(
      expect.objectContaining({ backgroundColor: lightRowColors[0] }),
    );
  });

  it("renders delete background behind entry rows", () => {
    renderList([makeEntry({ id: "1", name: "Baby" })]);

    expect(screen.getByTestId("delete-background")).toBeTruthy();
  });

  it("renders a delete background for each entry", () => {
    renderList([
      makeEntry({ id: "1", name: "Baby A" }),
      makeEntry({ id: "2", name: "Baby B" }),
    ]);

    expect(screen.getAllByTestId("delete-background")).toHaveLength(2);
  });

  it("shows inline form when Add someone is pressed", () => {
    renderList([]);

    fireEvent.press(screen.getByLabelText("Add someone new"));

    expect(screen.getByLabelText("Name")).toBeTruthy();
    expect(screen.getByLabelText("Add this person")).toBeTruthy();
  });

  it("hides inline form when close button is pressed", () => {
    renderList([]);

    fireEvent.press(screen.getByLabelText("Add someone new"));
    expect(screen.getByLabelText("Name")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Close form"));
    expect(screen.queryByLabelText("Name")).toBeNull();
  });

  it("hides inline form after adding an entry", () => {
    const onAdd = jest.fn();
    renderList([], { onAdd });

    fireEvent.press(screen.getByLabelText("Add someone new"));

    // Switch to gestational age mode and fill in
    fireEvent.press(screen.getByText("Gestational Age"));
    fireEvent.changeText(screen.getByLabelText("Name"), "Baby");
    fireEvent.changeText(screen.getByLabelText("Weeks"), "20");
    fireEvent.changeText(screen.getByLabelText("Days"), "3");
    fireEvent.press(screen.getByLabelText("Add this person"));

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(screen.queryByLabelText("Name")).toBeNull();
  });
});
