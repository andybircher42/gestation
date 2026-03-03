import { render, screen, fireEvent } from "@testing-library/react-native";
import { Alert } from "react-native";
import EntryList from "./EntryList";
import { Entry } from "../storage";

/** Creates a test entry with a default dueDate. */
function makeEntry(fields: Omit<Entry, "dueDate">): Entry {
  return { ...fields, dueDate: "2026-06-15" };
}

describe("EntryList", () => {
  it('shows "No entries yet" when empty', () => {
    render(<EntryList entries={[]} onDelete={jest.fn()} onDeleteAll={jest.fn()} />);
    expect(screen.getByText("No entries yet")).toBeTruthy();
  });

  it("renders entry name and formatted age", () => {
    const entries = [makeEntry({ id: "1", name: "Baby A", weeks: 12, days: 3 })];
    render(<EntryList entries={entries} onDelete={jest.fn()} onDeleteAll={jest.fn()} />);

    expect(screen.getByText("Baby A")).toBeTruthy();
    expect(screen.getByText("12w 3d")).toBeTruthy();
  });

  it("renders singular values", () => {
    const entries = [makeEntry({ id: "1", name: "Baby", weeks: 1, days: 1 })];
    render(<EntryList entries={entries} onDelete={jest.fn()} onDeleteAll={jest.fn()} />);

    expect(screen.getByText("1w 1d")).toBeTruthy();
  });

  it("renders zero values", () => {
    const entries = [makeEntry({ id: "1", name: "Baby", weeks: 0, days: 0 })];
    render(<EntryList entries={entries} onDelete={jest.fn()} onDeleteAll={jest.fn()} />);

    expect(screen.getByText("0w 0d")).toBeTruthy();
  });

  it("calls onDelete with correct id", () => {
    const onDelete = jest.fn();
    const entries = [makeEntry({ id: "abc", name: "Baby", weeks: 5, days: 2 })];
    render(<EntryList entries={entries} onDelete={onDelete} onDeleteAll={jest.fn()} />);

    fireEvent.press(screen.getByText("✕"));
    expect(onDelete).toHaveBeenCalledWith("abc");
  });

  it("renders multiple entries", () => {
    const entries = [
      makeEntry({ id: "1", name: "Baby A", weeks: 10, days: 0 }),
      makeEntry({ id: "2", name: "Baby B", weeks: 20, days: 5 }),
      makeEntry({ id: "3", name: "Baby C", weeks: 35, days: 2 }),
    ];
    render(<EntryList entries={entries} onDelete={jest.fn()} onDeleteAll={jest.fn()} />);

    expect(screen.getByText("Baby A")).toBeTruthy();
    expect(screen.getByText("Baby B")).toBeTruthy();
    expect(screen.getByText("Baby C")).toBeTruthy();
  });

  it("sorts by due date descending (oldest gestational age first) by default", () => {
    const entries = [
      makeEntry({ id: "1", name: "Young", weeks: 10, days: 0 }),
      makeEntry({ id: "2", name: "Old", weeks: 35, days: 2 }),
      makeEntry({ id: "3", name: "Middle", weeks: 20, days: 5 }),
    ];
    render(<EntryList entries={entries} onDelete={jest.fn()} onDeleteAll={jest.fn()} />);

    const names = screen.getAllByText(/Young|Old|Middle/);
    expect(names[0]).toHaveTextContent("Old");
    expect(names[1]).toHaveTextContent("Middle");
    expect(names[2]).toHaveTextContent("Young");
  });

  it("toggles due date to ascending when tapped again", () => {
    const entries = [
      makeEntry({ id: "1", name: "Young", weeks: 10, days: 0 }),
      makeEntry({ id: "2", name: "Old", weeks: 35, days: 2 }),
      makeEntry({ id: "3", name: "Middle", weeks: 20, days: 5 }),
    ];
    render(<EntryList entries={entries} onDelete={jest.fn()} onDeleteAll={jest.fn()} />);

    fireEvent.press(screen.getByText(/Due Date/));

    const names = screen.getAllByText(/Young|Old|Middle/);
    expect(names[0]).toHaveTextContent("Young");
    expect(names[1]).toHaveTextContent("Middle");
    expect(names[2]).toHaveTextContent("Old");
  });

  it("sorts by name ascending when Name sort is selected", () => {
    const entries = [
      makeEntry({ id: "1", name: "Charlie", weeks: 10, days: 0 }),
      makeEntry({ id: "2", name: "Alice", weeks: 35, days: 2 }),
      makeEntry({ id: "3", name: "Bob", weeks: 20, days: 5 }),
    ];
    render(<EntryList entries={entries} onDelete={jest.fn()} onDeleteAll={jest.fn()} />);

    fireEvent.press(screen.getByText("Name"));

    const names = screen.getAllByText(/Alice|Bob|Charlie/);
    expect(names[0]).toHaveTextContent("Alice");
    expect(names[1]).toHaveTextContent("Bob");
    expect(names[2]).toHaveTextContent("Charlie");
  });

  it("toggles name to descending when tapped again", () => {
    const entries = [
      makeEntry({ id: "1", name: "Charlie", weeks: 10, days: 0 }),
      makeEntry({ id: "2", name: "Alice", weeks: 35, days: 2 }),
      makeEntry({ id: "3", name: "Bob", weeks: 20, days: 5 }),
    ];
    render(<EntryList entries={entries} onDelete={jest.fn()} onDeleteAll={jest.fn()} />);

    fireEvent.press(screen.getByText("Name"));
    fireEvent.press(screen.getByText(/Name/));

    const names = screen.getAllByText(/Alice|Bob|Charlie/);
    expect(names[0]).toHaveTextContent("Charlie");
    expect(names[1]).toHaveTextContent("Bob");
    expect(names[2]).toHaveTextContent("Alice");
  });

  it("resets to default direction when switching sort field", () => {
    const entries = [
      makeEntry({ id: "1", name: "Charlie", weeks: 10, days: 0 }),
      makeEntry({ id: "2", name: "Alice", weeks: 35, days: 2 }),
      makeEntry({ id: "3", name: "Bob", weeks: 20, days: 5 }),
    ];
    render(<EntryList entries={entries} onDelete={jest.fn()} onDeleteAll={jest.fn()} />);

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
    const entries = [makeEntry({ id: "1", name: "Baby", weeks: 10, days: 0 })];
    render(<EntryList entries={entries} onDelete={jest.fn()} onDeleteAll={jest.fn()} />);

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
      makeEntry({ id: "1", name: "Charlie", weeks: 20, days: 0 }),
      makeEntry({ id: "2", name: "Alice", weeks: 20, days: 0 }),
      makeEntry({ id: "3", name: "Bob", weeks: 20, days: 0 }),
    ];
    render(<EntryList entries={entries} onDelete={jest.fn()} onDeleteAll={jest.fn()} />);

    const names = screen.getAllByText(/Alice|Bob|Charlie/);
    expect(names[0]).toHaveTextContent("Alice");
    expect(names[1]).toHaveTextContent("Bob");
    expect(names[2]).toHaveTextContent("Charlie");
  });

  it("keeps name-ascending tiebreaker when toggling due date direction", () => {
    const entries = [
      makeEntry({ id: "1", name: "Charlie", weeks: 20, days: 0 }),
      makeEntry({ id: "2", name: "Alice", weeks: 20, days: 0 }),
      makeEntry({ id: "3", name: "Bob", weeks: 20, days: 0 }),
    ];
    render(<EntryList entries={entries} onDelete={jest.fn()} onDeleteAll={jest.fn()} />);

    // Toggle due date to ascending
    fireEvent.press(screen.getByText(/Due Date/));

    const names = screen.getAllByText(/Alice|Bob|Charlie/);
    expect(names[0]).toHaveTextContent("Alice");
    expect(names[1]).toHaveTextContent("Bob");
    expect(names[2]).toHaveTextContent("Charlie");
  });

  it("breaks name ties by due date descending", () => {
    const entries = [
      makeEntry({ id: "1", name: "Sam", weeks: 10, days: 0 }),
      makeEntry({ id: "2", name: "Sam", weeks: 30, days: 0 }),
      makeEntry({ id: "3", name: "Sam", weeks: 20, days: 0 }),
    ];
    render(<EntryList entries={entries} onDelete={jest.fn()} onDeleteAll={jest.fn()} />);

    fireEvent.press(screen.getByText("Name"));

    const ages = screen.getAllByText(/\d+w \d+d/);
    expect(ages[0]).toHaveTextContent("30w 0d");
    expect(ages[1]).toHaveTextContent("20w 0d");
    expect(ages[2]).toHaveTextContent("10w 0d");
  });

  it("keeps due-date-descending tiebreaker when toggling name direction", () => {
    const entries = [
      makeEntry({ id: "1", name: "Sam", weeks: 10, days: 0 }),
      makeEntry({ id: "2", name: "Sam", weeks: 30, days: 0 }),
      makeEntry({ id: "3", name: "Sam", weeks: 20, days: 0 }),
    ];
    render(<EntryList entries={entries} onDelete={jest.fn()} onDeleteAll={jest.fn()} />);

    fireEvent.press(screen.getByText("Name"));
    fireEvent.press(screen.getByText(/Name/));

    const ages = screen.getAllByText(/\d+w \d+d/);
    expect(ages[0]).toHaveTextContent("30w 0d");
    expect(ages[1]).toHaveTextContent("20w 0d");
    expect(ages[2]).toHaveTextContent("10w 0d");
  });

  it("does not show sort controls when list is empty", () => {
    render(<EntryList entries={[]} onDelete={jest.fn()} onDeleteAll={jest.fn()} />);

    expect(screen.queryByText(/Due Date/)).toBeNull();
    expect(screen.queryByText(/Name/)).toBeNull();
    expect(screen.queryByText("Delete All")).toBeNull();
  });

  it("shows Delete All button when entries exist", () => {
    const entries = [makeEntry({ id: "1", name: "Baby", weeks: 10, days: 0 })];
    render(<EntryList entries={entries} onDelete={jest.fn()} onDeleteAll={jest.fn()} />);

    expect(screen.getByText("Delete All")).toBeTruthy();
  });

  it("shows confirmation dialog when Delete All is pressed", () => {
    const alertSpy = jest.spyOn(Alert, "alert");
    const entries = [makeEntry({ id: "1", name: "Baby", weeks: 10, days: 0 })];
    render(<EntryList entries={entries} onDelete={jest.fn()} onDeleteAll={jest.fn()} />);

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
    const entries = [makeEntry({ id: "1", name: "Baby", weeks: 10, days: 0 })];
    render(<EntryList entries={entries} onDelete={jest.fn()} onDeleteAll={onDeleteAll} />);

    fireEvent.press(screen.getByText("Delete All"));

    // Simulate pressing the "Delete" button in the alert
    const buttons = alertSpy.mock.calls[0][2] as Array<{ text: string; onPress?: () => void }>;
    const deleteButton = buttons.find((b) => b.text === "Delete");
    deleteButton?.onPress?.();

    expect(onDeleteAll).toHaveBeenCalledTimes(1);
    alertSpy.mockRestore();
  });

  it("does not call onDeleteAll when user cancels", () => {
    const alertSpy = jest.spyOn(Alert, "alert");
    const onDeleteAll = jest.fn();
    const entries = [makeEntry({ id: "1", name: "Baby", weeks: 10, days: 0 })];
    render(<EntryList entries={entries} onDelete={jest.fn()} onDeleteAll={onDeleteAll} />);

    fireEvent.press(screen.getByText("Delete All"));

    // Simulate pressing the "Cancel" button in the alert
    const buttons = alertSpy.mock.calls[0][2] as Array<{ text: string; onPress?: () => void }>;
    const cancelButton = buttons.find((b) => b.text === "Cancel");
    cancelButton?.onPress?.();

    expect(onDeleteAll).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it("renders delete background behind entry rows", () => {
    const entries = [makeEntry({ id: "1", name: "Baby", weeks: 10, days: 0 })];
    render(<EntryList entries={entries} onDelete={jest.fn()} onDeleteAll={jest.fn()} />);

    expect(screen.getByTestId("delete-background")).toBeTruthy();
  });

  it("renders a delete background for each entry", () => {
    const entries = [
      makeEntry({ id: "1", name: "Baby A", weeks: 10, days: 0 }),
      makeEntry({ id: "2", name: "Baby B", weeks: 20, days: 5 }),
    ];
    render(<EntryList entries={entries} onDelete={jest.fn()} onDeleteAll={jest.fn()} />);

    expect(screen.getAllByTestId("delete-background")).toHaveLength(2);
  });
});
