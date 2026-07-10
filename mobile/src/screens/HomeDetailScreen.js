import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Linking, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';

const API_BASE = 'http://10.0.2.2:3001/api';
const SCREEN_WIDTH = Dimensions.get('window').width;

const SLIDES = [
  { icon: '🏡', label: 'Building Exterior', colors: ['#2e7d5e', '#1a5c45'] },
  { icon: '🛋️', label: 'Common Areas',      colors: ['#1d4ed8', '#1e3a8a'] },
  { icon: '🛏️', label: 'Private Rooms',     colors: ['#7c3aed', '#4c1d95'] },
];

function ImageCarousel() {
  const [current, setCurrent] = useState(0);
  return (
    <View style={s.carousel}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) =>
          setCurrent(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH))
        }
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={[s.slide, { backgroundColor: slide.colors[1], width: SCREEN_WIDTH }]}>
            <Text style={s.slideIcon}>{slide.icon}</Text>
            <Text style={s.slideLabel}>{slide.label}</Text>
            <Text style={s.slideSubLabel}>Photos Coming Soon</Text>
          </View>
        ))}
      </ScrollView>
      <View style={s.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[s.dot, i === current && s.dotActive]} />
        ))}
      </View>
    </View>
  );
}

function Stars({ label, rating }) {
  if (!rating) return null;
  const val = parseFloat(rating);
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

function Card({ title, children }) {
  return (
    <View style={s.card}>
      {title && <Text style={s.cardTitle}>{title}</Text>}
      {children}
    </View>
  );
}

function hrs(v) { return v != null ? `${parseFloat(v).toFixed(2)} hrs/res/day` : null; }
function pct(v) { return v != null ? `${parseFloat(v).toFixed(1)}%` : null; }

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

        {/* Photo carousel */}
        <ImageCarousel />

        {/* Identity */}
        <View style={s.identity}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={s.back}>← Back to results</Text>
          </TouchableOpacity>
          <View style={s.badges}>
            <View style={s.badge}><Text style={s.badgeText}>{home.source === 'cms' ? 'MEDICARE CERTIFIED' : 'SENIOR CARE'}</Text></View>
            {home.is_ccrc && <View style={[s.badge, s.badgeBlue]}><Text style={s.badgeText}>CONTINUING CARE</Text></View>}
            {hasAbuse && <View style={[s.badge, s.badgeRed]}><Text style={s.badgeText}>⚠ ABUSE CONCERN</Text></View>}
          </View>
          <Text style={s.name}>{home.name}</Text>
        </View>

        {/* About */}
        <Card title="About">
          {home.description ? <Text style={s.aboutText}>{home.description}</Text> : null}
          <Row label="Address" value={`${home.address}, ${home.city}, ${home.state} ${home.zipcode}`} />
          {home.phone ? (
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${home.phone}`)} style={s.row}>
              <Text style={s.rowLabel}>Phone</Text>
              <Text style={[s.rowValue, s.link]}>{home.phone}</Text>
            </TouchableOpacity>
          ) : null}
          <Row label="Email"   value={home.email || null} />
          <Row label="Fax"     value={home.fax || null} />
          {home.website ? (
            <TouchableOpacity onPress={() => Linking.openURL(home.website)} style={s.row}>
              <Text style={s.rowLabel}>Website</Text>
              <Text style={[s.rowValue, s.link]}>Visit Website</Text>
            </TouchableOpacity>
          ) : null}
        </Card>

        {/* Facility Profile */}
        <Card title="Facility Profile">
          <Row label="Ownership"               value={home.ownership_type} />
          <Row label="Certified Beds"          value={home.capacity != null ? String(home.capacity) : null} />
          <Row label="Avg Daily Residents"     value={home.avg_daily_residents != null ? String(Math.round(parseFloat(home.avg_daily_residents))) : null} />
          <Row label="CMS Cert #"              value={home.cms_ccn} />
          <Row label="Certified Since"         value={home.date_established ? new Date(home.date_established).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : null} />
          <Row label="Resident/Family Council" value={home.resident_family_council} />
          <Row label="Continuing Care (CCRC)"  value={home.is_ccrc ? 'Yes' : null} />
        </Card>

        {/* Location */}
        <Card title="Location">
          <View style={s.mapBox}>
            <Text style={s.mapLine}>{home.address}</Text>
            <Text style={s.mapLine}>{home.city}, {home.state} {home.zipcode}</Text>
            <TouchableOpacity
              style={[s.contactBtn, s.webBtn, { marginTop: 14 }]}
              onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(`${home.address}, ${home.city}, ${home.state} ${home.zipcode}`)}`)}
            >
              <Text style={s.webTxt}>Open in Google Maps</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Overall Rating */}
        {home.rating && (
          <View style={s.overallRating}>
            <Text style={s.overallLabel}>Overall Rating</Text>
            <View style={s.overallStars}>
              {[1,2,3,4,5].map((i) => (
                <Text key={i} style={[s.starLg, i <= Math.round(parseFloat(home.rating)) && s.starLgFilled]}>★</Text>
              ))}
              <Text style={s.overallNum}>{parseFloat(home.rating)}/5</Text>
            </View>
          </View>
        )}

        {/* Ratings Breakdown */}
        <Card title="Ratings Breakdown">
          <Stars label="Health Inspection"  rating={home.health_inspection_rating} />
          <Stars label="Staffing"           rating={home.staffing_rating} />
          <Stars label="Quality Measures"   rating={home.qm_rating} />
          <Stars label="Long-Stay Quality"  rating={home.longstay_qm_rating} />
          <Stars label="Short-Stay Quality" rating={home.shortstay_qm_rating} />
        </Card>

        {/* Staffing */}
        <Card title="Staffing">
          <Text style={s.cardSub}>Hours per resident per day</Text>
          <Row label="Total Nurse Hours"        value={hrs(home.total_nurse_hours_per_resident)} />
          <Row label="RN Hours"                 value={hrs(home.rn_hours_per_resident)} />
          <Row label="LPN Hours"                value={hrs(home.lpn_hours_per_resident)} />
          <Row label="Nurse Aide Hours"         value={hrs(home.nurse_aide_hours_per_resident)} />
          <Row label="Weekend RN Hours"         value={hrs(home.weekend_nurse_hours_per_resident)} />
          <View style={s.divider} />
          <Row label="Nursing Turnover" value={pct(home.total_nursing_staff_turnover)} highlight={parseFloat(home.total_nursing_staff_turnover) > 50} />
          <Row label="RN Turnover"      value={pct(home.rn_turnover)} highlight={parseFloat(home.rn_turnover) > 50} />
        </Card>

        {/* Inspections & Penalties */}
        <Card title="Inspections & Penalties">
          <Row label="Last Inspection"     value={home.last_inspection_date ? new Date(home.last_inspection_date).toLocaleDateString() : null} />
          <Row label="Health Deficiencies" value={home.health_deficiencies != null ? String(home.health_deficiencies) : null} highlight={home.health_deficiencies > 5} />
          <Row label="Total Fines"         value={home.total_fines === 0 ? 'None' : home.total_fines > 0 ? String(home.total_fines) : null} />
          <Row label="Fines Amount"        value={home.total_fines_amount > 0 ? `$${parseFloat(home.total_fines_amount).toLocaleString()}` : null} />
          <Row label="Total Penalties"     value={home.total_penalties === 0 ? 'None' : home.total_penalties > 0 ? String(home.total_penalties) : null} highlight={home.total_penalties > 0} />
          {hasSpecialFocus ? <Row label="Special Focus" value={home.special_focus_status} highlight /> : null}
        </Card>

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

  carousel: { width: '100%', height: 220 },
  slide: { height: 220, alignItems: 'center', justifyContent: 'center', gap: 8 },
  slideIcon: { fontSize: 48 },
  slideLabel: { fontSize: 17, fontWeight: '800', color: '#fff' },
  slideSubLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: 1 },
  dots: { position: 'absolute', bottom: 10, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: '#fff' },

  identity: { padding: 20, paddingBottom: 4 },
  back: { color: '#2e7d5e', fontSize: 14, fontWeight: '600', marginBottom: 14 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  badge: { backgroundColor: '#ecfdf5', borderWidth: 1, borderColor: '#6ee7b7', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  badgeBlue: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
  badgeRed:  { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  badgeText: { color: '#065f46', fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
  name: { fontSize: 22, fontWeight: '800', color: '#111827' },

  card: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 14, borderRadius: 12, padding: 18, borderWidth: 1, borderColor: '#e5e7eb', elevation: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  cardSub: { fontSize: 12, color: '#9ca3af', marginBottom: 8, marginTop: -4 },
  aboutText: { fontSize: 14, color: '#374151', lineHeight: 20, marginBottom: 12 },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#f9fafb', gap: 8 },
  rowLabel: { fontSize: 13, color: '#6b7280', flex: 1 },
  rowValue: { fontSize: 13, color: '#111827', fontWeight: '500', textAlign: 'right', flex: 1 },
  rowHighlight: { color: '#dc2626', fontWeight: '700' },
  link: { color: '#2e7d5e' },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 4 },

  starRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  starLabel: { fontSize: 13, color: '#6b7280', flex: 1 },
  starsWrap: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  star: { fontSize: 15, color: '#d1d5db' },
  starFilled: { color: '#fbbf24' },
  starNum: { fontSize: 12, color: '#6b7280', marginLeft: 4, fontWeight: '600' },

  overallRating: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 14, borderRadius: 12, padding: 18, borderWidth: 1, borderColor: '#e5e7eb', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
  overallLabel: { fontSize: 15, fontWeight: '700', color: '#111827' },
  overallStars: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  starLg: { fontSize: 22, color: '#d1d5db' },
  starLgFilled: { color: '#fbbf24' },
  overallNum: { fontSize: 14, color: '#6b7280', marginLeft: 6, fontWeight: '700' },

  mapBox: { backgroundColor: '#f9fafb', borderRadius: 8, padding: 16, alignItems: 'center' },
  mapLine: { fontSize: 13, color: '#374151', marginBottom: 2 },
  contactBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8 },
  webBtn: { backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe' },
  webTxt: { color: '#1d4ed8', fontWeight: '600', fontSize: 14 },
});
