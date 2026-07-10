import axios from 'axios';

const zippopotam = axios.create({ baseURL: 'https://api.zippopotam.us', timeout: 6000 });
const nominatim = axios.create({
  baseURL: 'https://nominatim.openstreetmap.org',
  headers: { 'User-Agent': 'ElderCompass/1.0 (eldercompass-app)' },
  timeout: 8000,
});

// Returns { city, stateAbbr, county, lat, lon } or null
export async function zipcodeToLocation(zipcode) {
  let city = null;
  let stateAbbr = null;
  let county = null;
  let lat = null;
  let lon = null;

  // 1. Zippopotam — complete USPS ZIP coverage, reliable city + state
  try {
    const r = await zippopotam.get(`/us/${zipcode}`);
    const place = r.data?.places?.[0];
    if (place) {
      city = place['place name'];
      stateAbbr = place['state abbreviation'];
    }
  } catch (_) { /* not found or timeout */ }

  // 2. Nominatim — provides lat/lon and county (used for broader fallback)
  try {
    const r = await nominatim.get('/search', {
      params: { postalcode: zipcode, country: 'US', format: 'json', addressdetails: 1, limit: 1 },
    });
    const hit = r.data?.[0];
    if (hit) {
      lat = parseFloat(hit.lat);
      lon = parseFloat(hit.lon);
      const addr = hit.address || {};
      county = addr.county?.replace(/ County$/, '').replace(/ Parish$/, '') || null;
      // If Zippopotam failed, try to extract city from Nominatim address
      if (!city) {
        stateAbbr = (addr['ISO3166-2-lvl4'] || '').split('-')[1] || null;
        city = addr.city || addr.town || addr.village || addr.hamlet || null;
      }
    }
  } catch (_) { /* timeout or error */ }

  if (!city || !stateAbbr) return null;

  return { city, stateAbbr, county, lat, lon };
}
