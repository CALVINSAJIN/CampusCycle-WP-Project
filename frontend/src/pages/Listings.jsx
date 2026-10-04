import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api.js';
import ListingCard from '../components/ListingCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import FilterBar from '../components/FilterBar.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';

export default function Listings() {
  const [params, setParams] = useSearchParams();
  const search = params.get('search') || '';
  const category = params.get('category') || '';
  const condition = params.get('condition') || '';
  const status = params.get('status') || '';
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters live in the URL; re-fetch whenever any of them changes
  const load = () => {
    setLoading(true); setError('');
    const query = new URLSearchParams();
    Object.entries({ search, category, condition, status }).forEach(([k, v]) => v && query.set(k, v));
    api.get(`/listings?${query}`).then(setListings).catch(() => setError('Unable to load items.')).finally(() => setLoading(false));
  };
  useEffect(load, [search, category, condition, status]);

  const update = (changes) => {
    const next = Object.fromEntries(params);
    Object.entries(changes).forEach(([k, v]) => (v ? (next[k] = v) : delete next[k]));
    setParams(next);
  };

  return (
    <>
      <h1>Browse Items</h1>
      <SearchBar initial={search} onSearch={(text) => update({ search: text })} />
      <FilterBar category={category} condition={condition} status={status} onChange={update} />
      {loading && <p className="muted">Loading items...</p>}
      {error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && (
        listings.length === 0
          ? <EmptyState title="No items found" text="Try another search or category." />
          : <p className="muted">{listings.length} {listings.length === 1 ? 'item' : 'items'} found</p>
      )}
      <div className="grid">{listings.map((l) => <ListingCard key={l.id} listing={l} />)}</div>
    </>
  );
}
