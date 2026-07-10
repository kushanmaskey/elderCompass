import axios from 'axios';

const CMS_API = 'https://data.cms.gov/provider-data/api/1/datastore/query/4pq5-n9py/0';

const cms = axios.create({ timeout: 15000 });

function normalizePhone(raw) {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  }
  return raw;
}

function num(v) { return v && v !== '' ? parseFloat(v) : null; }
function int(v) { return v && v !== '' ? parseInt(v, 10) : null; }
function date(v) { return v && v !== '' ? v : null; }
function bool(v) { return v === 'Y' || v === 'Yes' || v === true; }

function mapRecord(r) {
  return {
    cms_ccn:     r.cms_certification_number_ccn,
    name:        r.provider_name,
    address:     r.provider_address,
    city:        r.citytown,
    state:       r.state,
    zipcode:     r.zip_code,
    phone:       normalizePhone(r.telephone_number),
    website:     null,
    description: null,
    capacity:    int(r.number_of_certified_beds),
    rating:      num(r.overall_rating),
    source:      'cms',

    // Ratings breakdown
    health_inspection_rating: num(r.health_inspection_rating),
    staffing_rating:          num(r.staffing_rating),
    qm_rating:                num(r.qm_rating),
    longstay_qm_rating:       num(r.longstay_qm_rating),
    shortstay_qm_rating:      num(r.shortstay_qm_rating),

    // Staffing
    total_nurse_hours_per_resident:   num(r.reported_total_nurse_staffing_hours_per_resident_per_day),
    rn_hours_per_resident:            num(r.reported_rn_staffing_hours_per_resident_per_day),
    lpn_hours_per_resident:           num(r.reported_lpn_staffing_hours_per_resident_per_day),
    nurse_aide_hours_per_resident:    num(r.reported_nurse_aide_staffing_hours_per_resident_per_day),
    weekend_nurse_hours_per_resident: num(r.registered_nurse_hours_per_resident_per_day_on_the_weekend),
    total_nursing_staff_turnover:     num(r.total_nursing_staff_turnover),
    rn_turnover:                      num(r.registered_nurse_turnover),

    // Inspections & penalties
    health_deficiencies: int(r.rating_cycle_1_total_number_of_health_deficiencies),
    total_fines:         int(r.number_of_fines),
    total_fines_amount:  num(r.total_amount_of_fines_in_dollars),
    total_penalties:     int(r.total_number_of_penalties),
    last_inspection_date: date(r.rating_cycle_1_standard_survey_health_date),

    // Facility profile
    ownership_type:          r.ownership_type || null,
    avg_daily_residents:     num(r.average_number_of_residents_per_day),
    date_established:        date(r.date_first_approved_to_provide_medicare_and_medicaid_services),
    resident_family_council: r.with_a_resident_and_family_council || null,
    is_ccrc:                 bool(r.continuing_care_retirement_community),
    special_focus_status:    r.special_focus_status || null,
    abuse_icon:              bool(r.abuse_icon),
    latitude:                num(r.latitude),
    longitude:               num(r.longitude),
  };
}

async function query(conditions) {
  const resp = await cms.post(CMS_API, {
    conditions,
    limit: 50,
    sort: [{ property: 'provider_name', order: 'ASC' }],
  });
  return (resp.data?.results || []).map(mapRecord);
}

export async function fetchByZipcode(zipcode) {
  return query([{ property: 'zip_code', value: zipcode, operator: '=' }]);
}

export async function fetchByCityState(city, stateAbbr) {
  return query([
    { property: 'citytown', value: city.toUpperCase(), operator: '=' },
    { property: 'state', value: stateAbbr.toUpperCase(), operator: '=' },
  ]);
}

export async function fetchByCountyState(county, stateAbbr) {
  return query([
    { property: 'countyparish', value: county, operator: '=' },
    { property: 'state', value: stateAbbr.toUpperCase(), operator: '=' },
  ]);
}
