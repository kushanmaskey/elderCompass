import { useState } from 'react';
import './SearchBar.css';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
];

export default function SearchBar({ onSearch, loading }) {
  const [mode, setMode] = useState('zipcode');
  const [zipcode, setZipcode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [error, setError] = useState('');

  function validate() {
    if (mode === 'zipcode') {
      if (!/^\d{5}(-\d{4})?$/.test(zipcode)) {
        setError('Please enter a valid 5-digit ZIP code.');
        return false;
      }
    } else {
      if (!city.trim()) { setError('Please enter a city.'); return false; }
      if (!state) { setError('Please select a state.'); return false; }
    }
    setError('');
    return true;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    if (mode === 'zipcode') {
      onSearch({ type: 'zipcode', zipcode });
    } else {
      onSearch({ type: 'cityState', city: city.trim(), state });
    }
  }

  return (
    <div className="search-bar">
      <div className="mode-toggle">
        <button
          className={mode === 'zipcode' ? 'active' : ''}
          onClick={() => { setMode('zipcode'); setError(''); }}
          type="button"
        >
          Search by ZIP Code
        </button>
        <button
          className={mode === 'cityState' ? 'active' : ''}
          onClick={() => { setMode('cityState'); setError(''); }}
          type="button"
        >
          Search by City &amp; State
        </button>
      </div>

      <form onSubmit={handleSubmit} className="search-form">
        {mode === 'zipcode' ? (
          <input
            type="text"
            placeholder="Enter ZIP code (e.g. 90210)"
            value={zipcode}
            onChange={(e) => setZipcode(e.target.value)}
            maxLength={10}
            className="search-input"
          />
        ) : (
          <div className="city-state-inputs">
            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="search-input city-input"
            />
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="search-input state-select"
            >
              <option value="">State</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}

        {error && <p className="search-error">{error}</p>}

        <button type="submit" className="search-btn" disabled={loading}>
          {loading ? 'Searching…' : 'Find Senior Homes'}
        </button>
      </form>
    </div>
  );
}
