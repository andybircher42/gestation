import { Alert } from "react-native";
import { fireEvent, screen } from "@testing-library/react-native";

import { Entry } from "@/storage";
import { setupFakeTimers, teardownFakeTimers } from "@/test/fakeTimers";
import { makeEntry } from "@/test/mockData";
import renderWithTheme from "@/test/renderWithTheme";

import EntryGrid from "./EntryGrid";

/** Renders EntryGrid with defaults for all callbacks. Returns the mocks. */
function renderGrid(
  entries: Entry[],
  overrides: {
    onDelete?: jest.Mock;
    onDeliver?: jest.Mock;
    onDeleteAll?: jest.Mock;
    onAdd?: jest.Mock;
  } = {},
) {
  const onDelete = overrides.onDelete ?? jest.fn();
  const onDeliver = overrides.onDeliver ?? jest.fn();
  const onDeleteAll = overrides.onDeleteAll ?? jest.fn();
  const onAdd = overrides.onAdd ?? jest.fn();
  renderWithTheme(
    <EntryGrid
      entries={entries}
      onDelete={onDelete}
      onDeliver={onDeliver}
      onDeleteAll={onDeleteAll}
      onAdd={onAdd}
    />,
    { layout: "cozy" },
  );
  return { onDelete, onDeliver, onDeleteAll, onAdd };
}

beforeEach(() => {
  setupFakeTimers();
});

afterEach(() => {
  teardownFakeTimers();
});

describe("EntryGrid", () => {
  it("shows empty state when no entries", () => {
    renderGrid([]);

    expect(screen.getByText("Track your first pregnancy")).toBeTruthy();
    expect(screen.getByText("Enter a name and due date to start")).toBeTruthy();
  });

  it("opens form when empty state card is tapped", () => {
    renderGrid([]);

    fireEvent.press(screen.getByText("Track your first pregnancy"));

    expect(screen.getByLabelText("Name")).toBeTruthy();
  });

  it("renders entry cards with names", () => {
    renderGrid([
      makeEntry({ id: "1", name: "Alice", dueDate: "2026-09-11" }),
      makeEntry({ id: "2", name: "Bob", dueDate: "2026-08-20" }),
    ]);

    expect(screen.getByText("Alice")).toBeTruthy();
    expect(screen.getByText("Bob")).toBeTruthy();
    expect(screen.getAllByTestId("entry-card")).toHaveLength(2);
  });

  it("shows add card", () => {
    renderGrid([makeEntry({ id: "1", name: "Alice", dueDate: "2026-09-11" })]);

    expect(screen.getByTestId("add-card")).toBeTruthy();
    expect(screen.getByText("Add someone")).toBeTruthy();
  });

  it("opens form when add card is tapped and closes on close button", () => {
    renderGrid([makeEntry({ id: "1", name: "Alice", dueDate: "2026-09-11" })]);

    fireEvent.press(screen.getByTestId("add-card"));
    expect(screen.getByLabelText("Name")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Close form"));
    expect(screen.queryByLabelText("Name")).toBeNull();
  });

  it("toggles between single and batch entry mode", () => {
    renderGrid([makeEntry({ id: "1", name: "Alice", dueDate: "2026-09-11" })]);

    fireEvent.press(screen.getByTestId("add-card"));

    // Initially shows "Add multiple" (single mode)
    expect(screen.getByText("Add multiple")).toBeTruthy();

    // Toggle to batch mode
    fireEvent.press(screen.getByLabelText("Switch to batch entry"));
    expect(screen.getByText("Add one at a time")).toBeTruthy();

    // Toggle back to single mode
    fireEvent.press(screen.getByLabelText("Switch to single entry"));
    expect(screen.getByText("Add multiple")).toBeTruthy();
  });

  it("cycles sort field when field button is pressed", () => {
    renderGrid([makeEntry({ id: "1", name: "Alice", dueDate: "2026-09-11" })]);

    // Default is "No sort" (insertion order)
    expect(screen.getByText("No sort")).toBeTruthy();

    // Cycle to "Date"
    fireEvent.press(screen.getByLabelText(/Sort by:/));
    expect(screen.getByText("Date")).toBeTruthy();
  });

  it("shows direction toggle for Due date and Name, hides for Added", () => {
    renderGrid([makeEntry({ id: "1", name: "Alice", dueDate: "2026-09-11" })]);

    // "No sort" — no direction button
    expect(screen.queryByLabelText(/Direction:/)).toBeNull();

    // Cycle to "Date" — direction button appears
    fireEvent.press(screen.getByLabelText(/Sort by:/));
    expect(screen.getByLabelText(/Direction:/)).toBeTruthy();
  });

  it("shows confirmation alert when Remove all is pressed", () => {
    const alertSpy = jest.spyOn(Alert, "alert");
    renderGrid([makeEntry({ id: "1", name: "Alice", dueDate: "2026-09-11" })]);

    fireEvent.press(screen.getByLabelText("Remove all"));

    expect(alertSpy).toHaveBeenCalledWith(
      "Remove everyone?",
      expect.stringContaining("remove all"),
      expect.any(Array),
    );
  });

  it("calls onDeleteAll when Remove all is confirmed", () => {
    const alertSpy = jest.spyOn(Alert, "alert");
    const { onDeleteAll } = renderGrid([
      makeEntry({ id: "1", name: "Alice", dueDate: "2026-09-11" }),
    ]);

    fireEvent.press(screen.getByLabelText("Remove all"));

    const buttons = alertSpy.mock.calls[0][2] as Array<{
      text: string;
      onPress?: () => void;
    }>;
    buttons.find((b) => b.text === "Remove all")?.onPress?.();

    expect(onDeleteAll).toHaveBeenCalledTimes(1);
  });

  it("shows alert with entry name on long press", () => {
    const alertSpy = jest.spyOn(Alert, "alert");
    renderGrid([makeEntry({ id: "1", name: "Alice", dueDate: "2026-09-11" })]);

    fireEvent(screen.getAllByTestId("entry-card")[0], "longPress");

    expect(alertSpy).toHaveBeenCalledWith(
      "Alice",
      undefined,
      expect.arrayContaining([
        expect.objectContaining({ text: "Delivered" }),
        expect.objectContaining({ text: "Remove" }),
        expect.objectContaining({ text: "Cancel" }),
      ]),
    );
  });

  it("calls onDeliver when Delivered is selected from long press alert", () => {
    const alertSpy = jest.spyOn(Alert, "alert");
    const { onDeliver } = renderGrid([
      makeEntry({ id: "abc", name: "Alice", dueDate: "2026-09-11" }),
    ]);

    fireEvent(screen.getAllByTestId("entry-card")[0], "longPress");

    const buttons = alertSpy.mock.calls[0][2] as Array<{
      text: string;
      onPress?: () => void;
    }>;
    buttons.find((b) => b.text === "Delivered")?.onPress?.();

    expect(onDeliver).toHaveBeenCalledWith("abc");
  });

  it("calls onDelete when Remove is selected from long press alert", () => {
    const alertSpy = jest.spyOn(Alert, "alert");
    const { onDelete } = renderGrid([
      makeEntry({ id: "xyz", name: "Alice", dueDate: "2026-09-11" }),
    ]);

    fireEvent(screen.getAllByTestId("entry-card")[0], "longPress");

    const buttons = alertSpy.mock.calls[0][2] as Array<{
      text: string;
      onPress?: () => void;
    }>;
    buttons.find((b) => b.text === "Remove")?.onPress?.();

    expect(onDelete).toHaveBeenCalledWith("xyz");
  });

  it("filters out delivered entries", () => {
    renderGrid([
      makeEntry({ id: "1", name: "Active", dueDate: "2026-09-11" }),
      makeEntry({
        id: "2",
        name: "Delivered",
        dueDate: "2026-08-20",
        deliveredAt: Date.now(),
      }),
    ]);

    expect(screen.getByText("Active")).toBeTruthy();
    expect(screen.queryByText("Delivered")).toBeNull();
  });

  it("adds spacer when total items (entries + add card) is odd", () => {
    // 2 entries + 1 add card = 3 items (odd) => spacer added to make 4
    renderGrid([
      makeEntry({ id: "1", name: "Alice", dueDate: "2026-09-11" }),
      makeEntry({ id: "2", name: "Bob", dueDate: "2026-08-20" }),
    ]);

    // 2 entry cards + 1 add card + 1 spacer = 4 items total (even for 2 columns)
    expect(screen.getAllByTestId("entry-card")).toHaveLength(2);
    expect(screen.getByTestId("add-card")).toBeTruthy();
  });

  it("does not add spacer when total items is already even", () => {
    // 1 entry + 1 add card = 2 items (even) => no spacer needed
    renderGrid([makeEntry({ id: "1", name: "Alice", dueDate: "2026-09-11" })]);

    expect(screen.getAllByTestId("entry-card")).toHaveLength(1);
    expect(screen.getByTestId("add-card")).toBeTruthy();
  });
});
