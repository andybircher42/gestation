import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Entry } from '../storage';

interface EntryRowProps {
  item: Entry;
  onDelete: (id: string) => void;
}

interface EntryListProps {
  entries: Entry[];
  onDelete: (id: string) => void;
}

function EntryRow({ item, onDelete }: EntryRowProps) {
  return (
    <View style={styles.entry}>
      <View style={styles.entryInfo}>
        <Text style={styles.entryName}>{item.name}</Text>
        <Text style={styles.entryAge}>
          {item.weeks} week{item.weeks !== 1 ? 's' : ''}, {item.days} day
          {item.days !== 1 ? 's' : ''}
        </Text>
      </View>
      <Pressable
        onPress={() => onDelete(item.id)}
        style={styles.deleteButton}
        hitSlop={8}
      >
        <Text style={styles.deleteText}>✕</Text>
      </Pressable>
    </View>
  );
}

/** Scrollable list of gestation entries with swipe-to-delete support. */
export default function EntryList({ entries, onDelete }: EntryListProps) {
  return (
    <FlatList
      data={entries}
      renderItem={({ item }) => <EntryRow item={item} onDelete={onDelete} />}
      keyExtractor={(item) => item.id}
      style={styles.list}
      contentContainerStyle={entries.length === 0 ? styles.emptyList : undefined}
      ListEmptyComponent={
        <Text style={styles.emptyText}>No entries yet</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  entryInfo: {
    flex: 1,
  },
  entryName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  entryAge: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
  },
});
