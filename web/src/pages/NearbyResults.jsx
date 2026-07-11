import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getHomeById } from '../api/homes';
import './NearbyResults.css';

const CATEGORY_MAP = {
  hospitals:    { label: 'Hospitals',    icon: '🏥', tag: 'amenity=hospital' },
  pharmacies:   { label: 'Pharmacies',   icon: '💊', tag: 'amenity=pharmacy' },
  police:       { label: 'Police',       icon: '👮', tag: 'amenity=police' },
  'fire-station':{ label: 'Fire Stations', icon: '🚒', tag: 'amenity=fire_station' },
  parks:        { label: 'Parks',        icon: '🌳', tag: 'leisure=park' },
  restaurants:  { label: 'Restaurants',  icon: '🍽️', tag: 'amenity=restaurant' },
  gym:          { label: 'Gyms',         icon: '💪', tag: 'leisure=fitness_centre' },
};

const RADIUS_M = 40234; // 25 miles

function distanceMi(lat1, lon1, lat2, lon2) {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}

export default function NearbyResults() {
  const { id, category } = useParams();
  const navigate = useNavigate();
  const cat = CATEGORY_MAP[category];

  const [home, setHome] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!cat) { setError('Unknown category.'); setLoading(false); return; }

    getHomeById(id)
      .then(async (r) => {
        const h = r.data;
        setHome(h);
        if (!h.latitude || !h.longitude) {
          setError('Location coordinates not available for this facility.');
          return;
        }
        const [k, v] = cat.tag.split('=');
        const q = `[out:json];(node(around:${RADIUS_M},${h.latitude},${h.longitude})[${k}=${v}];way(around:${RADIUS_M},${h.latitude},${h.longitude})[${k}=${v}];);out center 200;`;
        const res = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: q });
        const data = await res.json();
        const elements = (data.elements || [])
          .filter((e) => e.tags?.name)
          .map((e) => ({ ...e, _lat: e.lat ?? e.center?.lat, _lon: e.lon ?? e.center?.lon }))
          .filter((e) => e._lat && e._lon)
          .sort((a, b) =>
            distanceMi(h.latitude, h.longitude, a._lat, a._lon) -
            distanceMi(h.latitude, h.longitude, b._lat, b._lon)
          );
        setPlaces(elements);
      })
      .catch(() => setError('Failed to load results.'))
      .finally(() => setLoading(false));
  }, [id, category]);

  return (
    <div className="nr-page">
      <div className="nr-header">
        <button className="nr-back" onClick={() => navigate(`/home/${id}`)}>← Back to facility</button>
        {home && <p className="nr-facility">{home.name}</p>}
        {cat && (
          <h1 className="nr-title">
            <span>{cat.icon}</span> {cat.label} within 25 miles
          </h1>
        )}
      </div>

      {loading && (
        <div className="nr-state">
          <div className="nr-spinner" />
          <p>Searching nearby {cat?.label.toLowerCase()}…</p>
        </div>
      )}

      {!loading && error && (
        <div className="nr-state">
          <p className="nr-error">{error}</p>
          <button className="nr-back-btn" onClick={() => navigate(`/home/${id}`)}>Go back</button>
        </div>
      )}

      {!loading && !error && places.length === 0 && (
        <div className="nr-state">
          <p>No {cat?.label.toLowerCase()} found within 25 miles.</p>
        </div>
      )}

      {!loading && places.length > 0 && (
        <div className="nr-body">
          <p className="nr-count">{places.length} result{places.length !== 1 ? 's' : ''} found</p>
          <div className="nr-list">
            {places.map((p) => {
              const name = p.tags.name;
              const street = [p.tags['addr:housenumber'], p.tags['addr:street']].filter(Boolean).join(' ');
              const city = p.tags['addr:city'] || '';
              const phone = p.tags['contact:phone'] || p.tags.phone || '';
              const dist = distanceMi(home.latitude, home.longitude, p._lat, p._lon);
              const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(`${name}${street ? ', ' + street : ''}${city ? ', ' + city : ''}`)}`;
              return (
                <div key={p.id} className="nr-card">
                  <div className="nr-card-left">
                    <div className="nr-card-name">{name}</div>
                    {(street || city) && (
                      <div className="nr-card-addr">{[street, city].filter(Boolean).join(', ')}</div>
                    )}
                    {phone && <div className="nr-card-phone"><a href={`tel:${phone}`}>{phone}</a></div>}
                  </div>
                  <div className="nr-card-right">
                    <div className="nr-card-dist">{dist} mi</div>
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="nr-card-map">Open in Maps ↗</a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
