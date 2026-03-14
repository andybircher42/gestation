import { render, screen } from "@testing-library/react-native";

import { Entry } from "@/storage";
import { ThemeProvider } from "@/theme";

import DeliveredList from "./DeliveredList";

const noopSet = jest.fn();

const DELIVERED_ENTRY: Entry = {
  id: "d1",
  name: "Jane Doe",
  dueDate: "2025-06-15",
  createdAt: 1700000000000,
  deliveredAt: 1700100000000,
  birthstone: { name: "pearl", color: "#F0EDE8" },
};

function renderWithLayout(
  layout: "compact" | "cozy",
  entries: Entry[] = [DELIVERED_ENTRY],
) {
  return render(
    <ThemeProvider
      personality="classic"
      brightness="light"
      layout={layout}
      setPersonality={noopSet}
      setBrightness={noopSet}
      setLayout={noopSet}
    >
      <DeliveredList
        entries={entries}
        onDelete={jest.fn()}
        onDeleteAll={jest.fn()}
      />
    </ThemeProvider>,
  );
}

describe("DeliveredList", () => {
  it("renders in compact layout without crashing", () => {
    renderWithLayout("compact");
    expect(screen.getByText("Jane Doe")).toBeTruthy();
  });

  it("renders in cozy layout without crashing", () => {
    renderWithLayout("cozy");
    expect(screen.getByText("Jane Doe")).toBeTruthy();
  });

  it("switches from cozy to compact without crashing (regression: FlatList numColumns)", () => {
    const { rerender } = renderWithLayout("cozy");

    // Switch to compact — this previously crashed with
    // "Changing numColumns on the fly is not supported"
    rerender(
      <ThemeProvider
        personality="classic"
        brightness="light"
        layout="compact"
        setPersonality={noopSet}
        setBrightness={noopSet}
        setLayout={noopSet}
      >
        <DeliveredList
          entries={[DELIVERED_ENTRY]}
          onDelete={jest.fn()}
          onDeleteAll={jest.fn()}
        />
      </ThemeProvider>,
    );

    expect(screen.getByText("Jane Doe")).toBeTruthy();
  });

  it("switches from compact to cozy without crashing", () => {
    const { rerender } = renderWithLayout("compact");

    rerender(
      <ThemeProvider
        personality="classic"
        brightness="light"
        layout="cozy"
        setPersonality={noopSet}
        setBrightness={noopSet}
        setLayout={noopSet}
      >
        <DeliveredList
          entries={[DELIVERED_ENTRY]}
          onDelete={jest.fn()}
          onDeleteAll={jest.fn()}
        />
      </ThemeProvider>,
    );

    expect(screen.getByText("Jane Doe")).toBeTruthy();
  });

  it("shows empty state when no delivered entries", () => {
    renderWithLayout("compact", []);
    expect(screen.getByText("No deliveries yet")).toBeTruthy();
  });

  it("shows empty state in cozy mode when no delivered entries", () => {
    renderWithLayout("cozy", []);
    expect(screen.getByText("No deliveries yet")).toBeTruthy();
  });

  it("shows header with delivered count", () => {
    renderWithLayout("compact");
    expect(screen.getByText("Delivered")).toBeTruthy();
    expect(screen.getByText("1")).toBeTruthy();
  });

  it("filters to only delivered entries", () => {
    const entries: Entry[] = [
      DELIVERED_ENTRY,
      {
        id: "a1",
        name: "Active Patient",
        dueDate: "2025-07-01",
        createdAt: 1700000000000,
      },
    ];
    renderWithLayout("compact", entries);
    expect(screen.getByText("Jane Doe")).toBeTruthy();
    expect(screen.queryByText("Active Patient")).toBeNull();
  });
});
