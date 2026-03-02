import { useState } from 'react';
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

interface EntryFormProps {
  onAdd: (entry: { name: string; weeks: number; days: number }) => void;
}

/** Form for adding a new gestation entry with name, weeks, and days fields. */
export default function EntryForm({ onAdd }: EntryFormProps) {
  const [name, setName] = useState('');
  const [weeks, setWeeks] = useState('');
  const [days, setDays] = useState('');

  const w = weeks ? parseInt(weeks, 10) : 0;
  const d = days ? parseInt(days, 10) : 0;
  const weeksValid = !weeks || (!isNaN(w) && w >= 0 && w <= 44);
  const daysValid = !days || (!isNaN(d) && d >= 0 && d <= 6);
  const canAdd = !!name.trim() && weeksValid && daysValid;

  const handleAdd = () => {
    if (!canAdd) return;

    onAdd({ name: name.trim(), weeks: w, days: d });

    setName('');
    setWeeks('');
    setDays('');
    Keyboard.dismiss();
  };

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
