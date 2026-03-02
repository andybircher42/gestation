import { render, screen, fireEvent } from '@testing-library/react-native';
import EntryForm from './EntryForm';
import * as gestationalAge from '../gestationalAge';

jest.mock('@react-native-community/datetimepicker', () => {
  const { View, Text } = require('react-native');
  const MockPicker = (props: { onChange?: (event: unknown, date?: Date) => void; value: Date }) => (
    <View testID="date-picker">
      <Text
        testID="date-picker-trigger"
        onPress={() => props.onChange?.({}, new Date(2026, 5, 15))}
      >
        MockDatePicker
      </Text>
    </View>
  );
  MockPicker.displayName = 'MockDateTimePicker';
  return { __esModule: true, default: MockPicker };
});

/** Helper: switch to Weeks & Days mode (Due Date is the default). */
function switchToWeeksDays() {
  fireEvent.press(screen.getByText('Weeks & Days'));
}

describe('EntryForm — Weeks & Days mode', () => {
  it('calls onAdd with trimmed name and parsed weeks/days', () => {
    const onAdd = jest.fn();
    render(<EntryForm onAdd={onAdd} />);
    switchToWeeksDays();

    fireEvent.changeText(screen.getByLabelText('Name'), '  Baby A  ');
    fireEvent.changeText(screen.getByLabelText('Weeks'), '12');
    fireEvent.changeText(screen.getByLabelText('Days'), '3');
    fireEvent.press(screen.getByText('Add'));

    expect(onAdd).toHaveBeenCalledWith({ name: 'Baby A', weeks: 12, days: 3 });
  });

  it('defaults weeks/days to 0 when left empty', () => {
    const onAdd = jest.fn();
    render(<EntryForm onAdd={onAdd} />);
    switchToWeeksDays();

    fireEvent.changeText(screen.getByLabelText('Name'), 'Baby');
    fireEvent.press(screen.getByText('Add'));

    expect(onAdd).toHaveBeenCalledWith({ name: 'Baby', weeks: 0, days: 0 });
  });

  it('clears inputs after submission', () => {
    const onAdd = jest.fn();
    render(<EntryForm onAdd={onAdd} />);
    switchToWeeksDays();

    fireEvent.changeText(screen.getByLabelText('Name'), 'Baby');
    fireEvent.changeText(screen.getByLabelText('Weeks'), '10');
    fireEvent.changeText(screen.getByLabelText('Days'), '5');
    fireEvent.press(screen.getByText('Add'));

    expect(screen.getByLabelText('Name').props.value).toBe('');
    expect(screen.getByLabelText('Weeks').props.value).toBe('');
    expect(screen.getByLabelText('Days').props.value).toBe('');
  });

  it('does not call onAdd when name is empty', () => {
    const onAdd = jest.fn();
    render(<EntryForm onAdd={onAdd} />);
    switchToWeeksDays();

    fireEvent.changeText(screen.getByLabelText('Weeks'), '10');
    fireEvent.changeText(screen.getByLabelText('Days'), '3');
    fireEvent.press(screen.getByText('Add'));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it('does not call onAdd when weeks > 44', () => {
    const onAdd = jest.fn();
    render(<EntryForm onAdd={onAdd} />);
    switchToWeeksDays();

    fireEvent.changeText(screen.getByLabelText('Name'), 'Baby');
    fireEvent.changeText(screen.getByLabelText('Weeks'), '45');
    fireEvent.changeText(screen.getByLabelText('Days'), '0');
    fireEvent.press(screen.getByText('Add'));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it('does not call onAdd when days > 6', () => {
    const onAdd = jest.fn();
    render(<EntryForm onAdd={onAdd} />);
    switchToWeeksDays();

    fireEvent.changeText(screen.getByLabelText('Name'), 'Baby');
    fireEvent.changeText(screen.getByLabelText('Weeks'), '10');
    fireEvent.changeText(screen.getByLabelText('Days'), '7');
    fireEvent.press(screen.getByText('Add'));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it('shows range hints as placeholder text', () => {
    render(<EntryForm onAdd={jest.fn()} />);
    switchToWeeksDays();

    expect(screen.getByPlaceholderText('0-42 weeks')).toBeTruthy();
    expect(screen.getByPlaceholderText('0-6 days')).toBeTruthy();
  });

  it('rejects non-numeric input in weeks and days fields', () => {
    render(<EntryForm onAdd={jest.fn()} />);
    switchToWeeksDays();

    fireEvent.changeText(screen.getByLabelText('Weeks'), 'abc');
    expect(screen.getByLabelText('Weeks').props.value).toBe('');

    fireEvent.changeText(screen.getByLabelText('Days'), '2x');
    expect(screen.getByLabelText('Days').props.value).toBe('');

    fireEvent.changeText(screen.getByLabelText('Weeks'), '12');
    expect(screen.getByLabelText('Weeks').props.value).toBe('12');

    fireEvent.changeText(screen.getByLabelText('Days'), '3');
    expect(screen.getByLabelText('Days').props.value).toBe('3');
  });

  it('disables Add button when weeks is out of range', () => {
    const onAdd = jest.fn();
    render(<EntryForm onAdd={onAdd} />);
    switchToWeeksDays();

    fireEvent.changeText(screen.getByLabelText('Name'), 'Baby');
    fireEvent.changeText(screen.getByLabelText('Weeks'), '45');
    fireEvent.press(screen.getByText('Add'));
    expect(onAdd).not.toHaveBeenCalled();

    fireEvent.changeText(screen.getByLabelText('Weeks'), '42');
    fireEvent.press(screen.getByText('Add'));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('disables Add button when days is out of range', () => {
    const onAdd = jest.fn();
    render(<EntryForm onAdd={onAdd} />);
    switchToWeeksDays();

    fireEvent.changeText(screen.getByLabelText('Name'), 'Baby');
    fireEvent.changeText(screen.getByLabelText('Days'), '7');
    fireEvent.press(screen.getByText('Add'));
    expect(onAdd).not.toHaveBeenCalled();

    fireEvent.changeText(screen.getByLabelText('Days'), '6');
    fireEvent.press(screen.getByText('Add'));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('Add button is disabled when name is empty and enabled when name is entered', () => {
    const onAdd = jest.fn();
    render(<EntryForm onAdd={onAdd} />);
    switchToWeeksDays();

    // Button should not fire when name is empty (disabled)
    fireEvent.press(screen.getByText('Add'));
    expect(onAdd).not.toHaveBeenCalled();

    // After entering a name, the button should work (enabled)
    fireEvent.changeText(screen.getByLabelText('Name'), 'Baby');
    fireEvent.press(screen.getByText('Add'));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });
});

describe('EntryForm — mode toggle', () => {
  it('starts in Due Date mode by default', () => {
    render(<EntryForm onAdd={jest.fn()} />);

    expect(screen.getByLabelText('Select due date')).toBeTruthy();
    expect(screen.queryByLabelText('Weeks')).toBeNull();
    expect(screen.queryByLabelText('Days')).toBeNull();
  });

  it('switches to Weeks & Days mode when toggle is pressed', () => {
    render(<EntryForm onAdd={jest.fn()} />);

    fireEvent.press(screen.getByText('Weeks & Days'));

    expect(screen.getByLabelText('Weeks')).toBeTruthy();
    expect(screen.getByLabelText('Days')).toBeTruthy();
    expect(screen.queryByLabelText('Select due date')).toBeNull();
  });

  it('switches back to Due Date mode', () => {
    render(<EntryForm onAdd={jest.fn()} />);

    fireEvent.press(screen.getByText('Weeks & Days'));
    fireEvent.press(screen.getByText('Due Date'));

    expect(screen.getByLabelText('Select due date')).toBeTruthy();
    expect(screen.queryByLabelText('Weeks')).toBeNull();
    expect(screen.queryByLabelText('Days')).toBeNull();
  });
});

describe('EntryForm — Due Date mode', () => {
  it('shows date picker when button is pressed', () => {
    render(<EntryForm onAdd={jest.fn()} />);

    fireEvent.press(screen.getByLabelText('Select due date'));

    expect(screen.getByTestId('date-picker')).toBeTruthy();
  });

  it('shows computed gestational age preview after selecting a date', () => {
    jest.spyOn(gestationalAge, 'computeGestationalAge').mockReturnValue({ weeks: 32, days: 4 });

    render(<EntryForm onAdd={jest.fn()} />);
    fireEvent.press(screen.getByLabelText('Select due date'));

    // Trigger mock date selection
    fireEvent.press(screen.getByTestId('date-picker-trigger'));

    expect(screen.getByText('= 32w 4d')).toBeTruthy();

    jest.restoreAllMocks();
  });

  it('submits computed weeks/days when Add is pressed in Due Date mode', () => {
    jest.spyOn(gestationalAge, 'computeGestationalAge').mockReturnValue({ weeks: 35, days: 2 });

    const onAdd = jest.fn();
    render(<EntryForm onAdd={onAdd} />);

    fireEvent.changeText(screen.getByLabelText('Name'), 'Baby B');
    fireEvent.press(screen.getByLabelText('Select due date'));
    fireEvent.press(screen.getByTestId('date-picker-trigger'));
    fireEvent.press(screen.getByText('Add'));

    expect(onAdd).toHaveBeenCalledWith({ name: 'Baby B', weeks: 35, days: 2 });

    jest.restoreAllMocks();
  });

  it('disables Add button when no due date is selected', () => {
    const onAdd = jest.fn();
    render(<EntryForm onAdd={onAdd} />);

    fireEvent.changeText(screen.getByLabelText('Name'), 'Baby');
    fireEvent.press(screen.getByText('Add'));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it('displays the selected date on the button', () => {
    render(<EntryForm onAdd={jest.fn()} />);
    fireEvent.press(screen.getByLabelText('Select due date'));
    fireEvent.press(screen.getByTestId('date-picker-trigger'));

    // Mock picker returns June 15, 2026
    expect(screen.getByText('6/15/2026')).toBeTruthy();
  });

  it('clears due date after submission', () => {
    jest.spyOn(gestationalAge, 'computeGestationalAge').mockReturnValue({ weeks: 30, days: 0 });

    const onAdd = jest.fn();
    render(<EntryForm onAdd={onAdd} />);

    fireEvent.changeText(screen.getByLabelText('Name'), 'Baby');
    fireEvent.press(screen.getByLabelText('Select due date'));
    fireEvent.press(screen.getByTestId('date-picker-trigger'));
    fireEvent.press(screen.getByText('Add'));

    expect(screen.getByText('Select due date')).toBeTruthy();
    expect(screen.queryByLabelText('Gestational age preview')).toBeNull();

    jest.restoreAllMocks();
  });
});
