import { useState } from 'react';
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { computeGestationalAge } from '../gestationalAge';

type InputMode = 'weeksDays' | 'dueDate';

interface EntryFormProps {
  onAdd: (entry: { name: string; weeks: number; days: number }) => void;
}

/** Form for adding a new gestation entry with name, weeks, and days fields. */
export default function EntryForm({ onAdd }: EntryFormProps) {
  const [name, setName] = useState('');
  const [weeks, setWeeks] = useState('');
  const [days, setDays] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [dateText, setDateText] = useState('');
  const [mode, setMode] = useState<InputMode>('dueDate');
  const [showPicker, setShowPicker] = useState(false);

  const w = weeks ? parseInt(weeks, 10) : 0;
  const d = days ? parseInt(days, 10) : 0;
  const weeksValid = !weeks || (!isNaN(w) && w >= 0 && w <= 44);
  const daysValid = !days || (!isNaN(d) && d >= 0 && d <= 6);

  const computed = dueDate ? computeGestationalAge(dueDate) : null;

  const canAdd =
    !!name.trim() &&
    (mode === 'weeksDays'
      ? weeksValid && daysValid
      : dueDate !== null);

  const parseDateText = (text: string): Date | null => {
    const match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!match) return null;
    const month = parseInt(match[1], 10);
    const day = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    if (month < 1 || month > 12) return null;
    if (day < 1 || day > 31) return null;
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return null;
    }
    return date;
  };

  const handleDateTextChange = (text: string) => {
    setDateText(text);
    setDueDate(parseDateText(text));
  };

  const handleAdd = () => {
    if (!canAdd) return;

    if (mode === 'weeksDays') {
      onAdd({ name: name.trim(), weeks: w, days: d });
    } else {
      onAdd({ name: name.trim(), weeks: computed!.weeks, days: computed!.days });
    }

    setName('');
    setWeeks('');
    setDays('');
    setDueDate(null);
    setDateText('');
    Keyboard.dismiss();
  };

  const handleDateChange = (_event: DateTimePickerEvent, selected?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selected) {
      setDueDate(selected);
      setDateText(formatDate(selected));
    }
  };

  const formatDate = (date: Date) =>
    `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

  return (
    <View style={styles.form}>
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.nameInput}
        placeholder={"First Name"}
        accessibilityLabel="Name"
        value={name}
        onChangeText={setName}
        returnKeyType="next"
      />

      {/* Mode toggle */}
      <View style={styles.toggleRow}>
        <Pressable
            style={[
              styles.toggleButton,
              mode === 'dueDate' && styles.toggleButtonActive,
            ]}
            onPress={() => setMode('dueDate')}
            accessibilityRole="button"
        >
          <Text
              style={[
                styles.toggleText,
                mode === 'dueDate' && styles.toggleTextActive,
              ]}
          >
            Due Date
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.toggleButton,
            mode === 'weeksDays' && styles.toggleButtonActive,
          ]}
          onPress={() => setMode('weeksDays')}
          accessibilityRole="button"
        >
          <Text
            style={[
              styles.toggleText,
              mode === 'weeksDays' && styles.toggleTextActive,
            ]}
          >
            Weeks & Days
          </Text>
        </Pressable>
      </View>

      {mode === 'weeksDays' ? (
        <View style={styles.ageRow}>
          <View style={styles.inputWithHint}>
            <Text style={styles.label}>Weeks</Text>
            <TextInput
              style={styles.numberInput}
              accessibilityLabel="Weeks"
              placeholder={"0-42 weeks"}
              value={weeks}
              onChangeText={(text) => { if (/^\d*$/.test(text)) setWeeks(text); }}
              keyboardType="number-pad"
              maxLength={2}
              returnKeyType="next"
            />
          </View>
          <View style={styles.inputWithHint}>
            <Text style={styles.label}>Days</Text>
            <TextInput
              style={styles.numberInput}
              accessibilityLabel="Days"
              placeholder={"0-6 days"}
              value={days}
              onChangeText={(text) => { if (/^\d*$/.test(text)) setDays(text); }}
              keyboardType="number-pad"
              maxLength={1}
              returnKeyType="done"
            />
          </View>
          <Pressable
            style={[styles.addButton, !canAdd && styles.addButtonDisabled]}
            onPress={handleAdd}
            disabled={!canAdd}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </Pressable>
        </View>
      ) : (
        <View>
          <View style={styles.ageRow}>
            <View style={styles.inputWithHint}>
              <Text style={styles.label}>Due Date</Text>
              <View style={styles.dateInputRow}>
                <TextInput
                  style={styles.dateTextInput}
                  accessibilityLabel="Due date"
                  placeholder="M/D/YYYY"
                  value={dateText}
                  onChangeText={handleDateTextChange}
                />
                <Pressable
                  style={styles.calendarButton}
                  onPress={() => setShowPicker(true)}
                  accessibilityLabel="Select due date"
                >
                  <Text style={styles.calendarButtonText}>📅</Text>
                </Pressable>
              </View>
            </View>
            <Pressable
              style={[styles.addButton, !canAdd && styles.addButtonDisabled]}
              onPress={handleAdd}
              disabled={!canAdd}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </Pressable>
          </View>
          {computed && (
            <Text style={styles.preview} accessibilityLabel="Gestational age preview">
              = {computed.weeks}w {computed.days}d
            </Text>
          )}
          {showPicker && (
            <DateTimePicker
              value={dueDate ?? new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: '#fafafa',
  },
  toggleRow: {
    flexDirection: 'row',
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4a90d9',
    overflow: 'hidden',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  toggleButtonActive: {
    backgroundColor: '#4a90d9',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a90d9',
  },
  toggleTextActive: {
    color: '#fff',
  },
  ageRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputWithHint: {
    flex: 1,
  },
  numberInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  dateInputRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dateTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  calendarButton: {
    borderWidth: 1,
    borderColor: '#4a90d9',
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  calendarButtonText: {
    fontSize: 22,
  },
  preview: {
    marginTop: 8,
    fontSize: 15,
    color: '#4a90d9',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#4a90d9',
    borderRadius: 8,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#a0c4e8',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
