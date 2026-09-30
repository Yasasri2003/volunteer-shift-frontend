// src/api/client.js
//
// Every API call in the app goes through this one function.
// It automatically attaches the JWT token (if the user is logged in)
// and throws a readable error if the backend returns a non-2xx status.

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://volunteer-shift-backend.onrender.com';
const BASE_URL = `${API_BASE_URL}/api`;

export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = {};
  try {
    data = await res.json();
  } catch {
    // some endpoints (like DELETE) may return no body
  }

  if (!res.ok) {
    const error = new Error(data.error || `Request failed (${res.status})`);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}