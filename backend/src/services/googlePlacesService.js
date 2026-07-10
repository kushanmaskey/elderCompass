import axios from 'axios';

const PLACES_API = 'https://maps.googleapis.com/maps/api/place';
const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// Returns true only if the key is configured and non-placeholder
export function isConfigured() {
  return !!API_KEY && !API_KEY.startsWith('YOUR_');
}

const places = axios.create({ timeout: 10000 });

const SENIOR_KEYWORDS = 'senior living OR nursing home OR assisted living OR memory care';

function mapPlace(p) {
  const loc = p.geometry?.location;
  return {
    cms_ccn: null,
    name: p.name,
    address: p.vicinity || p.formatted_address || '',
    city: null,
    state: null,
    zipcode: null,
    phone: p.formatted_phone_number || null,
    website: p.website || null,
    description: p.types?.join(', ') || 'Senior care facility',
    capacity: null,
    rating: p.rating ? parseFloat(p.rating) : null,
    lat: loc?.lat,
    lon: loc?.lng,
    source: 'google',
    google_place_id: p.place_id,
  };
}

export async function fetchNearby(lat, lon, radiusMeters = 16000) {
  if (!isConfigured()) return [];

  const resp = await places.get(`${PLACES_API}/nearbysearch/json`, {
    params: {
      location: `${lat},${lon}`,
      radius: radiusMeters,
      keyword: SENIOR_KEYWORDS,
      type: 'health',
      key: API_KEY,
    },
  });

  return (resp.data?.results || []).map(mapPlace);
}

export async function fetchByCityState(city, stateAbbr) {
  if (!isConfigured()) return [];

  const resp = await places.get(`${PLACES_API}/textsearch/json`, {
    params: {
      query: `senior living nursing home ${city} ${stateAbbr}`,
      key: API_KEY,
    },
  });

  return (resp.data?.results || []).map(mapPlace);
}
