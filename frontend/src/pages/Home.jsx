import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { CATEGORIES } from '../constants.js';
import ListingCard from '../components/ListingCard.jsx';
import CategoryCard from '../components/CategoryCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import ErrorState from '../components/ErrorState.jsx';

export default function Home() {
  const navigate = useNavigate();
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true); setError('');
    api.get('/listings?status=AVAILABLE').then((rows) => setRecent(rows.slice(0, 4)))
      .catch(() => setError('Unable to load items.')).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const steps = [
    ['1. LIST', 'Create a listing for an item you no longer need.'],
    ['2. REQUEST', 'Another student requests the item.'],
    ['3. ACCEPT', 'The owner accepts or rejects the request.'],
    ['4. CONTACT', 'Contact details are revealed after acceptance.'],
    ['5. REUSE', 'Students arrange the physical handover.'],
  ];

  return (
    <>
      <section className="hero">
        <h1>CampusCycle</h1>
        <h2>Give. Reuse. Keep it in the Campus.</h2>
        <p>A student-only platform for giving away and reusing useful items within the college.</p>
        <div className="hero-actions">
          <Link to="/listings" className="btn btn-light">Browse Items</Link>
          <Link to="/create-listing" className="btn btn-ghost">Give an Item</Link>
        </div>
        <SearchBar big onSearch={(text) => navigate(`/listings?search=${encodeURIComponent(text)}`)} />
      </section>

      <h2>Browse Categories</h2>
      <div className="grid cats">{CATEGORIES.map((c) => <CategoryCard key={c.name} category={c} />)}</div>

      <h2>Recently Added</h2>
      {loading && <p className="muted">Loading items...</p>}
      {error && <ErrorState message={error} onRetry={load} />}
      <div className="grid">{recent.map((l) => <ListingCard key={l.id} listing={l} />)}</div>

      <h2>How CampusCycle Works</h2>
      <div className="grid steps">
        {steps.map(([title, text]) => <div className="card card-body" key={title}><h3>{title}</h3><p className="muted">{text}</p></div>)}
      </div>
      <footer className="footer">© CampusCycle · Rajagiri School of Engineering & Technology</footer>
    </>
  );
}
