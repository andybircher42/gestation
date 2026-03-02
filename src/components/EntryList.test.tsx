import { render, screen, fireEvent } from "@testing-library/react-native";
import EntryList from "./EntryList";

describe("EntryList", () => {
  it('shows "No entries yet" when empty', () => {
    render(<EntryList entries={[]} onDelete={jest.fn()} />);
    expect(screen.getByText("No entries yet")).toBeTruthy();
  });

  it("renders entry name and formatted age", () => {
    const entries = [{ id: "1", name: "Baby A", weeks: 12, days: 3 }];
    render(<EntryList entries={entries} onDelete={jest.fn()} />);

    expect(screen.getByText("Baby A")).toBeTruthy();
    expect(screen.getByText("12 weeks, 3 days")).toBeTruthy();
  });

  it("pluralizes singular (1 week, 1 day)", () => {
    const entries = [{ id: "1", name: "Baby", weeks: 1, days: 1 }];
    render(<EntryList entries={entries} onDelete={jest.fn()} />);

    expect(screen.getByText("1 week, 1 day")).toBeTruthy();
  });

  it("pluralizes zero (0 weeks, 0 days)", () => {
    const entries = [{ id: "1", name: "Baby", weeks: 0, days: 0 }];
    render(<EntryList entries={entries} onDelete={jest.fn()} />);

    expect(screen.getByText("0 weeks, 0 days")).toBeTruthy();
  });

  it("calls onDelete with correct id", () => {
    const onDelete = jest.fn();
    const entries = [{ id: "abc", name: "Baby", weeks: 5, days: 2 }];
    render(<EntryList entries={entries} onDelete={onDelete} />);

    fireEvent.press(screen.getByText("✕"));
    expect(onDelete).toHaveBeenCalledWith("abc");
  });

  it("renders multiple entries", () => {
    const entries = [
      { id: "1", name: "Baby A", weeks: 10, days: 0 },
      { id: "2", name: "Baby B", weeks: 20, days: 5 },
      { id: "3", name: "Baby C", weeks: 35, days: 2 },
    ];
    render(<EntryList entries={entries} onDelete={jest.fn()} />);

    expect(screen.getByText("Baby A")).toBeTruthy();
    expect(screen.getByText("Baby B")).toBeTruthy();
    expect(screen.getByText("Baby C")).toBeTruthy();
  });
});
