/**
 * Integration test: verify the same entries render correctly
 * when switching between compact (EntryList) and cozy (EntryGrid) layouts.
 */
import { screen } from "@testing-library/react-native";

import { Entry } from "@/storage";
import { setupFakeTimers, teardownFakeTimers } from "@/test/fakeTimers";
import { makeEntry } from "@/test/mockData";
import renderWithTheme from "@/test/renderWithTheme";

import EntryGrid from "./EntryGrid";
import EntryList from "./EntryList";

const entries: Entry[] = [
  makeEntry({ id: "1", name: "Alice", dueDate: "2026-06-15", createdAt: 3000 }),
  makeEntry({ id: "2", name: "Bob", dueDate: "2026-09-11", createdAt: 2000 }),
  makeEntry({ id: "3", name: "Carol", dueDate: "2026-07-20", createdAt: 1000 }),
];

const callbacks = {
  onDelete: jest.fn(),
  onDeliver: jest.fn(),
  onDeleteAll: jest.fn(),
  onAdd: jest.fn(),
};

beforeEach(() => {
  setupFakeTimers();
});

afterEach(() => {
  teardownFakeTimers();
});

describe("Layout switching integration", () => {
  it("compact layout shows all entry names", () => {
    renderWithTheme(<EntryList entries={entries} {...callbacks} />, {
      layout: "compact",
    });

    expect(screen.getByText("Alice")).toBeTruthy();
    expect(screen.getByText("Bob")).toBeTruthy();
    expect(screen.getByText("Carol")).toBeTruthy();
  });

  it("cozy layout shows the same entry names", () => {
    renderWithTheme(<EntryGrid entries={entries} {...callbacks} />, {
      layout: "cozy",
    });

    expect(screen.getByText("Alice")).toBeTruthy();
    expect(screen.getByText("Bob")).toBeTruthy();
    expect(screen.getByText("Carol")).toBeTruthy();
  });

  it("compact shows gestational ages", () => {
    renderWithTheme(<EntryList entries={entries} {...callbacks} />, {
      layout: "compact",
    });

    // Alice: 2026-06-15, 105 days away → 25w 0d
    expect(screen.getByText("25w 0d")).toBeTruthy();
  });

  it("cozy shows gestational ages", () => {
    renderWithTheme(<EntryGrid entries={entries} {...callbacks} />, {
      layout: "cozy",
    });

    // Same GA should be visible in card format
    expect(screen.getByText(/25w 0d/)).toBeTruthy();
  });

  it("both layouts show sort controls with entries", () => {
    const { unmount } = renderWithTheme(
      <EntryList entries={entries} {...callbacks} />,
      { layout: "compact" },
    );
    expect(screen.getByLabelText(/Sort by:/)).toBeTruthy();
    unmount();

    renderWithTheme(<EntryGrid entries={entries} {...callbacks} />, {
      layout: "cozy",
    });
    expect(screen.getByLabelText(/Sort by:/)).toBeTruthy();
  });

  it("both layouts show empty state with no entries", () => {
    const { unmount } = renderWithTheme(
      <EntryList entries={[]} {...callbacks} />,
      { layout: "compact" },
    );
    expect(screen.getByText("Track your first pregnancy")).toBeTruthy();
    unmount();

    renderWithTheme(<EntryGrid entries={[]} {...callbacks} />, {
      layout: "cozy",
    });
    expect(screen.getByText("Track your first pregnancy")).toBeTruthy();
  });

  it("both layouts filter out delivered entries from main list", () => {
    const mixed = [
      ...entries,
      makeEntry({
        id: "4",
        name: "Zara",
        dueDate: "2026-05-01",
        deliveredAt: Date.now(),
      }),
    ];

    const { unmount } = renderWithTheme(
      <EntryList entries={mixed} {...callbacks} />,
      { layout: "compact" },
    );
    // Zara is delivered so should not appear in expecting list
    expect(screen.queryByText("Zara")).toBeNull();
    unmount();

    renderWithTheme(<EntryGrid entries={mixed} {...callbacks} />, {
      layout: "cozy",
    });
    expect(screen.queryByText("Zara")).toBeNull();
  });
});
