import * as cmsService from '../services/cmsService.js';
import * as googleService from '../services/googlePlacesService.js';
import { zipcodeToLocation } from '../services/geocodeService.js';
import { upsertHomes, getByIds, getCached, setCache } from '../db/homeRepo.js';
import pool from '../db/pool.js';

export async function getHomeById(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID.' });
  const r = await pool.query('SELECT * FROM senior_homes WHERE id = $1', [id]);
  if (!r.rows.length) return res.status(404).json({ error: 'Home not found.' });
  res.json(r.rows[0]);
}

async function fetchAndCache(cacheKey, fetchFn) {
  const cachedIds = await getCached(cacheKey);
  if (cachedIds) {
    const homes = await getByIds(cachedIds);
    return { results: homes, source: 'cache' };
  }

  const homes = await fetchFn();
  const ids = homes.length ? await upsertHomes(homes) : [];
  await setCache(cacheKey, ids);
  return { results: await getByIds(ids), source: 'live' };
}

export async function searchByZipcode(req, res) {
  const { zipcode } = req.params;
  if (!/^\d{5}(-\d{4})?$/.test(zipcode)) {
    return res.status(400).json({ error: 'Invalid ZIP code format.' });
  }

  const zip5 = zipcode.slice(0, 5);

  try {
    const { results, source } = await fetchAndCache(`zip:${zip5}`, async () => {
      // Tier 1: exact ZIP match in CMS
      let homes = await cmsService.fetchByZipcode(zip5);
      if (homes.length) return homes;

      // Geocode the ZIP to get city, state, county, and lat/lon
      const loc = await zipcodeToLocation(zip5);
      if (!loc) return [];

      // Tier 2: CMS by city + state
      homes = await cmsService.fetchByCityState(loc.city, loc.stateAbbr);
      if (homes.length) return homes;

      // Tier 3: CMS by county + state (broadest — covers whole metro area)
      if (loc.county) {
        homes = await cmsService.fetchByCountyState(loc.county, loc.stateAbbr);
        if (homes.length) return homes;
      }

      // Tier 4: Google Places by lat/lon (if key configured)
      if (loc.lat && googleService.isConfigured()) {
        homes = await googleService.fetchNearby(loc.lat, loc.lon);
      }

      return homes;
    });

    res.json({ results, count: results.length, source });
  } catch (err) {
    console.error('searchByZipcode error:', err.message);
    res.status(500).json({ error: 'Failed to fetch senior homes. Please try again.' });
  }
}

export async function searchByCityState(req, res) {
  const { city, state } = req.query;
  if (!city || !state) {
    return res.status(400).json({ error: 'Both city and state are required.' });
  }
  if (!/^[A-Za-z]{2}$/.test(state)) {
    return res.status(400).json({ error: 'State must be a 2-letter abbreviation.' });
  }

  const cityClean = city.trim();
  const stateUp = state.trim().toUpperCase();
  const cacheKey = `city:${cityClean.toLowerCase()}:${stateUp}`;

  try {
    const { results, source } = await fetchAndCache(cacheKey, async () => {
      // 1. CMS search (requires uppercase city name)
      let homes = await cmsService.fetchByCityState(cityClean, stateUp);

      // 2. Fall back to Google Places text search
      if (!homes.length && googleService.isConfigured()) {
        homes = await googleService.fetchByCityState(cityClean, stateUp);
      }

      return homes;
    });

    res.json({ results, count: results.length, source });
  } catch (err) {
    console.error('searchByCityState error:', err.message);
    res.status(500).json({ error: 'Failed to fetch senior homes. Please try again.' });
  }
}
