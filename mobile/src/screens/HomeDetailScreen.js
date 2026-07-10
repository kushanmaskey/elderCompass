import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';

const API_BASE = 'http://10.0.2.2:3001/api';

function num(v) { return v != null ? parseFloat(v) : null; }

function Stars({ label, rating }) {
  if (!rating) return null;
  const val = num(rating);
  return (
    <View style={s.starRow}>
      <Text style={s.starLabel}>{label}</Text>
      <View style={s.starsWrap}>
        {[1,2,3,4,5].map((i) => (
          <Text key={i} style={[s.star, i <= Math.round(val) && s.starFilled]}>★</Text>
        ))}
        <Text style={s.starNum}>{val}/5</Text>
      </View>
    </View>
  );
}

function Row({ label, value, highlight }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={[s.rowValue, highlight && s.rowHighlight]}>{value}</Text>
    </View>
  );
}

function hrs(v) { return v != null ? `${num(v).toFixed(2)} hrs/resident/day` : null; }
function pct(v) { return v != null ? `${num(v).toFixed(1)}%` : null; }

export default function HomeDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [home, setHome] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`${API_BASE}/homes/${id}`)
      .then((r) => setHome(r.data))
      .catch(() => setError('Could not load this listing.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <SafeAreaView style={s.centered}>
      <ActivityIndicator size="large" color="#2e7d5e" />
      <Text style={s.loadingText}>Loading details…</Text>
    </SafeAreaView>
  );

  if (error || !home) return (
    <SafeAreaView style={s.centered}>
      <Text style={s.errorText}>{error || 'Not found.'}</Text>
      <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
        <Text style={s.backBtnText}>Go back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  const hasAbuse = home.abuse_icon === true;
  const hasSpecialFocus = home.special_focus_status?.trim();

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.container}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={s.back}>← Back</Text>
          </TouchableOpacity>
          <View style={s.badges}>
            <View style={s.badge}><Text style={s.badgeText}>{home.source === 'cms' ? 'MEDICARE CERTIFIED' : 'SENIOR CARE'}</Text></View>
            {home.is_ccrc && <View style={[s.badge, s.badgeBlue]}><Text style={s.badgeText}>CONTINUING CARE</Text></View>}
            {hasAbuse && <View style={[s.badge, s.badgeRed]}><Text style={s.badgeText}>⚠ ABUSE CONCERN</Text></View>}
          </View>
          <Text style={s.name}>{home.name}</Text>
          <Text style={s.addr}>{home.address}, {home.city}, {home.state} {home.zipcode}</Text>
          <Stars label="Overall Rating" rating={home.rating} />
        </View>

        {/* Ratings */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Ratings Breakdown</Text>
          <Stars label="Overall Rating"      rating={home.rating} />
          <Stars label="Health Inspection"   rating={home.health_inspection_rating} />
          <Stars label="Staffing"            rating={home.staffing_rating} />
          <Stars label="Quality Measures"    rating={home.qm_rating} />
          <Stars label="Long-Stay Quality"   rating={home.longstay_qm_rating} />
          <Stars label="Short-Stay Quality"  rating={home.shortstay_qm_rating} />
        </View>

        {/* Staffing */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Staffing  <Text style={s.cardSub}>(hrs/resident/day)</Text></Text>
          <Row label="Total Nurse Hours"        value={hrs(home.total_nurse_hours_per_resident)} />
          <Row label="Registered Nurse (RN)"    value={hrs(home.rn_hours_per_resident)} />
          <Row label="Licensed Practical (LPN)" value={hrs(home.lpn_hours_per_resident)} />
          <Row label="Nurse Aide"               value={hrs(home.nurse_aide_hours_per_resident)} />
          <Row label="Weekend RN Hours"         value={hrs(home.weekend_nurse_hours_per_resident)} />
          <View style={s.divider} />
          <Row label="Nursing Turnover"  value={pct(home.total_nursing_staff_turnover)} highlight={num(home.total_nursing_staff_turnover) > 50} />
          <Row label="RN Turnover"       value={pct(home.rn_turnover)} highlight={num(home.rn_turnover) > 50} />
        </View>

        {/* Inspections */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Inspections &amp; Penalties</Text>
          <Row label="Last Inspection"    value={home.last_inspection_date ? new Date(home.last_inspection_date).toLocaleDateString() : null} />
          <Row label="Health Deficiencies" value={home.health_deficiencies != null ? String(home.health_deficiencies) : null} highlight={home.health_deficiencies > 5} />
          <Row label="Total Fines"        value={home.total_fines === 0 ? 'None' : home.total_fines > 0 ? `${home.total_fines}` : null} />
          <Row label="Fines Amount"       value={home.total_fines_amount > 0 ? `$${parseFloat(home.total_fines_amount).toLocaleString()}` : null} />
          <Row label="Total Penalties"    value={home.total_penalties === 0 ? 'None' : home.total_penalties != null ? String(home.total_penalties) : null} highlight={home.total_penalties > 0} />
          {hasSpecialFocus ? <Row label="Special Focus" value={home.special_focus_status} highlight /> : null}
        </View>

        {/* Facility Profile */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Facility Profile</Text>
          <Row label="Ownership"            value={home.ownership_type} />
          <Row label="Certified Beds"       value={home.capacity != null ? String(home.capacity) : null} />
          <Row label="Avg Daily Residents"  value={home.avg_daily_residents != null ? Math.round(num(home.avg_daily_residents)).toString() : null} />
          <Row label="CMS Cert #"           value={home.cms_ccn} />
          <Row label="Certified Since"      value={home.date_established ? new Date(home.date_established).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : null} />
          <Row label="Resident/Family Council" value={home.resident_family_council} />
          <Row label="Continuing Care (CCRC)" value={home.is_ccrc ? 'Yes' : null} />
        </View>

        {/* Contact */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Contact</Text>
          {home.phone ? (
            <TouchableOpacity style={[s.btn, s.phoneBtn]} onPress={() => Linking.openURL(`tel:${home.phone}`)}>
              <Text style={s.phoneTxt}>📞 {home.phone}</Text>
            </TouchableOpacity>
          ) : null}
          {home.website ? (
            <TouchableOpacity style={[s.btn, s.webBtn]} onPress={() => Linking.openURL(home.website)}>
              <Text style={s.webTxt}>🌐 Visit Website</Text>
            </TouchableOpacity>
          ) : null}
          {!home.phone && !home.website && <Text style={s.noContact}>No contact info available.</Text>}
        </View>

        {/* Location */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Location</Text>
          <View style={s.mapBox}>
            <Text style={s.mapLine}>{home.address}</Text>
            <Text style={s.mapLine}>{home.city}, {home.state} {home.zipcode}</Text>
            <TouchableOpacity
              style={[s.btn, s.webBtn, { marginTop: 14, alignSelf: 'center' }]}
              onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(`${home.address}, ${home.city}, ${home.state} ${home.zipcode}`)}`)}
            >
              <Text style={s.webTxt}>Open in Google Maps</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  container: { paddingBottom: 48 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#f9fafb' },
  loadingText: { color: '#6b7280', marginTop: 8 },
  errorText: { color: '#dc2626' },
  backBtn: { backgroundColor: '#2e7d5e', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginTop: 12 },
  backBtnText: { color: '#fff', fontWeight: '700' },

  header: { backgroundColor: '#2e7d5e', padding: 24, paddingBottom: 36 },
  back: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '600', marginBottom: 16 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  badge: { backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  badgeBlue: { backgroundColor: 'rgba(59,130,246,0.4)', borderColor: 'rgba(147,197,253,0.6)' },
  badgeRed:  { backgroundColor: 'rgba(220,38,38,0.5)',  borderColor: 'rgba(252,165,165,0.6)' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
  name: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 6 },
  addr: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 12 },

  starRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  starLabel: { fontSize: 13, color: '#374151', fontWeight: '500', flex: 1 },
  starsWrap: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  star: { fontSize: 16, color: '#d1d5db' },
  starFilled: { color: '#fbbf24' },
  starNum: { fontSize: 12, color: '#6b7280', marginLeft: 4, fontWeight: '600' },

  // override star colours in header
  header_starLabel: { color: 'rgba(255,255,255,0.85)' },

  card: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#e5e7eb', elevation: 2 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  cardSub: { fontSize: 12, fontWeight: '400', color: '#9ca3af' },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#f9fafb', gap: 8 },
  rowLabel: { fontSize: 13, color: '#6b7280', flex: 1 },
  rowValue: { fontSize: 13, color: '#111827', fontWeight: '500', textAlign: 'right', flex: 1 },
  rowHighlight: { color: '#dc2626', fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 6 },

  btn: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 10, marginBottom: 10 },
  phoneBtn: { backgroundColor: '#ecfdf5', borderWidth: 1, borderColor: '#6ee7b7' },
  phoneTxt: { color: '#065f46', fontWeight: '600', fontSize: 14 },
  webBtn: { backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe' },
  webTxt: { color: '#1d4ed8', fontWeight: '600', fontSize: 14 },
  noContact: { fontSize: 13, color: '#9ca3af' },

  mapBox: { backgroundColor: '#f9fafb', borderRadius: 8, padding: 16, alignItems: 'center' },
  mapLine: { fontSize: 13, color: '#374151', marginBottom: 2 },
});
