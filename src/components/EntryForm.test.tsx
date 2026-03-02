import { render, screen, fireEvent } from '@testing-library/react-native';
import EntryForm from './EntryForm';

describe('EntryForm', () => {
  it('calls onAdd with trimmed name and parsed weeks/days', () => {
    const onAdd = jest.fn();
    render(<EntryForm onAdd={onAdd} />);

    fireEvent.changeText(screen.getByLabelText('Name'), '  Baby A  ');
    fireEvent.changeText(screen.getByLabelText('Weeks'), '12');
    fireEvent.changeText(screen.getByLabelText('Days'), '3');
    fireEvent.press(screen.getByText('Add'));

    expect(onAdd).toHaveBeenCalledWith({ name: 'Baby A', weeks: 12, days: 3 });
  });

  it('defaults weeks/days to 0 when left empty', () => {
    const onAdd = jest.fn();
    render(<EntryForm onAdd={onAdd} />);

    fireEvent.changeText(screen.getByLabelText('Name'), 'Baby');
    fireEvent.press(screen.getByText('Add'));

    expect(onAdd).toHaveBeenCalledWith({ name: 'Baby', weeks: 0, days: 0 });
  });

  it('clears inputs after submission', () => {
    const onAdd = jest.fn();
    render(<EntryForm onAdd={onAdd} />);

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

    fireEvent.changeText(screen.getByLabelText('Weeks'), '10');
    fireEvent.changeText(screen.getByLabelText('Days'), '3');
    fireEvent.press(screen.getByText('Add'));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it('does not call onAdd when weeks > 44', () => {
    const onAdd = jest.fn();
    render(<EntryForm onAdd={onAdd} />);

    fireEvent.changeText(screen.getByLabelText('Name'), 'Baby');
    fireEvent.changeText(screen.getByLabelText('Weeks'), '45');
    fireEvent.changeText(screen.getByLabelText('Days'), '0');
    fireEvent.press(screen.getByText('Add'));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it('does not call onAdd when days > 6', () => {
    const onAdd = jest.fn();
    render(<EntryForm onAdd={onAdd} />);

    fireEvent.changeText(screen.getByLabelText('Name'), 'Baby');
    fireEvent.changeText(screen.getByLabelText('Weeks'), '10');
    fireEvent.changeText(screen.getByLabelText('Days'), '7');
    fireEvent.press(screen.getByText('Add'));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it('shows range hints as placeholder text', () => {
    render(<EntryForm onAdd={jest.fn()} />);

    expect(screen.getByPlaceholderText('0-42 weeks')).toBeTruthy();
    expect(screen.getByPlaceholderText('0-6 days')).toBeTruthy();
  });

  it('Add button is disabled when name is empty and enabled when name is entered', () => {
    const onAdd = jest.fn();
    render(<EntryForm onAdd={onAdd} />);

    // Button should not fire when name is empty (disabled)
    fireEvent.press(screen.getByText('Add'));
    expect(onAdd).not.toHaveBeenCalled();

    // After entering a name, the button should work (enabled)
    fireEvent.changeText(screen.getByLabelText('Name'), 'Baby');
    fireEvent.press(screen.getByText('Add'));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });
});
