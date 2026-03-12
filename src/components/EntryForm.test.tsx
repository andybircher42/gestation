import { fireEvent, screen } from "@testing-library/react-native";

import renderWithTheme from "@/test/renderWithTheme";
import * as gestationalAge from "@/util";
import { computeDueDate } from "@/util";

import EntryForm from "./EntryForm";

beforeEach(() => {
  jest.useFakeTimers({ now: new Date(2026, 2, 2) });
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

/** Renders EntryForm and returns the onAdd mock. */
function renderForm(onAdd = jest.fn(), batch = false) {
  renderWithTheme(<EntryForm onAdd={onAdd} batch={batch} />);
  return onAdd;
}

/** Types a name to reveal the date fields (progressive disclosure). */
function typeName(name = "Baby") {
  fireEvent.changeText(screen.getByLabelText("Name"), name);
}

/** Renders EntryForm with a name entered (to reveal date fields) and returns the onAdd mock. */
function renderFormWithName(onAdd = jest.fn()) {
  renderForm(onAdd);
  typeName();
  return onAdd;
}

/** Renders EntryForm in Gestational Age mode and returns the onAdd mock. */
function renderInWeeksDaysMode(onAdd = jest.fn()) {
  renderFormWithName(onAdd);
  fireEvent.press(screen.getByLabelText("Switch to gestational age input"));
  return onAdd;
}

/** Simulates selecting a date from the calendar picker. */
function pickDate() {
  fireEvent.press(screen.getByLabelText("Select due date"));
  fireEvent.press(screen.getByTestId("date-picker-trigger"));
}

/** Mocks computeGestationalAge to return the given weeks and days. */
function mockGestationalAge(weeks: number, days: number) {
  jest
    .spyOn(gestationalAge, "computeGestationalAge")
    .mockReturnValue({ weeks, days });
}

describe("EntryForm — Gestational Age mode", () => {
  it("calls onAdd with trimmed name, parsed weeks/days, and computed dueDate", () => {
    const onAdd = renderInWeeksDaysMode();

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
    const onAdd = renderInWeeksDaysMode();

    fireEvent.changeText(screen.getByLabelText("Name"), "Baby");
    fireEvent.press(screen.getByText("Add"));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("resets form after submission and shows confirmation", () => {
    renderInWeeksDaysMode();

    fireEvent.changeText(screen.getByLabelText("Weeks"), "10");
    fireEvent.changeText(screen.getByLabelText("Days"), "5");
    fireEvent.press(screen.getByText("Add"));

    // Name is cleared, so date fields are hidden via progressive disclosure
    expect(screen.getByLabelText("Name").props.value).toBe("");
    expect(screen.queryByLabelText("Weeks")).toBeNull();
    expect(screen.queryByLabelText("Days")).toBeNull();
    // Shows confirmation with gestational age
    expect(screen.getByLabelText("Added Baby, 10w 5d")).toBeTruthy();
  });

  it("does not call onAdd when name is only whitespace", () => {
    const onAdd = renderInWeeksDaysMode();

    fireEvent.changeText(screen.getByLabelText("Name"), "   ");
    // Date fields hidden because trimmed name is empty
    expect(screen.queryByLabelText("Weeks")).toBeNull();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("does not call onAdd when weeks > 44", () => {
    const onAdd = renderInWeeksDaysMode();

    fireEvent.changeText(screen.getByLabelText("Name"), "Baby");
    fireEvent.changeText(screen.getByLabelText("Weeks"), "45");
    fireEvent.changeText(screen.getByLabelText("Days"), "0");
    fireEvent.press(screen.getByText("Add"));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("does not call onAdd when days > 6", () => {
    const onAdd = renderInWeeksDaysMode();

    fireEvent.changeText(screen.getByLabelText("Name"), "Baby");
    fireEvent.changeText(screen.getByLabelText("Weeks"), "10");
    fireEvent.changeText(screen.getByLabelText("Days"), "7");
    fireEvent.press(screen.getByText("Add"));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("shows range hints as placeholder text", () => {
    renderInWeeksDaysMode();

    expect(screen.getByPlaceholderText("0\u201342")).toBeTruthy();
    expect(screen.getByPlaceholderText("0\u20136")).toBeTruthy();
  });

  it("shows date format as placeholder text in due date mode", () => {
    renderFormWithName();

    expect(screen.getByPlaceholderText("MM-DD-YYYY")).toBeTruthy();
  });

  it("rejects non-numeric input in weeks and days fields", () => {
    renderInWeeksDaysMode();

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
    const onAdd = renderInWeeksDaysMode();

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
    const onAdd = renderInWeeksDaysMode();

    fireEvent.changeText(screen.getByLabelText("Name"), "Baby");
    fireEvent.changeText(screen.getByLabelText("Weeks"), "10");
    fireEvent.changeText(screen.getByLabelText("Days"), "7");
    fireEvent.press(screen.getByText("Add"));
    expect(onAdd).not.toHaveBeenCalled();

    fireEvent.changeText(screen.getByLabelText("Days"), "6");
    fireEvent.press(screen.getByText("Add"));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("Add button works when name and valid weeks/days are entered", () => {
    const onAdd = renderInWeeksDaysMode();

    fireEvent.changeText(screen.getByLabelText("Weeks"), "10");
    fireEvent.changeText(screen.getByLabelText("Days"), "3");

    fireEvent.press(screen.getByText("Add"));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("shows error when weeks is out of range after blur", () => {
    renderInWeeksDaysMode();

    const weeksInput = screen.getByLabelText("Weeks");
    fireEvent.changeText(weeksInput, "45");
    expect(screen.queryByLabelText("Weeks error")).toBeNull();

    fireEvent(weeksInput, "blur");
    expect(screen.getByLabelText("Weeks error")).toBeTruthy();
    expect(screen.getByText(/Weeks must be/)).toBeTruthy();
  });

  it("shows error when days is out of range after blur", () => {
    renderInWeeksDaysMode();

    const daysInput = screen.getByLabelText("Days");
    fireEvent.changeText(daysInput, "7");
    expect(screen.queryByLabelText("Days error")).toBeNull();

    fireEvent(daysInput, "blur");
    expect(screen.getByLabelText("Days error")).toBeTruthy();
    expect(screen.getByText(/Days must be/)).toBeTruthy();
  });

  it("clears error when user starts typing again", () => {
    renderInWeeksDaysMode();

    const weeksInput = screen.getByLabelText("Weeks");
    fireEvent.changeText(weeksInput, "45");
    fireEvent(weeksInput, "blur");
    expect(screen.getByLabelText("Weeks error")).toBeTruthy();

    fireEvent.changeText(weeksInput, "4");
    expect(screen.queryByLabelText("Weeks error")).toBeNull();
  });

  it("shows no error for valid weeks and days after blur", () => {
    renderInWeeksDaysMode();

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
    renderInWeeksDaysMode();

    expect(screen.queryByLabelText("Weeks error")).toBeNull();
    expect(screen.queryByLabelText("Days error")).toBeNull();
  });
});

describe("EntryForm — progressive disclosure", () => {
  it("hides date fields until a name is entered", () => {
    renderForm();

    expect(screen.queryByLabelText("Due date")).toBeNull();
    expect(screen.queryByText("Enter gestational age instead")).toBeNull();

    typeName("Baby");

    expect(screen.getByLabelText("Due date")).toBeTruthy();
    expect(screen.getByText("Enter gestational age instead")).toBeTruthy();
  });

  it("hides date fields when name is cleared", () => {
    renderForm();

    typeName("Baby");
    expect(screen.getByLabelText("Due date")).toBeTruthy();

    fireEvent.changeText(screen.getByLabelText("Name"), "");
    expect(screen.queryByLabelText("Due date")).toBeNull();
  });

  it("shows placeholder text on name input", () => {
    renderForm();

    expect(screen.getByPlaceholderText("Who are you tracking?")).toBeTruthy();
  });
});

describe("EntryForm — mode switch", () => {
  it("starts in Due Date mode by default", () => {
    renderFormWithName();

    expect(screen.getByLabelText("Due date")).toBeTruthy();
    expect(screen.getByLabelText("Select due date")).toBeTruthy();
    expect(screen.queryByLabelText("Weeks")).toBeNull();
    expect(screen.queryByLabelText("Days")).toBeNull();
  });

  it("switches to Gestational Age mode via text link", () => {
    renderFormWithName();

    fireEvent.press(screen.getByText("Enter gestational age instead"));

    expect(screen.getByLabelText("Weeks")).toBeTruthy();
    expect(screen.getByLabelText("Days")).toBeTruthy();
    expect(screen.queryByLabelText("Due date")).toBeNull();
    expect(screen.getByText("Enter due date instead")).toBeTruthy();
  });

  it("switches back to Due Date mode via text link", () => {
    renderFormWithName();

    fireEvent.press(screen.getByText("Enter gestational age instead"));
    fireEvent.press(screen.getByText("Enter due date instead"));

    expect(screen.getByLabelText("Due date")).toBeTruthy();
    expect(screen.getByLabelText("Select due date")).toBeTruthy();
    expect(screen.queryByLabelText("Weeks")).toBeNull();
    expect(screen.queryByLabelText("Days")).toBeNull();
  });
});

describe("EntryForm — Due Date mode", () => {
  it("shows date picker when button is pressed", () => {
    renderFormWithName();

    fireEvent.press(screen.getByLabelText("Select due date"));

    expect(screen.getByTestId("date-picker")).toBeTruthy();
  });

  it("shows computed gestational age preview after selecting a date", () => {
    mockGestationalAge(32, 4);
    renderFormWithName();
    pickDate();

    expect(screen.getByText("Gestational age: 32w 4d")).toBeTruthy();
  });

  it("submits dueDate when Add is pressed in Due Date mode", () => {
    mockGestationalAge(35, 2);
    const onAdd = renderFormWithName();

    fireEvent.changeText(screen.getByLabelText("Name"), "Baby B");
    pickDate();
    fireEvent.press(screen.getByText("Add"));

    expect(onAdd).toHaveBeenCalledWith({
      name: "Baby B",
      dueDate: "2026-06-15",
    });
  });

  it("disables Add button when no due date is selected", () => {
    const onAdd = renderFormWithName();

    fireEvent.press(screen.getByText("Add"));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("displays the selected date in the text input", () => {
    renderFormWithName();
    pickDate();

    // Mock picker returns June 15, 2026
    expect(screen.getByLabelText("Due date").props.value).toBe("06-15-2026");
  });

  it("resets form after submission (name cleared, date fields hidden)", () => {
    mockGestationalAge(30, 0);
    renderFormWithName();

    pickDate();
    fireEvent.press(screen.getByText("Add"));

    // Name is cleared, so date fields are hidden via progressive disclosure
    expect(screen.getByLabelText("Name").props.value).toBe("");
    expect(screen.queryByLabelText("Due date")).toBeNull();
  });
});

describe("EntryForm — typed date input", () => {
  it("typing a valid date sets dueDate and shows gestational age preview", () => {
    mockGestationalAge(28, 3);
    renderFormWithName();

    fireEvent.changeText(screen.getByLabelText("Due date"), "6-15-2026");

    expect(screen.getByText("Gestational age: 28w 3d")).toBeTruthy();
  });

  it("typing an invalid month does not enable Add button", () => {
    const onAdd = renderFormWithName();

    fireEvent.changeText(screen.getByLabelText("Due date"), "13-1-2026");
    fireEvent.press(screen.getByText("Add"));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("typing non-date text does not enable Add button", () => {
    const onAdd = renderFormWithName();

    fireEvent.changeText(screen.getByLabelText("Due date"), "abc");
    fireEvent.press(screen.getByText("Add"));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("typing an invalid day (Feb 30) does not enable Add button", () => {
    const onAdd = renderFormWithName();

    fireEvent.changeText(screen.getByLabelText("Due date"), "2-30-2026");
    fireEvent.press(screen.getByText("Add"));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("picking from calendar populates the text input", () => {
    renderFormWithName();

    pickDate();

    expect(screen.getByLabelText("Due date").props.value).toBe("06-15-2026");
  });

  it("accepts a 2-digit year as 20xx", () => {
    mockGestationalAge(28, 3);
    const onAdd = renderFormWithName();

    fireEvent.changeText(screen.getByLabelText("Due date"), "6-15-26");
    fireEvent.press(screen.getByText("Add"));

    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("accepts single-digit month and day", () => {
    mockGestationalAge(30, 0);
    const onAdd = renderFormWithName();

    fireEvent.changeText(screen.getByLabelText("Due date"), "3-5-2026");
    fireEvent.press(screen.getByText("Add"));

    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('replaces non-numeric characters with "-"', () => {
    renderFormWithName();
    const input = screen.getByLabelText("Due date");

    fireEvent.changeText(input, "6-15-2026");
    expect(input.props.value).toBe("6-15-2026");

    fireEvent.changeText(input, "6.15.2026");
    expect(input.props.value).toBe("6-15-2026");

    fireEvent.changeText(input, "6 15 2026");
    expect(input.props.value).toBe("6-15-2026");
  });

  it("limits input to DD-DD-DDDD pattern", () => {
    renderFormWithName();
    const input = screen.getByLabelText("Due date");

    fireEvent.changeText(input, "03-28-20261");
    expect(input.props.value).toBe("03-28-2026");
  });

  it("allows no more than 2 hyphens", () => {
    renderFormWithName();
    const input = screen.getByLabelText("Due date");

    fireEvent.changeText(input, "03-28-38-28");
    expect(input.props.value).toBe("03-28-38");
  });

  it("collapses consecutive hyphens into one", () => {
    renderFormWithName();
    const input = screen.getByLabelText("Due date");

    fireEvent.changeText(input, "6---15---2026");
    expect(input.props.value).toBe("6-15-2026");

    fireEvent.changeText(input, "06--15--2026");
    expect(input.props.value).toBe("06-15-2026");
  });

  it('auto-inserts "-" after two-digit month', () => {
    renderFormWithName();
    const input = screen.getByLabelText("Due date");

    // Simulate typing "06" — should become "06-"
    fireEvent.changeText(input, "06");
    expect(input.props.value).toBe("06-");
  });

  it('auto-inserts "-" after two-digit day', () => {
    renderFormWithName();
    const input = screen.getByLabelText("Due date");

    // Simulate typing month then day
    fireEvent.changeText(input, "06-");
    fireEvent.changeText(input, "06-15");
    expect(input.props.value).toBe("06-15-");
  });

  it("normalizes date to MM-DD-YYYY on blur", () => {
    mockGestationalAge(28, 3);
    renderFormWithName();
    const input = screen.getByLabelText("Due date");

    fireEvent.changeText(input, "6-5-26");
    expect(input.props.value).toBe("6-5-26");

    fireEvent(input, "blur");
    expect(input.props.value).toBe("06-05-2026");
  });

  it("resets form after typed date submission", () => {
    mockGestationalAge(28, 3);
    renderFormWithName();

    fireEvent.changeText(screen.getByLabelText("Due date"), "6-15-2026");
    fireEvent.press(screen.getByText("Add"));

    // Name is cleared, so date fields are hidden via progressive disclosure
    expect(screen.getByLabelText("Name").props.value).toBe("");
    expect(screen.queryByLabelText("Due date")).toBeNull();
  });

  it("shows no error when input is empty", () => {
    renderFormWithName();

    expect(screen.queryByLabelText("Date error")).toBeNull();
  });

  it("shows no error for a valid date", () => {
    renderFormWithName();

    fireEvent.changeText(screen.getByLabelText("Due date"), "6-15-2026");

    expect(screen.queryByLabelText("Date error")).toBeNull();
  });

  it("shows format error for incomplete date text after blur", () => {
    renderFormWithName();
    const input = screen.getByLabelText("Due date");

    fireEvent.changeText(input, "6");
    expect(screen.queryByLabelText("Date error")).toBeNull();

    fireEvent(input, "blur");
    expect(screen.getByLabelText("Date error")).toBeTruthy();
    expect(screen.getByText("Enter date as MM-DD-YYYY")).toBeTruthy();
  });

  it("accepts MM-DD input and infers year on blur", () => {
    renderFormWithName();
    const input = screen.getByLabelText("Due date");

    fireEvent.changeText(input, "6-15");
    fireEvent(input, "blur");

    expect(screen.queryByLabelText("Date error")).toBeNull();
    expect(input.props.value).toBe("06-15-2026");
  });

  it("shows error for invalid month after blur", () => {
    renderFormWithName();
    const input = screen.getByLabelText("Due date");

    fireEvent.changeText(input, "13-1-2026");
    fireEvent(input, "blur");

    expect(screen.getByText(/Month must be/)).toBeTruthy();
  });

  it("shows error for invalid day after blur", () => {
    renderFormWithName();
    const input = screen.getByLabelText("Due date");

    fireEvent.changeText(input, "1-32-2026");
    fireEvent(input, "blur");

    expect(screen.getByText(/Day must be/)).toBeTruthy();
  });

  it("shows error for impossible date like Feb 30 after blur", () => {
    renderFormWithName();
    const input = screen.getByLabelText("Due date");

    fireEvent.changeText(input, "2-30-2026");
    fireEvent(input, "blur");

    expect(screen.getByText("02-30 is not a valid date")).toBeTruthy();
  });

  it("clears date error when user starts typing again", () => {
    renderFormWithName();
    const input = screen.getByLabelText("Due date");

    fireEvent.changeText(input, "13-1-2026");
    fireEvent(input, "blur");
    expect(screen.getByLabelText("Date error")).toBeTruthy();

    fireEvent.changeText(input, "1");
    expect(screen.queryByLabelText("Date error")).toBeNull();
  });

  it("shows error immediately when typed date is too far in the future", () => {
    renderFormWithName();
    const input = screen.getByLabelText("Due date");

    // 2 years from now is well beyond 42 weeks
    fireEvent.changeText(input, "03-02-2028");

    // Error should show without needing blur
    expect(screen.getByText(/within the next 42 weeks/)).toBeTruthy();
  });

  it("shows error immediately when typed date is too far in the past", () => {
    renderFormWithName();
    const input = screen.getByLabelText("Due date");

    fireEvent.changeText(input, "01-01-2025");

    // Error should show without needing blur
    expect(screen.getByText(/within the last month/)).toBeTruthy();
  });
});

describe("EntryForm — dueDate in onAdd callback", () => {
  it("passes the entered due date as ISO string in due date mode", () => {
    mockGestationalAge(28, 3);
    const onAdd = renderFormWithName();

    fireEvent.changeText(screen.getByLabelText("Due date"), "6-15-2026");
    fireEvent.press(screen.getByText("Add"));

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ dueDate: "2026-06-15" }),
    );
  });

  it("passes a computed due date as ISO string in weeks/days mode", () => {
    const onAdd = renderInWeeksDaysMode();

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

/** Renders EntryForm in batch mode and returns the onAdd mock. */
function renderBatchForm(onAdd = jest.fn()) {
  return renderForm(onAdd, true);
}

describe("EntryForm — batch mode", () => {
  it("shows batch input when batch prop is true", () => {
    renderBatchForm();

    expect(screen.getByLabelText("Batch entries")).toBeTruthy();
    expect(screen.getByText("Add multiple people")).toBeTruthy();
  });

  it("shows single entry when batch prop is false", () => {
    renderForm();

    expect(screen.getByLabelText("Name")).toBeTruthy();
    expect(screen.queryByLabelText("Batch entries")).toBeNull();
  });

  it("shows help tooltip when help button is pressed", () => {
    renderBatchForm();

    fireEvent.press(screen.getByLabelText("Show format help"));

    expect(screen.getByLabelText("Format help")).toBeTruthy();
  });

  it("hides help tooltip when pressed again", () => {
    renderBatchForm();

    fireEvent.press(screen.getByLabelText("Show format help"));
    fireEvent.press(screen.getByLabelText("Show format help"));

    expect(screen.queryByLabelText("Format help")).toBeNull();
  });

  it("calls onAdd for each valid entry and shows confirmation", () => {
    const onAdd = renderBatchForm();

    fireEvent.changeText(
      screen.getByLabelText("Batch entries"),
      "Alice 6/14, Bob 35w5d",
    );
    fireEvent.press(screen.getByText("Add All"));

    expect(onAdd).toHaveBeenCalledTimes(2);
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Alice" }),
    );
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Bob" }),
    );

    // Confirmation message
    expect(screen.getByLabelText("Added 2 people, Alice, Bob")).toBeTruthy();
  });

  it("clears text after successful batch add", () => {
    renderBatchForm();

    fireEvent.changeText(screen.getByLabelText("Batch entries"), "Alice 6/14");
    fireEvent.press(screen.getByText("Add All"));

    expect(screen.getByLabelText("Batch entries").props.value).toBe("");
  });

  it("shows errors for invalid entries", () => {
    renderBatchForm();

    fireEvent.changeText(
      screen.getByLabelText("Batch entries"),
      "Alice 6/14, Bob",
    );
    fireEvent.press(screen.getByText("Add All"));

    // Error shown for "Bob"
    expect(screen.getByText(/Bob/)).toBeTruthy();
    expect(screen.getByText(/No date or gestational age found/)).toBeTruthy();
  });

  it("keeps errored entries in input when some succeed", () => {
    renderBatchForm();

    fireEvent.changeText(
      screen.getByLabelText("Batch entries"),
      "Alice 6/14, Bob",
    );
    fireEvent.press(screen.getByText("Add All"));

    // Text field now contains only the errored entry
    expect(screen.getByLabelText("Batch entries").props.value).toBe("Bob");
  });

  it("disables Add All when input is empty", () => {
    renderBatchForm();

    const addAll = screen.getByLabelText("Add all");
    expect(addAll.props.accessibilityState.disabled).toBe(true);
  });
});
