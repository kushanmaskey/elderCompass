import { useState } from 'react';
import SearchBar from '../components/SearchBar';
import HomeCard from '../components/HomeCard';
import { searchByZipcode, searchByCityState } from '../api/homes';
import './Home.css';

export default function Home() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastQuery, setLastQuery] = useState('');

  async function handleSearch(query) {
    setLoading(true);
    setError('');
    setResults(null);

    try {
      let res;
      if (query.type === 'zipcode') {
        setLastQuery(`ZIP code ${query.zipcode}`);
        res = await searchByZipcode(query.zipcode);
      } else {
        setLastQuery(`${query.city}, ${query.state}`);
        res = await searchByCityState(query.city, query.state);
      }
      setResults(res.data.results);
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="home-page">
      <header className="hero">
        <div className="hero-content">
          <h1 className="hero-title">ElderCompass</h1>
          <p className="hero-subtitle">
            Find trusted senior living communities near you.
          </p>
          <SearchBar onSearch={handleSearch} loading={loading} />
        </div>
      </header>

      <main className="results-section">
        {error && (
          <div className="results-error">
            <p>{error}</p>
          </div>
        )}

        {results !== null && !error && (
          <>
            <h2 className="results-heading">
              {results.length > 0
                ? `${results.length} home${results.length !== 1 ? 's' : ''} found near ${lastQuery}`
                : `No senior homes found near ${lastQuery}`}
            </h2>
            {results.length === 0 && (
              <p className="results-empty">
                Try a nearby ZIP code or a different city to expand your search.
              </p>
            )}
            <div className="results-grid">
              {results.map((home) => (
                <HomeCard key={home.id} home={home} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
