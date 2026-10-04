import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return setError('Please fill all required fields.');
    setBusy(true); setError('');
    try { await login(form.email, form.password); navigate('/listings'); }
    catch (err) { setError(err.message); }
    setBusy(false);
  };

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>Welcome back</h2>
      {error && <p className="error">{error}</p>}
      <label>College Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@rajagiri.edu.in" /></label>
      <label>Password<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
      <button className="btn" disabled={busy}>{busy ? 'Logging in...' : 'Login'}</button>
      <p className="muted">New here? <Link to="/register">Create an account</Link></p>
    </form>
  );
}
