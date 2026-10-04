import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { DEPARTMENTS } from '../constants.js';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', phone: '', department: 'CSE' });
  const [error, setError] = useState('');
  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return setError('Please fill all required fields.');
    if (!form.email.endsWith('@rajagiri.edu.in')) return setError('Use your @rajagiri.edu.in email.');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    setError('');
    const { confirm, ...data } = form;
    try { await register(data); navigate('/listings'); }
    catch (err) { setError(err.message); }
  };

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>Join CampusCycle</h2>
      {error && <p className="error">{error}</p>}
      <label>Name *<input value={form.name} onChange={set('name')} /></label>
      <label>College Email *<input type="email" value={form.email} onChange={set('email')} placeholder="you@rajagiri.edu.in" /></label>
      <label>Password * (min 6 characters)<input type="password" value={form.password} onChange={set('password')} /></label>
      <label>Confirm Password *<input type="password" value={form.confirm} onChange={set('confirm')} /></label>
      <label>Department<select value={form.department} onChange={set('department')}>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</select></label>
      <label>Phone (shown to the other student after a request is accepted)<input value={form.phone} onChange={set('phone')} /></label>
      <button className="btn">Register</button>
      <p className="muted">Already registered? <Link to="/login">Login</Link></p>
    </form>
  );
}
