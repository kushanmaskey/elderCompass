import pool from './pool.js';

const CACHE_TTL_HOURS = 24;

// Upsert a list of external records; returns their DB ids
export async function upsertHomes(homes) {
  const ids = [];
  for (const h of homes) {
    let row;
    if (h.cms_ccn) {
      const r = await pool.query(
        `INSERT INTO senior_homes (
           cms_ccn, name, address, city, state, zipcode, phone, website, description,
           capacity, rating, source, cached_at,
           health_inspection_rating, staffing_rating, qm_rating, longstay_qm_rating, shortstay_qm_rating,
           total_nurse_hours_per_resident, rn_hours_per_resident, lpn_hours_per_resident,
           nurse_aide_hours_per_resident, weekend_nurse_hours_per_resident,
           total_nursing_staff_turnover, rn_turnover,
           health_deficiencies, total_fines, total_fines_amount, total_penalties, last_inspection_date,
           ownership_type, avg_daily_residents, date_established, resident_family_council,
           is_ccrc, special_focus_status, abuse_icon, latitude, longitude
         ) VALUES (
           $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW(),
           $13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,
           $25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38
         )
         ON CONFLICT (cms_ccn) DO UPDATE SET
           name=EXCLUDED.name, address=EXCLUDED.address, city=EXCLUDED.city,
           state=EXCLUDED.state, zipcode=EXCLUDED.zipcode, phone=EXCLUDED.phone,
           capacity=EXCLUDED.capacity, rating=EXCLUDED.rating,
           health_inspection_rating=EXCLUDED.health_inspection_rating,
           staffing_rating=EXCLUDED.staffing_rating, qm_rating=EXCLUDED.qm_rating,
           longstay_qm_rating=EXCLUDED.longstay_qm_rating,
           shortstay_qm_rating=EXCLUDED.shortstay_qm_rating,
           total_nurse_hours_per_resident=EXCLUDED.total_nurse_hours_per_resident,
           rn_hours_per_resident=EXCLUDED.rn_hours_per_resident,
           lpn_hours_per_resident=EXCLUDED.lpn_hours_per_resident,
           nurse_aide_hours_per_resident=EXCLUDED.nurse_aide_hours_per_resident,
           weekend_nurse_hours_per_resident=EXCLUDED.weekend_nurse_hours_per_resident,
           total_nursing_staff_turnover=EXCLUDED.total_nursing_staff_turnover,
           rn_turnover=EXCLUDED.rn_turnover,
           health_deficiencies=EXCLUDED.health_deficiencies,
           total_fines=EXCLUDED.total_fines, total_fines_amount=EXCLUDED.total_fines_amount,
           total_penalties=EXCLUDED.total_penalties, last_inspection_date=EXCLUDED.last_inspection_date,
           ownership_type=EXCLUDED.ownership_type, avg_daily_residents=EXCLUDED.avg_daily_residents,
           date_established=EXCLUDED.date_established,
           resident_family_council=EXCLUDED.resident_family_council,
           is_ccrc=EXCLUDED.is_ccrc, special_focus_status=EXCLUDED.special_focus_status,
           abuse_icon=EXCLUDED.abuse_icon, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
           cached_at=NOW()
         RETURNING id`,
        [
          h.cms_ccn, h.name, h.address, h.city, h.state, h.zipcode,
          h.phone, h.website, h.description, h.capacity, h.rating, h.source,
          h.health_inspection_rating, h.staffing_rating, h.qm_rating,
          h.longstay_qm_rating, h.shortstay_qm_rating,
          h.total_nurse_hours_per_resident, h.rn_hours_per_resident,
          h.lpn_hours_per_resident, h.nurse_aide_hours_per_resident,
          h.weekend_nurse_hours_per_resident,
          h.total_nursing_staff_turnover, h.rn_turnover,
          h.health_deficiencies, h.total_fines, h.total_fines_amount,
          h.total_penalties, h.last_inspection_date,
          h.ownership_type, h.avg_daily_residents, h.date_established,
          h.resident_family_council, h.is_ccrc, h.special_focus_status,
          h.abuse_icon, h.latitude, h.longitude,
        ]
      );
      row = r.rows[0];
    } else if (h.google_place_id) {
      const r = await pool.query(
        `INSERT INTO senior_homes
           (google_place_id, name, address, city, state, zipcode, phone, website, description, capacity, rating, source, cached_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12, NOW())
         ON CONFLICT (google_place_id) DO UPDATE SET
           name=EXCLUDED.name, rating=EXCLUDED.rating, cached_at=NOW()
         RETURNING id`,
        [h.google_place_id, h.name, h.address, h.city, h.state, h.zipcode,
         h.phone, h.website, h.description, h.capacity, h.rating, h.source]
      );
      row = r.rows[0];
    }
    if (row) ids.push(row.id);
  }
  return ids;
}

export async function getByIds(ids) {
  if (!ids.length) return [];
  const r = await pool.query(
    `SELECT * FROM senior_homes WHERE id = ANY($1) ORDER BY name`,
    [ids]
  );
  return r.rows;
}

export async function getCached(cacheKey) {
  const r = await pool.query(
    `SELECT result_ids, cached_at FROM search_cache WHERE cache_key = $1`,
    [cacheKey]
  );
  if (!r.rows.length) return null;
  const { result_ids, cached_at } = r.rows[0];
  const ageHours = (Date.now() - new Date(cached_at).getTime()) / 3_600_000;
  if (ageHours > CACHE_TTL_HOURS) return null;
  return result_ids;
}

export async function setCache(cacheKey, ids) {
  await pool.query(
    `INSERT INTO search_cache (cache_key, result_ids, cached_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (cache_key) DO UPDATE SET result_ids=$2, cached_at=NOW()`,
    [cacheKey, ids]
  );
}

export async function searchLocal(field, value) {
  const col = field === 'zipcode' ? 'zipcode' : null;
  if (col) {
    const r = await pool.query(
      `SELECT * FROM senior_homes WHERE ${col} = $1 ORDER BY name`,
      [value]
    );
    return r.rows;
  }
  return [];
}
