import pool from './pool.js';

const sql = `
  CREATE TABLE IF NOT EXISTS senior_homes (
    id              SERIAL PRIMARY KEY,
    cms_ccn         VARCHAR(10),
    google_place_id VARCHAR(100),
    name            VARCHAR(255)  NOT NULL,
    address         VARCHAR(255)  NOT NULL,
    city            VARCHAR(100),
    state           CHAR(2),
    zipcode         VARCHAR(10),
    phone           VARCHAR(20),
    website         VARCHAR(255),
    description     TEXT,
    capacity        INTEGER,
    rating          NUMERIC(3,1),
    source          VARCHAR(20)   NOT NULL DEFAULT 'manual',
    cached_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ   DEFAULT NOW(),

    -- Ratings breakdown
    health_inspection_rating    NUMERIC(3,1),
    staffing_rating             NUMERIC(3,1),
    qm_rating                   NUMERIC(3,1),
    longstay_qm_rating          NUMERIC(3,1),
    shortstay_qm_rating         NUMERIC(3,1),

    -- Staffing (hours per resident per day)
    total_nurse_hours_per_resident    NUMERIC(6,3),
    rn_hours_per_resident             NUMERIC(6,3),
    lpn_hours_per_resident            NUMERIC(6,3),
    nurse_aide_hours_per_resident     NUMERIC(6,3),
    weekend_nurse_hours_per_resident  NUMERIC(6,3),
    total_nursing_staff_turnover      NUMERIC(5,1),
    rn_turnover                       NUMERIC(5,1),

    -- Inspections & penalties
    health_deficiencies               INTEGER,
    total_fines                       INTEGER,
    total_fines_amount                NUMERIC(12,2),
    total_penalties                   INTEGER,
    last_inspection_date              DATE,

    -- Facility profile
    ownership_type                    VARCHAR(100),
    avg_daily_residents               NUMERIC(6,1),
    date_established                  DATE,
    resident_family_council           VARCHAR(50),
    is_ccrc                           BOOLEAN,
    special_focus_status              VARCHAR(50),
    abuse_icon                        BOOLEAN,
    latitude                          NUMERIC(10,6),
    longitude                         NUMERIC(10,6),

    UNIQUE (cms_ccn),
    UNIQUE (google_place_id)
  );

  CREATE TABLE IF NOT EXISTS search_cache (
    cache_key    VARCHAR(100) PRIMARY KEY,
    result_ids   INTEGER[]    NOT NULL,
    cached_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_senior_homes_zipcode    ON senior_homes(zipcode);
  CREATE INDEX IF NOT EXISTS idx_senior_homes_city_state ON senior_homes(LOWER(city), LOWER(state));
`;

async function migrate() {
  try {
    await pool.query(sql);
    console.log('Migration complete.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
