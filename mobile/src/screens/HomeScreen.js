import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator,
  Platform, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { searchByZipcode, searchByCityState } from '../api/homes';
import HomeCard from '../components/HomeCard';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
];

export default function HomeScreen({ navigation }) {
  const [mode, setMode] = useState('zipcode');
  const [zipcode, setZipcode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function validate() {
    if (mode === 'zipcode') {
      if (!/^\d{5}(-\d{4})?$/.test(zipcode)) {
        setError('Enter a valid 5-digit ZIP code.');
        return false;
      }
    } else {
      if (!city.trim()) { setError('Please enter a city.'); return false; }
      if (!state) { setError('Please select a state.'); return false; }
    }
    setError('');
    return true;
  }

  async function handleSearch() {
    if (!validate()) return;
    setLoading(true);
    setResults(null);
    try {
      let res;
      if (mode === 'zipcode') {
        res = await searchByZipcode(zipcode);
      } else {
        res = await searchByCityState(city.trim(), state);
      }
      setResults(res.data.results);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar backgroundColor="#2e7d5e" barStyle="light-content" />
      <ScrollView
        style={styles.scroll}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.container}
      >
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>ElderCompass</Text>
          <Text style={styles.heroSub}>Find trusted senior living near you.</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.toggle}>
            <TouchableOpacity
              style={[styles.toggleBtn, mode === 'zipcode' && styles.toggleActive]}
              onPress={() => { setMode('zipcode'); setError(''); }}
            >
              <Text style={[styles.toggleText, mode === 'zipcode' && styles.toggleTextActive]}>
                ZIP Code
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, mode === 'cityState' && styles.toggleActive]}
              onPress={() => { setMode('cityState'); setError(''); }}
            >
              <Text style={[styles.toggleText, mode === 'cityState' && styles.toggleTextActive]}>
                City &amp; State
              </Text>
            </TouchableOpacity>
          </View>

          {mode === 'zipcode' ? (
            <TextInput
              style={styles.input}
              placeholder="Enter ZIP code (e.g. 90210)"
              placeholderTextColor="#9ca3af"
              value={zipcode}
              onChangeText={setZipcode}
              keyboardType="numeric"
              maxLength={10}
            />
          ) : (
            <View>
              <TextInput
                style={styles.input}
                placeholder="City"
                placeholderTextColor="#9ca3af"
                value={city}
                onChangeText={setCity}
              />
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={state}
                  onValueChange={setState}
                  style={styles.picker}
                >
                  <Picker.Item label="Select state..." value="" />
                  {US_STATES.map((s) => (
                    <Picker.Item key={s} label={s} value={s} />
                  ))}
                </Picker>
              </View>
            </View>
          )}

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[styles.searchBtn, loading && styles.searchBtnDisabled]}
            onPress={handleSearch}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.searchBtnText}>Find Senior Homes</Text>
            }
          </TouchableOpacity>
        </View>

        {results !== null && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsHeading}>
              {results.length > 0
                ? `${results.length} home${results.length !== 1 ? 's' : ''} found`
                : 'No senior homes found in this area'}
            </Text>
            {results.length === 0 && (
              <Text style={styles.emptyText}>
                Try a nearby ZIP code or different city to expand your search.
              </Text>
            )}
            {results.map((home) => (
              <HomeCard
                key={home.id}
                home={home}
                onPress={() => navigation.navigate('HomeDetail', { id: home.id })}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#2e7d5e' },
  scroll: { flex: 1, backgroundColor: '#f9fafb' },
  container: { paddingBottom: 40 },
  hero: {
    backgroundColor: '#2e7d5e',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  toggle: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2e7d5e',
    overflow: 'hidden',
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  toggleActive: { backgroundColor: '#2e7d5e' },
  toggleText: { fontWeight: '600', color: '#2e7d5e', fontSize: 14 },
  toggleTextActive: { color: '#fff' },
  input: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    marginBottom: 12,
  },
  pickerWrapper: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  picker: { height: 50, color: '#111827' },
  errorText: { color: '#dc2626', fontSize: 13, marginBottom: 10 },
  searchBtn: {
    backgroundColor: '#2e7d5e',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  searchBtnDisabled: { opacity: 0.6 },
  searchBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  resultsSection: { paddingHorizontal: 16, marginTop: 24 },
  resultsHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  emptyText: { color: '#6b7280', fontSize: 14, marginBottom: 8 },
});
