import { fireEvent, screen } from "@testing-library/react-native";

const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: () => ({ back: mockBack }),
}));

import { useLocalSearchParams } from "expo-router";

import renderWithTheme from "@/test/renderWithTheme";

import DateDetailScreen from "../date-detail";

const mockParams = useLocalSearchParams as jest.Mock;

const sampleEntries = [
  {
    id: "1",
    name: "Alice",
    dueDate: "2026-07-15",
    createdAt: 1000,
    birthstone: { name: "Ruby", color: "#E0115F" },
  },
  {
    id: "2",
    name: "Bob",
    dueDate: "2026-07-15",
    createdAt: 2000,
    birthstone: { name: "Ruby", color: "#E0115F" },
  },
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe("DateDetailScreen", () => {
  it("renders the date heading", () => {
    mockParams.mockReturnValue({
      date: "2026-07-15",
      entries: JSON.stringify(sampleEntries),
    });

    renderWithTheme(<DateDetailScreen />);

    expect(screen.getByText("July 15, 2026")).toBeTruthy();
  });

  it("shows the correct people count", () => {
    mockParams.mockReturnValue({
      date: "2026-07-15",
      entries: JSON.stringify(sampleEntries),
    });

    renderWithTheme(<DateDetailScreen />);

    expect(screen.getByText("2 people due")).toBeTruthy();
  });

  it("shows singular when one person is due", () => {
    mockParams.mockReturnValue({
      date: "2026-07-15",
      entries: JSON.stringify([sampleEntries[0]]),
    });

    renderWithTheme(<DateDetailScreen />);

    expect(screen.getByText("1 person due")).toBeTruthy();
  });

  it("renders entry names", () => {
    mockParams.mockReturnValue({
      date: "2026-07-15",
      entries: JSON.stringify(sampleEntries),
    });

    renderWithTheme(<DateDetailScreen />);

    expect(screen.getByText("Alice")).toBeTruthy();
    expect(screen.getByText("Bob")).toBeTruthy();
  });

  it("shows gestational age for entries", () => {
    mockParams.mockReturnValue({
      date: "2026-07-15",
      entries: JSON.stringify(sampleEntries),
    });

    renderWithTheme(<DateDetailScreen />);

    expect(screen.getAllByText("Gestational age")).toHaveLength(2);
  });

  it("shows birthstone name when entry has one", () => {
    mockParams.mockReturnValue({
      date: "2026-07-15",
      entries: JSON.stringify(sampleEntries),
    });

    renderWithTheme(<DateDetailScreen />);

    expect(screen.getAllByText("Ruby")).toHaveLength(2);
  });

  it("navigates back when back button is pressed", () => {
    mockParams.mockReturnValue({
      date: "2026-07-15",
      entries: JSON.stringify(sampleEntries),
    });

    renderWithTheme(<DateDetailScreen />);

    fireEvent.press(screen.getByLabelText("Go back"));

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("navigates back when Done button is pressed", () => {
    mockParams.mockReturnValue({
      date: "2026-07-15",
      entries: JSON.stringify(sampleEntries),
    });

    renderWithTheme(<DateDetailScreen />);

    fireEvent.press(screen.getByLabelText("Done"));

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("handles empty entries gracefully", () => {
    mockParams.mockReturnValue({
      date: "2026-07-15",
      entries: "[]",
    });

    renderWithTheme(<DateDetailScreen />);

    expect(screen.getByText("0 people due")).toBeTruthy();
  });

  it("handles malformed entries JSON", () => {
    mockParams.mockReturnValue({
      date: "2026-07-15",
      entries: "not-json",
    });

    renderWithTheme(<DateDetailScreen />);

    expect(screen.getByText("0 people due")).toBeTruthy();
  });

  it("falls back to raw ISO date for invalid date strings", () => {
    mockParams.mockReturnValue({
      date: "bad-date",
      entries: "[]",
    });

    renderWithTheme(<DateDetailScreen />);

    expect(screen.getByText("bad-date")).toBeTruthy();
  });
});
