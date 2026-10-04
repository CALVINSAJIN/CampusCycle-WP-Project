import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ListingCard from '../components/ListingCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';

// Opens WhatsApp with a pre-filled message (assumes Indian 10-digit numbers)
const whatsappLink = (phone) => {
  const digits = (phone || '').replace(/\D/g, '');
  const number = digits.length === 10 ? '91' + digits : digits;
  const text = encodeURIComponent('Hi, I requested your item on CampusCycle. When can I collect it?');
  return `https://wa.me/${number}?text=${text}`;
};

// Contact details only appear for ACCEPTED requests (the backend also hides them otherwise)
function Contact({ request, forOwner }) {
  if (request.status === 'PENDING')
    return forOwner ? null : <p className="muted">🔒 Contact details will be available after the request is accepted.</p>;
  if (request.status !== 'ACCEPTED') return null;
  const name = forOwner ? request.requester_name : request.owner_name;
  const phone = forOwner ? request.requester_phone : request.owner_phone;
  const email = forOwner ? request.requester_email : request.owner_email;
  return (
    <div className="contact">
      <b>✓ Request Accepted</b>
      <p>{forOwner ? 'Requester' : 'Owner'}: {name}</p>
      <p>📞 Phone: {phone || 'Not provided'}</p>
      <p>✉️ Email: {email}</p>
      {phone && !forOwner && <a className="btn" href={whatsappLink(phone)} target="_blank" rel="noreferrer">💬 Contact on WhatsApp</a>}
      {phone && forOwner && <a className="btn btn-outline" href={whatsappLink(phone)} target="_blank" rel="noreferrer">💬 WhatsApp requester</a>}
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () =>
    Promise.all([api.get('/listings'), api.get('/requests')])
      .then(([all, reqs]) => { setItems(all.filter((l) => l.user_id === user.id)); setRequests(reqs); })
      .catch((e) => setError(e.message)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const respond = async (requestId, status) => {
    setError('');
    try { await api.put(`/requests/${requestId}`, { status }); load(); } catch (e) { setError(e.message); }
  };

  const mine = requests.filter((r) => r.requester_id === user.id);
  const received = requests.filter((r) => r.owner_id === user.id);

  return (
    <>
      <h1>Welcome back, {user.name.split(' ')[0]} 👋</h1>
      <div className="grid stats">
        <div className="card stat"><b>{items.length}</b><span>My Items</span></div>
        <div className="card stat"><b>{mine.length}</b><span>My Requests</span></div>
        <div className="card stat"><b>{items.filter((l) => l.status === 'COMPLETED').length}</b><span>Completed</span></div>
      </div>
      <div className="card card-body">
        <p><b>Name:</b> {user.name}</p>
        <p><b>Email:</b> {user.email}</p>
        <p><b>Phone:</b> {user.phone || '-'}</p>
        <p><b>Department:</b> {user.department || '-'}</p>
      </div>
      {loading && <p className="muted">Loading...</p>}
      {error && <ErrorState message={error} onRetry={() => { setError(''); load(); }} />}

      <h2>My Listings</h2>
      {!loading && items.length === 0 && <EmptyState title="You haven't listed any items yet."><Link to="/create-listing" className="btn">Give an Item</Link></EmptyState>}
      <div className="grid">{items.map((l) => <ListingCard key={l.id} listing={l} />)}</div>

      <h2>My Requests</h2>
      {!loading && mine.length === 0 && <p className="muted">You haven't requested any items.</p>}
      {mine.map((r) => (
        <div className="card card-body row" key={r.id}>
          <div><b>{r.listing_title}</b><p className="muted">Your message: {r.message}</p></div>
          <div><span className={`badge ${r.status}`}>{r.status}</span><Contact request={r} /></div>
        </div>
      ))}

      <h2>Received Requests</h2>
      {!loading && received.length === 0 && <p className="muted">No requests received.</p>}
      {received.map((r) => (
        <div className="card card-body row" key={r.id}>
          <div><b>{r.listing_title}</b><p className="muted">Request from {r.requester_name}: {r.message}</p></div>
          <div>
            <div className="actions">
              <span className={`badge ${r.status}`}>{r.status}</span>
              {r.status === 'PENDING' && r.listing_status === 'AVAILABLE' && (<>
                <button className="btn" onClick={() => respond(r.id, 'ACCEPTED')}>Accept</button>
                <button className="btn btn-danger" onClick={() => respond(r.id, 'REJECTED')}>Reject</button>
              </>)}
            </div>
            <Contact request={r} forOwner />
          </div>
        </div>
      ))}
    </>
  );
}
