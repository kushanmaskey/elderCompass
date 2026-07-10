import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getHomeById } from '../api/homes';
import './HomeDetail.css';

function Stars({ rating, label }) {
  if (!rating) return null;
  const val = parseFloat(rating);
  return (
    <div className="star-row">
      <span className="star-label">{label}</span>
      <span className="stars">
        {[1,2,3,4,5].map((i) => (
          <span key={i} className={i <= Math.round(val) ? 'star filled' : 'star'}>★</span>
        ))}
        <span className="star-num">{val}/5</span>
      </span>
    </div>
  );
}

function Row({ label, value, highlight }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className={`detail-row ${highlight ? 'detail-row-highlight' : ''}`}>
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  );
}

function hrs(v) {
  return v != null ? `${parseFloat(v).toFixed(2)} hrs/resident/day` : null;
}

function pct(v) {
  return v != null ? `${parseFloat(v).toFixed(1)}%` : null;
}

function fmt(v, prefix = '', suffix = '') {
  return v != null ? `${prefix}${v}${suffix}` : null;
}

export default function HomeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [home, setHome] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getHomeById(id)
      .then((r) => setHome(r.data))
      .catch(() => setError('Could not load this listing.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="detail-loading"><div className="spinner" /><p>Loading details…</p></div>
  );
  if (error || !home) return (
    <div className="detail-error"><p>{error || 'Home not found.'}</p><button onClick={() => navigate(-1)}>Go back</button></div>
  );

  const hasAbuseConcern = home.abuse_icon === true;
  const hasSpecialFocus = home.special_focus_status && home.special_focus_status.trim() !== '';

  return (
    <div className="detail-page">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back to results</button>
        <div className="detail-hero">
          <div className="badge-row">
            <span className="detail-badge">{home.source === 'cms' ? 'Medicare Certified' : 'Senior Care'}</span>
            {home.is_ccrc && <span className="detail-badge badge-blue">Continuing Care Community</span>}
            {hasAbuseConcern && <span className="detail-badge badge-red">⚠ Abuse Concern</span>}
          </div>
          <h1 className="detail-name">{home.name}</h1>
          <p className="detail-address">{home.address}, {home.city}, {home.state} {home.zipcode}</p>
          {home.rating && (
            <div className="overall-rating">
              <Stars rating={home.rating} label="Overall" />
            </div>
          )}
        </div>
      </div>

      <div className="detail-body">

        {/* ── Ratings Breakdown ── */}
        <div className="detail-card">
          <h2>Ratings Breakdown</h2>
          <Stars rating={home.rating}                label="Overall Rating" />
          <Stars rating={home.health_inspection_rating} label="Health Inspection" />
          <Stars rating={home.staffing_rating}         label="Staffing" />
          <Stars rating={home.qm_rating}               label="Quality Measures" />
          <Stars rating={home.longstay_qm_rating}      label="Long-Stay Quality" />
          <Stars rating={home.shortstay_qm_rating}     label="Short-Stay Quality" />
        </div>

        {/* ── Staffing ── */}
        <div className="detail-card">
          <h2>Staffing <span className="card-subtitle">(hours per resident per day)</span></h2>
          <Row label="Total Nurse Hours"       value={hrs(home.total_nurse_hours_per_resident)} />
          <Row label="Registered Nurse (RN)"   value={hrs(home.rn_hours_per_resident)} />
          <Row label="Licensed Practical (LPN)" value={hrs(home.lpn_hours_per_resident)} />
          <Row label="Nurse Aide"              value={hrs(home.nurse_aide_hours_per_resident)} />
          <Row label="Weekend RN Hours"        value={hrs(home.weekend_nurse_hours_per_resident)} />
          <div className="divider" />
          <Row label="Total Nursing Turnover"  value={pct(home.total_nursing_staff_turnover)} highlight={home.total_nursing_staff_turnover > 50} />
          <Row label="RN Turnover"             value={pct(home.rn_turnover)} highlight={home.rn_turnover > 50} />
        </div>

        {/* ── Inspections & Penalties ── */}
        <div className="detail-card">
          <h2>Inspections &amp; Penalties</h2>
          <Row label="Last Inspection"         value={home.last_inspection_date ? new Date(home.last_inspection_date).toLocaleDateString() : null} />
          <Row label="Health Deficiencies"     value={fmt(home.health_deficiencies)} highlight={home.health_deficiencies > 5} />
          <Row label="Total Fines"             value={home.total_fines > 0 ? `${home.total_fines} fine${home.total_fines !== 1 ? 's' : ''}` : home.total_fines === 0 ? 'None' : null} />
          <Row label="Fines Amount"            value={home.total_fines_amount > 0 ? `$${parseFloat(home.total_fines_amount).toLocaleString()}` : null} />
          <Row label="Total Penalties"         value={home.total_penalties === 0 ? 'None' : fmt(home.total_penalties)} highlight={home.total_penalties > 0} />
          {hasSpecialFocus && <Row label="Special Focus Status" value={home.special_focus_status} highlight />}
        </div>

        {/* ── Facility Profile ── */}
        <div className="detail-card">
          <h2>Facility Profile</h2>
          <Row label="Ownership"               value={home.ownership_type} />
          <Row label="Certified Beds"          value={home.capacity} />
          <Row label="Avg Daily Residents"     value={home.avg_daily_residents ? parseFloat(home.avg_daily_residents).toFixed(0) : null} />
          <Row label="CMS Certification #"     value={home.cms_ccn} />
          <Row label="Certified Since"         value={home.date_established ? new Date(home.date_established).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : null} />
          <Row label="Resident / Family Council" value={home.resident_family_council} />
          <Row label="Continuing Care (CCRC)"  value={home.is_ccrc ? 'Yes' : null} />
        </div>

        {/* ── Contact ── */}
        <div className="detail-card">
          <h2>Contact</h2>
          {home.phone && <a href={`tel:${home.phone}`} className="contact-btn phone-btn">📞 {home.phone}</a>}
          {home.website && <a href={home.website} target="_blank" rel="noopener noreferrer" className="contact-btn web-btn">🌐 Visit Website</a>}
          {!home.phone && !home.website && <p className="no-contact">No contact information available.</p>}
        </div>

        {/* ── Location ── */}
        <div className="detail-card">
          <h2>Location</h2>
          <div className="map-box">
            <p>{home.address}</p>
            <p>{home.city}, {home.state} {home.zipcode}</p>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(`${home.address}, ${home.city}, ${home.state} ${home.zipcode}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="contact-btn web-btn"
            >
              Open in Google Maps
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
