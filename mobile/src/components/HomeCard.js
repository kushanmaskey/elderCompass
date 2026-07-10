import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function HomeCard({ home, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={2}>{home.name}</Text>
        {home.rating != null && (
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>★ {home.rating}</Text>
          </View>
        )}
      </View>

      <Text style={styles.address}>
        {home.address}, {home.city}, {home.state} {home.zipcode}
      </Text>

      {!!home.description && (
        <Text style={styles.description} numberOfLines={2}>{home.description}</Text>
      )}

      <View style={styles.footer}>
        {home.capacity != null && (
          <Text style={styles.capacity}>Capacity: {home.capacity}</Text>
        )}
        <Text style={styles.cta}>View details →</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 8,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  ratingBadge: {
    backgroundColor: '#fef9c3',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  ratingText: { fontSize: 13, fontWeight: '700', color: '#854d0e' },
  address: { fontSize: 13, color: '#6b7280', marginBottom: 8 },
  description: { fontSize: 13, color: '#374151', lineHeight: 19, marginBottom: 10 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  capacity: { fontSize: 12, color: '#6b7280' },
  cta: { fontSize: 13, fontWeight: '600', color: '#2e7d5e' },
});
