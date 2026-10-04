import { CATEGORIES, CONDITIONS, STATUSES } from '../constants.js';

// Three dropdown filters. Values live in the URL (see Listings.jsx), so this stays stateless.
export default function FilterBar({ category, condition, status, onChange }) {
  return (
    <div className="filters">
      <select value={category} onChange={(e) => onChange({ category: e.target.value })} aria-label="Category">
        <option value="">All categories</option>
        {CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
      </select>
      <select value={condition} onChange={(e) => onChange({ condition: e.target.value })} aria-label="Condition">
        <option value="">All conditions</option>
        {Object.entries(CONDITIONS).map(([v, label]) => <option key={v} value={v}>{label}</option>)}
      </select>
      <select value={status} onChange={(e) => onChange({ status: e.target.value })} aria-label="Status">
        <option value="">All statuses</option>
        {Object.entries(STATUSES).map(([v, label]) => <option key={v} value={v}>{label}</option>)}
      </select>
    </div>
  );
}
