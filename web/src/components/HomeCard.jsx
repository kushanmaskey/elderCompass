import { Link } from 'react-router-dom';
import './HomeCard.css';

export default function HomeCard({ home }) {
  return (
    <Link to={`/home/${home.id}`} className="home-card">
      <div className="home-card-header">
        <h3 className="home-name">{home.name}</h3>
        {home.rating && (
          <span className="home-rating">★ {home.rating}</span>
        )}
      </div>
      <p className="home-address">
        {home.address}, {home.city}, {home.state} {home.zipcode}
      </p>
      {home.description && (
        <p className="home-description">{home.description}</p>
      )}
      <div className="home-footer">
        {home.capacity && (
          <span className="home-capacity">Capacity: {home.capacity}</span>
        )}
        <span className="home-cta">View details →</span>
      </div>
    </Link>
  );
}
