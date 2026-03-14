import { fireEvent, screen } from "@testing-library/react-native";

import renderWithTheme from "@/test/renderWithTheme";
import { computeDueDate, toDisplayDateString } from "@/util";

import EntryForm from "./EntryForm";

beforeEach(() => {
  jest.useFakeTimers({ now: new Date(2026, 2, 2) });
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

const INPUT_LABEL = "Due date or gestational age";

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

/** Simulates selecting a date from the calendar picker. */
function pickDate() {
  fireEvent.press(screen.getByLabelText("Select due date"));
  fireEvent.press(screen.getByTestId("date-picker-trigger"));
}

/** Returns the unified input element. */
function getInput() {
  return screen.getByLabelText(INPUT_LABEL);
}

describe("EntryForm — gestational age input", () => {
  it("calls onAdd with trimmed name and computed dueDate from gestational age", () => {
    const onAdd = renderFormWithName();

    fireEvent.changeText(screen.getByLabelText("Name"), "  Sam  ");
    fireEvent.changeText(getInput(), "12w3d");
    fireEvent.press(screen.getByText("Add"));

    const expectedDueDate = computeDueDate(12, 3, new Date(2026, 2, 2));
    const expectedDateStr = `${expectedDueDate.getFullYear()}-${String(expectedDueDate.getMonth() + 1).padStart(2, "0")}-${String(expectedDueDate.getDate()).padStart(2, "0")}`;
    expect(onAdd).toHaveBeenCalledWith({
      name: "Sam",
      dueDate: expectedDateStr,
    });
  });

  it("does not call onAdd with empty input", () => {
    const onAdd = renderFormWithName();

    fireEvent.changeText(screen.getByLabelText("Name"), "Baby");
    fireEvent.press(screen.getByText("Add"));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("resets form after submission and shows confirmation", () => {
    renderFormWithName();

    fireEvent.changeText(getInput(), "10w5d");
    fireEvent.press(screen.getByText("Add"));

    // Name is cleared, so date fields are hidden via progressive disclosure
    expect(screen.getByLabelText("Name").props.value).toBe("");
    expect(screen.queryByLabelText(INPUT_LABEL)).toBeNull();
    // Shows confirmation with gestational age
    expect(screen.getByLabelText("Added Baby, 10w 5d")).toBeTruthy();
  });

  it("does not call onAdd when name is only whitespace", () => {
    const onAdd = renderFormWithName();

    fireEvent.changeText(screen.getByLabelText("Name"), "   ");
    // Date fields hidden because trimmed name is empty
    expect(screen.queryByLabelText(INPUT_LABEL)).toBeNull();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("does not call onAdd when weeks > 42", () => {
    const onAdd = renderFormWithName();

    fireEvent.changeText(screen.getByLabelText("Name"), "Baby");
    fireEvent.changeText(getInput(), "45w0d");
    fireEvent.press(screen.getByText("Add"));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("does not call onAdd when days > 6", () => {
    const onAdd = renderFormWithName();

    fireEvent.changeText(screen.getByLabelText("Name"), "Baby");
    fireEvent.changeText(getInput(), "10w7d");
    fireEvent.press(screen.getByText("Add"));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("accepts gestational age with spaces", () => {
    const onAdd = renderFormWithName();

    fireEvent.changeText(getInput(), "35w 5d");
    fireEvent.press(screen.getByText("Add"));

    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("accepts gestational age without spaces", () => {
    const onAdd = renderFormWithName();

    fireEvent.changeText(getInput(), "35w5d");
    fireEvent.press(screen.getByText("Add"));

    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("shows calculated due date and gestational age for valid input", () => {
    renderFormWithName();

    fireEvent.changeText(getInput(), "20w0d");

    expect(screen.getByText("Calculated:")).toBeTruthy();
    const expectedDueDate = computeDueDate(20, 0, new Date(2026, 2, 2));
    expect(
      screen.getByText(
        new RegExp(`${toDisplayDateString(expectedDueDate)}.*20w 0d`),
      ),
    ).toBeTruthy();
  });

  it("shows error immediately for out-of-range weeks", () => {
    renderFormWithName();

    fireEvent.changeText(getInput(), "45w0d");

    expect(screen.getByText(/Weeks must be/)).toBeTruthy();
  });

  it("shows error immediately for out-of-range days", () => {
    renderFormWithName();

    fireEvent.changeText(getInput(), "10w7d");

    expect(screen.getByText(/Days must be/)).toBeTruthy();
  });
});

describe("EntryForm — progressive disclosure", () => {
  it("hides date fields until a name is entered", () => {
    renderForm();

    expect(screen.queryByLabelText(INPUT_LABEL)).toBeNull();

    typeName("Baby");

    expect(screen.getByLabelText(INPUT_LABEL)).toBeTruthy();
  });

  it("hides date fields when name is cleared", () => {
    renderForm();

    typeName("Baby");
    expect(screen.getByLabelText(INPUT_LABEL)).toBeTruthy();

    fireEvent.changeText(screen.getByLabelText("Name"), "");
    expect(screen.queryByLabelText(INPUT_LABEL)).toBeNull();
  });

  it("shows placeholder text on name input", () => {
    renderForm();

    expect(screen.getByPlaceholderText("Who are you tracking?")).toBeTruthy();
  });
});

describe("EntryForm — unified input", () => {
  it("shows placeholder with both formats", () => {
    renderFormWithName();

    expect(screen.getByPlaceholderText("35w5d or 06-15-2026")).toBeTruthy();
  });

  it("shows calendar picker and unified input", () => {
    renderFormWithName();

    expect(screen.getByLabelText(INPUT_LABEL)).toBeTruthy();
    expect(screen.getByLabelText("Select due date")).toBeTruthy();
  });

  it("shows date picker when calendar button is pressed", () => {
    renderFormWithName();

    fireEvent.press(screen.getByLabelText("Select due date"));

    expect(screen.getByTestId("date-picker")).toBeTruthy();
  });

  it("shows calculated values after selecting a date from picker", () => {
    renderFormWithName();
    pickDate();

    expect(screen.getByText("Calculated:")).toBeTruthy();
    expect(screen.getByText(/\d+w \d+d/)).toBeTruthy();
  });

  it("submits dueDate when Add is pressed with a date", () => {
    const onAdd = renderFormWithName();

    fireEvent.changeText(screen.getByLabelText("Name"), "Alex");
    fireEvent.changeText(getInput(), "6-15-2026");
    fireEvent.press(screen.getByText("Add"));

    expect(onAdd).toHaveBeenCalledWith({
      name: "Alex",
      dueDate: "2026-06-15",
    });
  });

  it("disables Add button when no input is provided", () => {
    const onAdd = renderFormWithName();

    fireEvent.press(screen.getByText("Add"));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("displays the selected date in the text input after picker", () => {
    renderFormWithName();
    pickDate();

    // Mock picker returns June 15, 2026
    expect(getInput().props.value).toBe("06-15-2026");
  });

  it("resets form after submission (name cleared, fields hidden)", () => {
    renderFormWithName();

    pickDate();
    fireEvent.press(screen.getByText("Add"));

    expect(screen.getByLabelText("Name").props.value).toBe("");
    expect(screen.queryByLabelText(INPUT_LABEL)).toBeNull();
  });
});

describe("EntryForm — date input", () => {
  it("typing a valid date shows calculated values", () => {
    renderFormWithName();

    fireEvent.changeText(getInput(), "6-15-2026");

    expect(screen.getByText("Calculated:")).toBeTruthy();
    expect(screen.getByText(/06-15-2026.*\d+w \d+d/)).toBeTruthy();
  });

  it("typing an invalid month does not enable Add button", () => {
    const onAdd = renderFormWithName();

    fireEvent.changeText(getInput(), "13-1-2026");
    fireEvent.press(screen.getByText("Add"));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("typing non-date text does not enable Add button", () => {
    const onAdd = renderFormWithName();

    fireEvent.changeText(getInput(), "abc");
    fireEvent.press(screen.getByText("Add"));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("typing an invalid day (Feb 30) does not enable Add button", () => {
    const onAdd = renderFormWithName();

    fireEvent.changeText(getInput(), "2-30-2026");
    fireEvent.press(screen.getByText("Add"));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("picking from calendar populates the text input", () => {
    renderFormWithName();

    pickDate();

    expect(getInput().props.value).toBe("06-15-2026");
  });

  it("accepts a 2-digit year as 20xx", () => {
    const onAdd = renderFormWithName();

    fireEvent.changeText(getInput(), "6-15-26");
    fireEvent.press(screen.getByText("Add"));

    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("accepts single-digit month and day", () => {
    const onAdd = renderFormWithName();

    fireEvent.changeText(getInput(), "3-5-2026");
    fireEvent.press(screen.getByText("Add"));

    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("accepts slash-separated dates", () => {
    const onAdd = renderFormWithName();

    fireEvent.changeText(getInput(), "6/15/2026");
    fireEvent.press(screen.getByText("Add"));

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ dueDate: "2026-06-15" }),
    );
  });

  it("accepts date without year and infers it", () => {
    const onAdd = renderFormWithName();

    fireEvent.changeText(getInput(), "6/15");
    fireEvent.press(screen.getByText("Add"));

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ dueDate: "2026-06-15" }),
    );
  });

  it("resets form after typed date submission", () => {
    renderFormWithName();

    fireEvent.changeText(getInput(), "6-15-2026");
    fireEvent.press(screen.getByText("Add"));

    expect(screen.getByLabelText("Name").props.value).toBe("");
    expect(screen.queryByLabelText(INPUT_LABEL)).toBeNull();
  });

  it("shows no error when input is empty", () => {
    renderFormWithName();

    expect(screen.queryByLabelText("Input error")).toBeNull();
  });

  it("shows no error for a valid date", () => {
    renderFormWithName();

    fireEvent.changeText(getInput(), "6-15-2026");

    expect(screen.queryByLabelText("Input error")).toBeNull();
  });

  it("shows error for invalid month after blur", () => {
    renderFormWithName();

    fireEvent.changeText(getInput(), "13-1-2026");
    fireEvent(getInput(), "blur");

    expect(screen.getByText(/Month must be/)).toBeTruthy();
  });

  it("shows error for invalid day after blur", () => {
    renderFormWithName();

    fireEvent.changeText(getInput(), "1-32-2026");
    fireEvent(getInput(), "blur");

    expect(screen.getByText(/Day must be/)).toBeTruthy();
  });

  it("shows error for impossible date like Feb 30 after blur", () => {
    renderFormWithName();

    fireEvent.changeText(getInput(), "2-30-2026");
    fireEvent(getInput(), "blur");

    expect(screen.getByText(/not a valid date/)).toBeTruthy();
  });

  it("clears error when user starts typing again", () => {
    renderFormWithName();

    fireEvent.changeText(getInput(), "13-1-2026");
    fireEvent(getInput(), "blur");
    expect(screen.getByLabelText("Input error")).toBeTruthy();

    fireEvent.changeText(getInput(), "6-15-2026");
    expect(screen.queryByLabelText("Input error")).toBeNull();
  });

  it("shows error immediately when typed date is too far in the future", () => {
    renderFormWithName();

    // 2 years from now is well beyond 42 weeks
    fireEvent.changeText(getInput(), "03-02-2028");

    expect(screen.getByText(/within the next 42 weeks/)).toBeTruthy();
  });

  it("shows error immediately when typed date is too far in the past", () => {
    renderFormWithName();

    fireEvent.changeText(getInput(), "01-01-2025");

    expect(screen.getByText(/within the last month/)).toBeTruthy();
  });
});

describe("EntryForm — dueDate in onAdd callback", () => {
  it("passes the entered due date as ISO string for date input", () => {
    const onAdd = renderFormWithName();

    fireEvent.changeText(getInput(), "6-15-2026");
    fireEvent.press(screen.getByText("Add"));

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ dueDate: "2026-06-15" }),
    );
  });

  it("passes a computed due date as ISO string for gestational age input", () => {
    const onAdd = renderFormWithName();

    fireEvent.changeText(getInput(), "20w0d");
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

  it("renders help button for batch format info", () => {
    renderBatchForm();

    expect(screen.getByLabelText("Batch format info")).toBeTruthy();
  });

  it("calls onAdd for each valid entry and shows confirmation", () => {
    const onAdd = renderBatchForm();

    fireEvent.changeText(
      screen.getByLabelText("Batch entries"),
      "Sam 6/14, Alex 35w5d",
    );
    fireEvent.press(screen.getByText("Add All"));

    expect(onAdd).toHaveBeenCalledTimes(2);
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Sam" }),
    );
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Alex" }),
    );

    // Confirmation message
    expect(screen.getByLabelText("Added 2 people, Sam, Alex")).toBeTruthy();
  });

  it("clears text after successful batch add", () => {
    renderBatchForm();

    fireEvent.changeText(screen.getByLabelText("Batch entries"), "Sam 6/14");
    fireEvent.press(screen.getByText("Add All"));

    expect(screen.getByLabelText("Batch entries").props.value).toBe("");
  });

  it("shows errors for invalid entries", () => {
    renderBatchForm();

    fireEvent.changeText(
      screen.getByLabelText("Batch entries"),
      "Sam 6/14, Alex",
    );
    fireEvent.press(screen.getByText("Add All"));

    // Error shown for "Alex"
    expect(screen.getByText(/Alex/)).toBeTruthy();
    expect(
      screen.getByText(/Couldn\u2019t find a date or gestational age/),
    ).toBeTruthy();
  });

  it("keeps errored entries in input when some succeed", () => {
    renderBatchForm();

    fireEvent.changeText(
      screen.getByLabelText("Batch entries"),
      "Sam 6/14, Alex",
    );
    fireEvent.press(screen.getByText("Add All"));

    // Text field now contains only the errored entry
    expect(screen.getByLabelText("Batch entries").props.value).toBe("Alex");
  });

  it("disables Add All when input is empty", () => {
    renderBatchForm();

    const addAll = screen.getByLabelText("Add all");
    expect(addAll.props.accessibilityState.disabled).toBe(true);
  });
});
