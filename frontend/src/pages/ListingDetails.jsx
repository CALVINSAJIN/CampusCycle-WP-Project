import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { CONDITIONS, STATUSES } from '../constants.js';
import OwnerPreview from '../components/OwnerPreview.jsx';
import ErrorState from '../components/ErrorState.jsx';

const FALLBACK = 'https://placehold.co/600x400?text=No+Image';

export default function ListingDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');

  const load = () => { setLoadError(''); api.get(`/listings/${id}`).then(setListing).catch((e) => setLoadError(e.message)); };
  useEffect(load, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this item?')) return;
    try { await api.del(`/listings/${id}`); navigate('/profile'); } catch (e) { setError(e.message); }
  };
  const completeHandover = async () => {
    try { setListing({ ...listing, ...(await api.put(`/listings/${id}/status`, { status: 'COMPLETED' })) }); } catch (e) { setError(e.message); }
  };
  const sendRequest = async (e) => {
    e.preventDefault(); setError('');
    if (!message.trim()) return setError('Please write a short message.');
    try { await api.post('/requests', { listing_id: Number(id), message }); setNotice('Request sent (PENDING). Contact details are shared once the owner accepts.'); setShowForm(false); }
    catch (err) { setError(err.message); }
  };

  if (loadError) return <ErrorState message={loadError} onRetry={load} />;
  if (!listing) return <p className="muted">Loading item...</p>;
  const isOwner = user && user.id === listing.user_id;

  return (
    <div className="card details">
      <img src={listing.image_url || FALLBACK} alt={listing.title} onError={(e) => { e.target.src = FALLBACK; }} />
      <div className="card-body">
        <h1>{listing.title}</h1>
        <span className={`badge status ${listing.status}`}>{STATUSES[listing.status]}</span>
        <p>{listing.description}</p>
        <p className="muted">{listing.category}</p>
        <p className={`cond ${listing.condition}`}>● {CONDITIONS[listing.condition]} Condition</p>
        <p className="muted">📍 {listing.location}</p>
        <OwnerPreview name={listing.owner_name} department={listing.owner_department} />
        {error && <p className="error">{error}</p>}
        {notice && <p className="success">{notice}</p>}
        <div className="actions">
          {isOwner && (<>
            <Link to={`/edit-listing/${id}`} className="btn">Edit</Link>
            {listing.status === 'RESERVED' && <button className="btn btn-outline" onClick={completeHandover}>Mark Handover Complete</button>}
            <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
          </>)}
          {!isOwner && user && listing.status === 'AVAILABLE' && !showForm && !notice && <button className="btn" onClick={() => setShowForm(true)}>Request Item</button>}
          {!isOwner && listing.status !== 'AVAILABLE' && <p className="muted">This item is {listing.status.toLowerCase()} and cannot be requested.</p>}
          {!user && listing.status === 'AVAILABLE' && <Link to="/login" className="btn">Login to request</Link>}
        </div>
        {showForm && (
          <form onSubmit={sendRequest} className="enquiry-form">
            <label>Why do you need this item?<textarea rows="3" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="I need this for my semester exams." /></label>
            <button className="btn">Send Request</button>
          </form>
        )}
      </div>
    </div>
  );
}
