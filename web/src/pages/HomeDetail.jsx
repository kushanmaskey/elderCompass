import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getHomeById } from '../api/homes';
import './HomeDetail.css';

const SLIDES = [
  { icon: '🏡', label: 'Building Exterior', bg: 'linear-gradient(135deg, #2e7d5e 0%, #1a5c45 100%)' },
  { icon: '🛋️', label: 'Common Areas',      bg: 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)' },
  { icon: '🛏️', label: 'Private Rooms',     bg: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)' },
];

function ImageCarousel() {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(null);
  const trackRef = useRef(null);

  function goTo(idx) {
    setCurrent(idx);
    trackRef.current.style.transition = 'transform 0.4s ease';
    trackRef.current.style.transform = `translateX(-${idx * 100}%)`;
  }

  return (
    <>
      <div className="carousel">
        <div className="carousel-track" ref={trackRef}>
          {SLIDES.map((slide, i) => (
            <div
              key={i}
              className="carousel-slide"
              style={{ background: slide.bg, cursor: 'zoom-in' }}
              onClick={() => setLightbox(slide)}
            >
              <div className="carousel-icon">{slide.icon}</div>
              <div className="carousel-slide-label">{slide.label}</div>
              <div className="carousel-coming-soon">Photos Coming Soon · Click to expand</div>
            </div>
          ))}
        </div>

        <button className="carousel-btn carousel-prev" onClick={() => goTo(Math.max(0, current - 1))} disabled={current === 0}>‹</button>
        <button className="carousel-btn carousel-next" onClick={() => goTo(Math.min(SLIDES.length - 1, current + 1))} disabled={current === SLIDES.length - 1}>›</button>

        <div className="carousel-dots">
          {SLIDES.map((_, i) => (
            <button key={i} className={`carousel-dot${i === current ? ' active' : ''}`} onClick={() => goTo(i)} />
          ))}
        </div>
      </div>

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" onClick={() => setLightbox(null)}>✕</button>
          <div className="lightbox-slide" style={{ background: lightbox.bg }} onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-icon">{lightbox.icon}</div>
            <div className="lightbox-label">{lightbox.label}</div>
            <div className="lightbox-sub">Photos Coming Soon</div>
          </div>
        </div>
      )}
    </>
  );
}

function Stars({ rating, label }) {
  if (!rating) return null;
  const val = parseFloat(rating);
  return (
    <div className="star-row">
      <span className="star-label">{label}</span>
      <span className="stars-wrap">
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

function Card({ title, children }) {
  return (
    <div className="detail-card">
      {title && <h2>{title}</h2>}
      {children}
    </div>
  );
}

function hrs(v) { return v != null ? `${parseFloat(v).toFixed(2)} hrs/resident/day` : null; }
function pct(v) { return v != null ? `${parseFloat(v).toFixed(1)}%` : null; }

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
    <div className="detail-error">
      <p>{error || 'Home not found.'}</p>
      <button onClick={() => navigate(-1)}>Go back</button>
    </div>
  );

  const hasAbuse = home.abuse_icon === true;
  const hasSpecialFocus = home.special_focus_status?.trim();

  return (
    <div className="detail-page">

      {/* ── Photo carousel ── */}
      <ImageCarousel />

      {/* ── Name & badges ── */}
      <div className="detail-identity">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back to results</button>
        <div className="badge-row">
          <span className="badge">{home.source === 'cms' ? 'Medicare Certified' : 'Senior Care'}</span>
          {home.is_ccrc && <span className="badge badge-blue">Continuing Care</span>}
          {hasAbuse && <span className="badge badge-red">⚠ Abuse Concern</span>}
        </div>
        <h1 className="detail-name">{home.name}</h1>
      </div>

      <div className="detail-layout">

        {/* ── Left: cards ── */}
        <div className="detail-body">

          {/* ── About ── */}
          <Card title="About">
            {home.description && <p className="about-text">{home.description}</p>}
            <Row label="Address" value={
              <a href={`https://maps.google.com/?q=${encodeURIComponent(`${home.address}, ${home.city}, ${home.state} ${home.zipcode}`)}`} target="_blank" rel="noopener noreferrer" className="inline-link">
                {home.address}, {home.city}, {home.state} {home.zipcode}
              </a>
            } />
            <Row label="Phone"   value={home.phone ? <a href={`tel:${home.phone}`} className="inline-link">{home.phone}</a> : null} />
            <Row label="Email"   value={home.email || null} />
            <Row label="Fax"     value={home.fax || null} />
            <Row label="Website" value={home.website ? <a href={home.website} target="_blank" rel="noopener noreferrer" className="inline-link">Visit Website</a> : null} />
          </Card>

          {/* ── Facility Profile ── */}
          <Card title="Facility Profile">
            <Row label="Ownership"               value={home.ownership_type} />
            <Row label="Certified Beds"          value={home.capacity} />
            <Row label="Avg Daily Residents"     value={home.avg_daily_residents ? Math.round(home.avg_daily_residents) : null} />
            <Row label="CMS Certification #"     value={home.cms_ccn} />
            <Row label="Certified Since"         value={home.date_established ? new Date(home.date_established).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : null} />
            <Row label="Resident/Family Council" value={home.resident_family_council} />
            <Row label="Continuing Care (CCRC)"  value={home.is_ccrc ? 'Yes' : null} />
          </Card>

          {/* ── Overall Rating ── */}
          {home.rating && (
            <div className="rating-overall">
              <span className="rating-overall-label">Overall Rating</span>
              <div className="rating-overall-stars">
                {[1,2,3,4,5].map((i) => (
                  <span key={i} className={i <= Math.round(parseFloat(home.rating)) ? 'star-lg filled' : 'star-lg'}>★</span>
                ))}
                <span className="rating-overall-num">{parseFloat(home.rating)}/5</span>
              </div>
            </div>
          )}

          {/* ── Ratings Breakdown ── */}
          <Card title="Ratings Breakdown">
            <Stars rating={home.health_inspection_rating} label="Health Inspection" />
            <Stars rating={home.staffing_rating}          label="Staffing" />
            <Stars rating={home.qm_rating}                label="Quality Measures" />
            <Stars rating={home.longstay_qm_rating}       label="Long-Stay Quality" />
            <Stars rating={home.shortstay_qm_rating}      label="Short-Stay Quality" />
          </Card>

          {/* ── Staffing ── */}
          <Card title="Staffing">
            <p className="card-subtitle">Hours per resident per day</p>
            <Row label="Total Nurse Hours"        value={hrs(home.total_nurse_hours_per_resident)} />
            <Row label="Registered Nurse (RN)"    value={hrs(home.rn_hours_per_resident)} />
            <Row label="Licensed Practical (LPN)" value={hrs(home.lpn_hours_per_resident)} />
            <Row label="Nurse Aide"               value={hrs(home.nurse_aide_hours_per_resident)} />
            <Row label="Weekend RN Hours"         value={hrs(home.weekend_nurse_hours_per_resident)} />
            <div className="divider" />
            <Row label="Nursing Turnover" value={pct(home.total_nursing_staff_turnover)} highlight={home.total_nursing_staff_turnover > 50} />
            <Row label="RN Turnover"      value={pct(home.rn_turnover)} highlight={home.rn_turnover > 50} />
          </Card>

          {/* ── Inspections & Penalties ── */}
          <Card title="Inspections & Penalties">
            <Row label="Last Inspection"     value={home.last_inspection_date ? new Date(home.last_inspection_date).toLocaleDateString() : null} />
            <Row label="Health Deficiencies" value={home.health_deficiencies != null ? String(home.health_deficiencies) : null} highlight={home.health_deficiencies > 5} />
            <Row label="Total Fines"         value={home.total_fines === 0 ? 'None' : home.total_fines > 0 ? `${home.total_fines}` : null} />
            <Row label="Fines Amount"        value={home.total_fines_amount > 0 ? `$${parseFloat(home.total_fines_amount).toLocaleString()}` : null} />
            <Row label="Total Penalties"     value={home.total_penalties === 0 ? 'None' : home.total_penalties > 0 ? String(home.total_penalties) : null} highlight={home.total_penalties > 0} />
            {hasSpecialFocus && <Row label="Special Focus" value={home.special_focus_status} highlight />}
          </Card>

        </div>

        {/* ── Right: sticky map ── */}
        <div className="detail-map-col">
          <div className="detail-map-sticky">
            <iframe
              title="Property location"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(`${home.address}, ${home.city}, ${home.state} ${home.zipcode}`)}&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0, borderRadius: 12 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
