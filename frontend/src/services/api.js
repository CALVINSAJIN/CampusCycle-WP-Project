const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, method = 'GET', body) {
  const token = localStorage.getItem('token');
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Request failed');
  return json.data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, 'POST', body),
  put: (path, body) => request(path, 'PUT', body),
  del: (path) => request(path, 'DELETE'),
};
