import { Link } from 'react-router-dom';
import { CONDITIONS, STATUSES } from '../constants.js';

const FALLBACK = 'https://placehold.co/600x400?text=No+Image';

export default function ListingCard({ listing }) {
  return (
    <div className="card listing-card">
      <div className="img-wrap">
        <img src={listing.image_url || FALLBACK} alt={listing.title} onError={(e) => { e.target.src = FALLBACK; }} />
        <span className={`badge status ${listing.status}`}>{STATUSES[listing.status]}</span>
      </div>
      <div className="card-body">
        <h3>{listing.title}</h3>
        <p className="muted">{listing.category}</p>
        <p className={`cond ${listing.condition}`}>● {CONDITIONS[listing.condition]} Condition</p>
        <p className="muted">📍 {listing.location}</p>
        {listing.owner_name && <p className="muted">👤 {listing.owner_name}</p>}
        <Link to={`/listings/${listing.id}`} className="view-link">View Item →</Link>
      </div>
    </div>
  );
}
