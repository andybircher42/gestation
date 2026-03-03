import { fireEvent, screen } from "@testing-library/react-native";

import renderWithTheme from "@/test/renderWithTheme";
import * as gestationalAge from "@/util/gestationalAge";
import { computeDueDate } from "@/util/gestationalAge";

import EntryForm from "./EntryForm";

/** Helper: switch to Gestational Age mode (Due Date is the default). */
function switchToWeeksDays() {
  fireEvent.press(screen.getByText("Gestational Age"));
}

describe("EntryForm — Gestational Age mode", () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: new Date(2026, 2, 2) });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("calls onAdd with trimmed name, parsed weeks/days, and computed dueDate", () => {
    const onAdd = jest.fn();
    renderWithTheme(<EntryForm onAdd={onAdd} />);
    switchToWeeksDays();

    fireEvent.changeText(screen.getByLabelText("Name"), "  Baby A  ");
    fireEvent.changeText(screen.getByLabelText("Weeks"), "12");
    fireEvent.changeText(screen.getByLabelText("Days"), "3");
    fireEvent.press(screen.getByText("Add"));

    const expectedDueDate = computeDueDate(12, 3, new Date(2026, 2, 2));
    const expectedDateStr = `${expectedDueDate.getFullYear()}-${String(expectedDueDate.getMonth() + 1).padStart(2, "0")}-${String(expectedDueDate.getDate()).padStart(2, "0")}`;
    expect(onAdd).toHaveBeenCalledWith({
      name: "Baby A",
      dueDate: expectedDateStr,
    });
  });

  it("does not accept empty weeks and days", () => {
    const onAdd = jest.fn();
    renderWithTheme(<EntryForm onAdd={onAdd} />);
    switchToWeeksDays();

    fireEvent.changeText(screen.getByLabelText("Name"), "Baby");
    fireEvent.press(screen.getByText("Add"));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("clears inputs after submission", () => {
    const onAdd = jest.fn();
    renderWithTheme(<EntryForm onAdd={onAdd} />);
    switchToWeeksDays();

    fireEvent.changeText(screen.getByLabelText("Name"), "Baby");
    fireEvent.changeText(screen.getByLabelText("Weeks"), "10");
    fireEvent.changeText(screen.getByLabelText("Days"), "5");
    fireEvent.press(screen.getByText("Add"));

    expect(screen.getByLabelText("Name").props.value).toBe("");
    expect(screen.getByLabelText("Weeks").props.value).toBe("");
    expect(screen.getByLabelText("Days").props.value).toBe("");
  });

  it("does not call onAdd when name is empty", () => {
    const onAdd = jest.fn();
    renderWithTheme(<EntryForm onAdd={onAdd} />);
    switchToWeeksDays();

    fireEvent.changeText(screen.getByLabelText("Weeks"), "10");
    fireEvent.changeText(screen.getByLabelText("Days"), "3");
    fireEvent.press(screen.getByText("Add"));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("does not call onAdd when weeks > 44", () => {
    const onAdd = jest.fn();
    renderWithTheme(<EntryForm onAdd={onAdd} />);
    switchToWeeksDays();

    fireEvent.changeText(screen.getByLabelText("Name"), "Baby");
    fireEvent.changeText(screen.getByLabelText("Weeks"), "45");
    fireEvent.changeText(screen.getByLabelText("Days"), "0");
    fireEvent.press(screen.getByText("Add"));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("does not call onAdd when days > 6", () => {
    const onAdd = jest.fn();
    renderWithTheme(<EntryForm onAdd={onAdd} />);
    switchToWeeksDays();

    fireEvent.changeText(screen.getByLabelText("Name"), "Baby");
    fireEvent.changeText(screen.getByLabelText("Weeks"), "10");
    fireEvent.changeText(screen.getByLabelText("Days"), "7");
    fireEvent.press(screen.getByText("Add"));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("shows range hints as placeholder text", () => {
    renderWithTheme(<EntryForm onAdd={jest.fn()} />);
    switchToWeeksDays();

    expect(screen.getByPlaceholderText("0-42")).toBeTruthy();
    expect(screen.getByPlaceholderText("0-6")).toBeTruthy();
  });

  it("rejects non-numeric input in weeks and days fields", () => {
    renderWithTheme(<EntryForm onAdd={jest.fn()} />);
    switchToWeeksDays();

    fireEvent.changeText(screen.getByLabelText("Weeks"), "abc");
    expect(screen.getByLabelText("Weeks").props.value).toBe("");

    fireEvent.changeText(screen.getByLabelText("Days"), "2x");
    expect(screen.getByLabelText("Days").props.value).toBe("");

    fireEvent.changeText(screen.getByLabelText("Weeks"), "12");
    expect(screen.getByLabelText("Weeks").props.value).toBe("12");

    fireEvent.changeText(screen.getByLabelText("Days"), "3");
    expect(screen.getByLabelText("Days").props.value).toBe("3");
  });

  it("disables Add button when weeks is out of range", () => {
    const onAdd = jest.fn();
    renderWithTheme(<EntryForm onAdd={onAdd} />);
    switchToWeeksDays();

    fireEvent.changeText(screen.getByLabelText("Name"), "Baby");
    fireEvent.changeText(screen.getByLabelText("Days"), "3");
    fireEvent.changeText(screen.getByLabelText("Weeks"), "45");
    fireEvent.press(screen.getByText("Add"));
    expect(onAdd).not.toHaveBeenCalled();

    fireEvent.changeText(screen.getByLabelText("Weeks"), "42");
    fireEvent.press(screen.getByText("Add"));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("disables Add button when days is out of range", () => {
    const onAdd = jest.fn();
    renderWithTheme(<EntryForm onAdd={onAdd} />);
    switchToWeeksDays();

    fireEvent.changeText(screen.getByLabelText("Name"), "Baby");
    fireEvent.changeText(screen.getByLabelText("Weeks"), "10");
    fireEvent.changeText(screen.getByLabelText("Days"), "7");
    fireEvent.press(screen.getByText("Add"));
    expect(onAdd).not.toHaveBeenCalled();

    fireEvent.changeText(screen.getByLabelText("Days"), "6");
    fireEvent.press(screen.getByText("Add"));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("Add button is disabled when name is empty and enabled when name is entered", () => {
    const onAdd = jest.fn();
    renderWithTheme(<EntryForm onAdd={onAdd} />);
    switchToWeeksDays();

    fireEvent.changeText(screen.getByLabelText("Weeks"), "10");
    fireEvent.changeText(screen.getByLabelText("Days"), "3");

    // Button should not fire when name is empty (disabled)
    fireEvent.press(screen.getByText("Add"));
    expect(onAdd).not.toHaveBeenCalled();

    // After entering a name, the button should work (enabled)
    fireEvent.changeText(screen.getByLabelText("Name"), "Baby");
    fireEvent.press(screen.getByText("Add"));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("shows error when weeks is out of range after blur", () => {
    renderWithTheme(<EntryForm onAdd={jest.fn()} />);
    switchToWeeksDays();

    const weeksInput = screen.getByLabelText("Weeks");
    fireEvent.changeText(weeksInput, "45");
    expect(screen.queryByLabelText("Weeks error")).toBeNull();

    fireEvent(weeksInput, "blur");
    expect(screen.getByLabelText("Weeks error")).toBeTruthy();
    expect(screen.getByText(/Weeks must be/)).toBeTruthy();
  });

  it("shows error when days is out of range after blur", () => {
    renderWithTheme(<EntryForm onAdd={jest.fn()} />);
    switchToWeeksDays();

    const daysInput = screen.getByLabelText("Days");
    fireEvent.changeText(daysInput, "7");
    expect(screen.queryByLabelText("Days error")).toBeNull();

    fireEvent(daysInput, "blur");
    expect(screen.getByLabelText("Days error")).toBeTruthy();
    expect(screen.getByText(/Days must be/)).toBeTruthy();
  });

  it("clears error when user starts typing again", () => {
    renderWithTheme(<EntryForm onAdd={jest.fn()} />);
    switchToWeeksDays();

    const weeksInput = screen.getByLabelText("Weeks");
    fireEvent.changeText(weeksInput, "45");
    fireEvent(weeksInput, "blur");
    expect(screen.getByLabelText("Weeks error")).toBeTruthy();

    fireEvent.changeText(weeksInput, "4");
    expect(screen.queryByLabelText("Weeks error")).toBeNull();
  });

  it("shows no error for valid weeks and days after blur", () => {
    renderWithTheme(<EntryForm onAdd={jest.fn()} />);
    switchToWeeksDays();

    const weeksInput = screen.getByLabelText("Weeks");
    const daysInput = screen.getByLabelText("Days");
    fireEvent.changeText(weeksInput, "20");
    fireEvent.changeText(daysInput, "3");
    fireEvent(weeksInput, "blur");
    fireEvent(daysInput, "blur");
    expect(screen.queryByLabelText("Weeks error")).toBeNull();
    expect(screen.queryByLabelText("Days error")).toBeNull();
  });

  it("shows no error when weeks and days are empty", () => {
    renderWithTheme(<EntryForm onAdd={jest.fn()} />);
    switchToWeeksDays();

    expect(screen.queryByLabelText("Weeks error")).toBeNull();
    expect(screen.queryByLabelText("Days error")).toBeNull();
  });
});

describe("EntryForm — mode toggle", () => {
  it("starts in Due Date mode by default", () => {
    renderWithTheme(<EntryForm onAdd={jest.fn()} />);

    expect(screen.getByLabelText("Due date")).toBeTruthy();
    expect(screen.getByLabelText("Select due date")).toBeTruthy();
    expect(screen.queryByLabelText("Weeks")).toBeNull();
    expect(screen.queryByLabelText("Days")).toBeNull();
  });

  it("switches to Gestational Age mode when toggle is pressed", () => {
    renderWithTheme(<EntryForm onAdd={jest.fn()} />);

    fireEvent.press(screen.getByText("Gestational Age"));

    expect(screen.getByLabelText("Weeks")).toBeTruthy();
    expect(screen.getByLabelText("Days")).toBeTruthy();
    expect(screen.queryByLabelText("Due date")).toBeNull();
    expect(screen.queryByLabelText("Select due date")).toBeNull();
  });

  it("switches back to Due Date mode", () => {
    renderWithTheme(<EntryForm onAdd={jest.fn()} />);

    fireEvent.press(screen.getByText("Gestational Age"));
    fireEvent.press(screen.getByText("Due Date"));

    expect(screen.getByLabelText("Due date")).toBeTruthy();
    expect(screen.getByLabelText("Select due date")).toBeTruthy();
    expect(screen.queryByLabelText("Weeks")).toBeNull();
    expect(screen.queryByLabelText("Days")).toBeNull();
  });
});

describe("EntryForm — Due Date mode", () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: new Date(2026, 2, 2) });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("shows date picker when button is pressed", () => {
    renderWithTheme(<EntryForm onAdd={jest.fn()} />);

    fireEvent.press(screen.getByLabelText("Select due date"));

    expect(screen.getByTestId("date-picker")).toBeTruthy();
  });

  it("shows computed gestational age preview after selecting a date", () => {
    jest
      .spyOn(gestationalAge, "computeGestationalAge")
      .mockReturnValue({ weeks: 32, days: 4 });

    renderWithTheme(<EntryForm onAdd={jest.fn()} />);
    fireEvent.press(screen.getByLabelText("Select due date"));

    // Trigger mock date selection
    fireEvent.press(screen.getByTestId("date-picker-trigger"));

    expect(screen.getByText("Gestational Age -> 32w 4d")).toBeTruthy();

    jest.restoreAllMocks();
  });

  it("submits dueDate when Add is pressed in Due Date mode", () => {
    jest
      .spyOn(gestationalAge, "computeGestationalAge")
      .mockReturnValue({ weeks: 35, days: 2 });

    const onAdd = jest.fn();
    renderWithTheme(<EntryForm onAdd={onAdd} />);

    fireEvent.changeText(screen.getByLabelText("Name"), "Baby B");
    fireEvent.press(screen.getByLabelText("Select due date"));
    fireEvent.press(screen.getByTestId("date-picker-trigger"));
    fireEvent.press(screen.getByText("Add"));

    expect(onAdd).toHaveBeenCalledWith({
      name: "Baby B",
      dueDate: "2026-06-15",
    });

    jest.restoreAllMocks();
  });

  it("disables Add button when no due date is selected", () => {
    const onAdd = jest.fn();
    renderWithTheme(<EntryForm onAdd={onAdd} />);

    fireEvent.changeText(screen.getByLabelText("Name"), "Baby");
    fireEvent.press(screen.getByText("Add"));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("displays the selected date in the text input", () => {
    renderWithTheme(<EntryForm onAdd={jest.fn()} />);
    fireEvent.press(screen.getByLabelText("Select due date"));
    fireEvent.press(screen.getByTestId("date-picker-trigger"));

    // Mock picker returns June 15, 2026
    expect(screen.getByLabelText("Due date").props.value).toBe("06-15-2026");
  });

  it("clears due date after submission", () => {
    jest
      .spyOn(gestationalAge, "computeGestationalAge")
      .mockReturnValue({ weeks: 30, days: 0 });

    const onAdd = jest.fn();
    renderWithTheme(<EntryForm onAdd={onAdd} />);

    fireEvent.changeText(screen.getByLabelText("Name"), "Baby");
    fireEvent.press(screen.getByLabelText("Select due date"));
    fireEvent.press(screen.getByTestId("date-picker-trigger"));
    fireEvent.press(screen.getByText("Add"));

    expect(screen.getByLabelText("Due date").props.value).toBe("");
    expect(screen.queryByLabelText("Gestational age preview")).toBeNull();

    jest.restoreAllMocks();
  });
});

describe("EntryForm — typed date input", () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: new Date(2026, 2, 2) });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("typing a valid date sets dueDate and shows gestational age preview", () => {
    jest
      .spyOn(gestationalAge, "computeGestationalAge")
      .mockReturnValue({ weeks: 28, days: 3 });

    renderWithTheme(<EntryForm onAdd={jest.fn()} />);

    fireEvent.changeText(screen.getByLabelText("Due date"), "6-15-2026");

    expect(screen.getByText("Gestational Age -> 28w 3d")).toBeTruthy();

    jest.restoreAllMocks();
  });

  it("typing an invalid month does not enable Add button", () => {
    const onAdd = jest.fn();
    renderWithTheme(<EntryForm onAdd={onAdd} />);

    fireEvent.changeText(screen.getByLabelText("Name"), "Baby");
    fireEvent.changeText(screen.getByLabelText("Due date"), "13-1-2026");
    fireEvent.press(screen.getByText("Add"));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("typing non-date text does not enable Add button", () => {
    const onAdd = jest.fn();
    renderWithTheme(<EntryForm onAdd={onAdd} />);

    fireEvent.changeText(screen.getByLabelText("Name"), "Baby");
    fireEvent.changeText(screen.getByLabelText("Due date"), "abc");
    fireEvent.press(screen.getByText("Add"));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("typing an invalid day (Feb 30) does not enable Add button", () => {
    const onAdd = jest.fn();
    renderWithTheme(<EntryForm onAdd={onAdd} />);

    fireEvent.changeText(screen.getByLabelText("Name"), "Baby");
    fireEvent.changeText(screen.getByLabelText("Due date"), "2-30-2026");
    fireEvent.press(screen.getByText("Add"));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("picking from calendar populates the text input", () => {
    renderWithTheme(<EntryForm onAdd={jest.fn()} />);

    fireEvent.press(screen.getByLabelText("Select due date"));
    fireEvent.press(screen.getByTestId("date-picker-trigger"));

    expect(screen.getByLabelText("Due date").props.value).toBe("06-15-2026");
  });

  it("accepts a 2-digit year as 20xx", () => {
    jest
      .spyOn(gestationalAge, "computeGestationalAge")
      .mockReturnValue({ weeks: 28, days: 3 });

    const onAdd = jest.fn();
    renderWithTheme(<EntryForm onAdd={onAdd} />);

    fireEvent.changeText(screen.getByLabelText("Name"), "Baby");
    fireEvent.changeText(screen.getByLabelText("Due date"), "6-15-26");
    fireEvent.press(screen.getByText("Add"));

    expect(onAdd).toHaveBeenCalledTimes(1);

    jest.restoreAllMocks();
  });

  it("accepts single-digit month and day", () => {
    jest
      .spyOn(gestationalAge, "computeGestationalAge")
      .mockReturnValue({ weeks: 30, days: 0 });

    const onAdd = jest.fn();
    renderWithTheme(<EntryForm onAdd={onAdd} />);

    fireEvent.changeText(screen.getByLabelText("Name"), "Baby");
    fireEvent.changeText(screen.getByLabelText("Due date"), "3-5-2026");
    fireEvent.press(screen.getByText("Add"));

    expect(onAdd).toHaveBeenCalledTimes(1);

    jest.restoreAllMocks();
  });

  it('replaces non-numeric characters with "-"', () => {
    renderWithTheme(<EntryForm onAdd={jest.fn()} />);
    const input = screen.getByLabelText("Due date");

    fireEvent.changeText(input, "6-15-2026");
    expect(input.props.value).toBe("6-15-2026");

    fireEvent.changeText(input, "6.15.2026");
    expect(input.props.value).toBe("6-15-2026");

    fireEvent.changeText(input, "6 15 2026");
    expect(input.props.value).toBe("6-15-2026");
  });

  it("limits input to DD-DD-DDDD pattern", () => {
    renderWithTheme(<EntryForm onAdd={jest.fn()} />);
    const input = screen.getByLabelText("Due date");

    fireEvent.changeText(input, "03-28-20261");
    expect(input.props.value).toBe("03-28-2026");
  });

  it("allows no more than 2 hyphens", () => {
    renderWithTheme(<EntryForm onAdd={jest.fn()} />);
    const input = screen.getByLabelText("Due date");

    fireEvent.changeText(input, "03-28-38-28");
    expect(input.props.value).toBe("03-28-38");
  });

  it("collapses consecutive hyphens into one", () => {
    renderWithTheme(<EntryForm onAdd={jest.fn()} />);
    const input = screen.getByLabelText("Due date");

    fireEvent.changeText(input, "6---15---2026");
    expect(input.props.value).toBe("6-15-2026");

    fireEvent.changeText(input, "06--15--2026");
    expect(input.props.value).toBe("06-15-2026");
  });

  it('auto-inserts "-" after two-digit month', () => {
    renderWithTheme(<EntryForm onAdd={jest.fn()} />);
    const input = screen.getByLabelText("Due date");

    // Simulate typing "06" — should become "06-"
    fireEvent.changeText(input, "06");
    expect(input.props.value).toBe("06-");
  });

  it('auto-inserts "-" after two-digit day', () => {
    renderWithTheme(<EntryForm onAdd={jest.fn()} />);
    const input = screen.getByLabelText("Due date");

    // Simulate typing month then day
    fireEvent.changeText(input, "06-");
    fireEvent.changeText(input, "06-15");
    expect(input.props.value).toBe("06-15-");
  });

  it("normalizes date to MM-DD-YYYY on blur", () => {
    jest
      .spyOn(gestationalAge, "computeGestationalAge")
      .mockReturnValue({ weeks: 28, days: 3 });

    renderWithTheme(<EntryForm onAdd={jest.fn()} />);
    const input = screen.getByLabelText("Due date");

    fireEvent.changeText(input, "6-5-26");
    expect(input.props.value).toBe("6-5-26");

    fireEvent(input, "blur");
    expect(input.props.value).toBe("06-05-2026");

    jest.restoreAllMocks();
  });

  it("clears text input after submission", () => {
    jest
      .spyOn(gestationalAge, "computeGestationalAge")
      .mockReturnValue({ weeks: 28, days: 3 });

    const onAdd = jest.fn();
    renderWithTheme(<EntryForm onAdd={onAdd} />);

    fireEvent.changeText(screen.getByLabelText("Name"), "Baby");
    fireEvent.changeText(screen.getByLabelText("Due date"), "6-15-2026");
    fireEvent.press(screen.getByText("Add"));

    expect(screen.getByLabelText("Due date").props.value).toBe("");

    jest.restoreAllMocks();
  });

  it("shows no error when input is empty", () => {
    renderWithTheme(<EntryForm onAdd={jest.fn()} />);

    expect(screen.queryByLabelText("Date error")).toBeNull();
  });

  it("shows no error for a valid date", () => {
    renderWithTheme(<EntryForm onAdd={jest.fn()} />);

    fireEvent.changeText(screen.getByLabelText("Due date"), "6-15-2026");

    expect(screen.queryByLabelText("Date error")).toBeNull();
  });

  it("shows format error for incomplete date text after blur", () => {
    renderWithTheme(<EntryForm onAdd={jest.fn()} />);
    const input = screen.getByLabelText("Due date");

    fireEvent.changeText(input, "6-15");
    expect(screen.queryByLabelText("Date error")).toBeNull();

    fireEvent(input, "blur");
    expect(screen.getByLabelText("Date error")).toBeTruthy();
    expect(screen.getByText("Enter date as MM-DD-YYYY")).toBeTruthy();
  });

  it("shows error for invalid month after blur", () => {
    renderWithTheme(<EntryForm onAdd={jest.fn()} />);
    const input = screen.getByLabelText("Due date");

    fireEvent.changeText(input, "13-1-2026");
    fireEvent(input, "blur");

    expect(screen.getByText(/Month must be/)).toBeTruthy();
  });

  it("shows error for invalid day after blur", () => {
    renderWithTheme(<EntryForm onAdd={jest.fn()} />);
    const input = screen.getByLabelText("Due date");

    fireEvent.changeText(input, "1-32-2026");
    fireEvent(input, "blur");

    expect(screen.getByText(/Day must be/)).toBeTruthy();
  });

  it("shows error for impossible date like Feb 30 after blur", () => {
    renderWithTheme(<EntryForm onAdd={jest.fn()} />);
    const input = screen.getByLabelText("Due date");

    fireEvent.changeText(input, "2-30-2026");
    fireEvent(input, "blur");

    expect(screen.getByText("02-30 is not a valid date")).toBeTruthy();
  });

  it("clears date error when user starts typing again", () => {
    renderWithTheme(<EntryForm onAdd={jest.fn()} />);
    const input = screen.getByLabelText("Due date");

    fireEvent.changeText(input, "13-1-2026");
    fireEvent(input, "blur");
    expect(screen.getByLabelText("Date error")).toBeTruthy();

    fireEvent.changeText(input, "1");
    expect(screen.queryByLabelText("Date error")).toBeNull();
  });
});

describe("EntryForm — dueDate in onAdd callback", () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: new Date(2026, 2, 2) });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("passes the entered due date as ISO string in due date mode", () => {
    jest
      .spyOn(gestationalAge, "computeGestationalAge")
      .mockReturnValue({ weeks: 28, days: 3 });

    const onAdd = jest.fn();
    renderWithTheme(<EntryForm onAdd={onAdd} />);

    fireEvent.changeText(screen.getByLabelText("Name"), "Baby");
    fireEvent.changeText(screen.getByLabelText("Due date"), "6-15-2026");
    fireEvent.press(screen.getByText("Add"));

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ dueDate: "2026-06-15" }),
    );

    jest.restoreAllMocks();
  });

  it("passes a computed due date as ISO string in weeks/days mode", () => {
    const onAdd = jest.fn();
    renderWithTheme(<EntryForm onAdd={onAdd} />);
    switchToWeeksDays();

    fireEvent.changeText(screen.getByLabelText("Name"), "Baby");
    fireEvent.changeText(screen.getByLabelText("Weeks"), "20");
    fireEvent.changeText(screen.getByLabelText("Days"), "0");
    fireEvent.press(screen.getByText("Add"));

    // 20w0d = 140 days; dueDate = today + (280 - 140) = today + 140 days
    const expectedDueDate = computeDueDate(20, 0, new Date(2026, 2, 2));
    const expectedDateStr = `${expectedDueDate.getFullYear()}-${String(expectedDueDate.getMonth() + 1).padStart(2, "0")}-${String(expectedDueDate.getDate()).padStart(2, "0")}`;
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ dueDate: expectedDateStr }),
    );
  });
});
