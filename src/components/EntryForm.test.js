import { render, screen, fireEvent } from '@testing-library/react-native';
import EntryForm from './EntryForm';

describe('EntryForm', () => {
  it('calls onAdd with trimmed name and parsed weeks/days', () => {
    const onAdd = jest.fn();
    render(<EntryForm onAdd={onAdd} />);

    fireEvent.changeText(screen.getByPlaceholderText('Name'), '  Baby A  ');
    fireEvent.changeText(screen.getByPlaceholderText('Weeks'), '12');
    fireEvent.changeText(screen.getByPlaceholderText('Days'), '3');
    fireEvent.press(screen.getByText('Add'));

    expect(onAdd).toHaveBeenCalledWith({ name: 'Baby A', weeks: 12, days: 3 });
  });

  it('defaults weeks/days to 0 when left empty', () => {
    const onAdd = jest.fn();
    render(<EntryForm onAdd={onAdd} />);

    fireEvent.changeText(screen.getByPlaceholderText('Name'), 'Baby');
    fireEvent.press(screen.getByText('Add'));

    expect(onAdd).toHaveBeenCalledWith({ name: 'Baby', weeks: 0, days: 0 });
  });

  it('clears inputs after submission', () => {
    const onAdd = jest.fn();
    render(<EntryForm onAdd={onAdd} />);

    fireEvent.changeText(screen.getByPlaceholderText('Name'), 'Baby');
    fireEvent.changeText(screen.getByPlaceholderText('Weeks'), '10');
    fireEvent.changeText(screen.getByPlaceholderText('Days'), '5');
    fireEvent.press(screen.getByText('Add'));

    expect(screen.getByPlaceholderText('Name').props.value).toBe('');
    expect(screen.getByPlaceholderText('Weeks').props.value).toBe('');
    expect(screen.getByPlaceholderText('Days').props.value).toBe('');
  });

  it('does not call onAdd when name is empty', () => {
    const onAdd = jest.fn();
    render(<EntryForm onAdd={onAdd} />);

    fireEvent.changeText(screen.getByPlaceholderText('Weeks'), '10');
    fireEvent.changeText(screen.getByPlaceholderText('Days'), '3');
    fireEvent.press(screen.getByText('Add'));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it('does not call onAdd when weeks > 42', () => {
    const onAdd = jest.fn();
    render(<EntryForm onAdd={onAdd} />);

    fireEvent.changeText(screen.getByPlaceholderText('Name'), 'Baby');
    fireEvent.changeText(screen.getByPlaceholderText('Weeks'), '43');
    fireEvent.changeText(screen.getByPlaceholderText('Days'), '0');
    fireEvent.press(screen.getByText('Add'));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it('does not call onAdd when days > 6', () => {
    const onAdd = jest.fn();
    render(<EntryForm onAdd={onAdd} />);

    fireEvent.changeText(screen.getByPlaceholderText('Name'), 'Baby');
    fireEvent.changeText(screen.getByPlaceholderText('Weeks'), '10');
    fireEvent.changeText(screen.getByPlaceholderText('Days'), '7');
    fireEvent.press(screen.getByText('Add'));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it('Add button is disabled when name is empty and enabled when name is entered', () => {
    const onAdd = jest.fn();
    render(<EntryForm onAdd={onAdd} />);

    // Button should not fire when name is empty (disabled)
    fireEvent.press(screen.getByText('Add'));
    expect(onAdd).not.toHaveBeenCalled();

    // After entering a name, the button should work (enabled)
    fireEvent.changeText(screen.getByPlaceholderText('Name'), 'Baby');
    fireEvent.press(screen.getByText('Add'));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });
});
