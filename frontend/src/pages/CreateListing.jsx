import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api.js';
import { CATEGORIES, CONDITIONS } from '../constants.js';

const empty = { title: '', description: '', category: 'Books', condition: 'GOOD', image_url: '', location: '' };

// Used for both creating (/create-listing) and editing (/edit-listing/:id)
export default function CreateListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  useEffect(() => {
    if (id) api.get(`/listings/${id}`).then(setForm).catch((err) => setError(err.message));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.location) return setError('Please fill all required fields.');
    try {
      const saved = id ? await api.put(`/listings/${id}`, form) : await api.post('/listings', form);
      navigate(`/listings/${saved.id}`);
    } catch (err) { setError(err.message); }
  };

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>{id ? 'Edit Item' : 'Give an Item'}</h2>
      {error && <p className="error">{error}</p>}
      <label>Title *<input value={form.title} onChange={set('title')} /></label>
      <label>Description *<textarea rows="3" value={form.description || ''} onChange={set('description')} /></label>
      <label>Category<select value={form.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c.name}>{c.name}</option>)}</select></label>
      <label>Condition<select value={form.condition} onChange={set('condition')}>{Object.entries(CONDITIONS).map(([v, label]) => <option key={v} value={v}>{label}</option>)}</select></label>
      <label>Image URL<input value={form.image_url || ''} onChange={set('image_url')} placeholder="https://..." /></label>
      <label>Location *<input value={form.location || ''} onChange={set('location')} placeholder="RSET Campus" /></label>
      <button className="btn">{id ? 'Save Changes' : 'List Item'}</button>
    </form>
  );
}
