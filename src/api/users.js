// src/api/users.js
import { apiRequest } from './client';

const BASE_URL = 'http://localhost:5000';

export const getMyProfile = (token) => apiRequest('/users/me', { token });
export const updateMyProfile = (payload, token) =>
  apiRequest('/users/me', { method: 'PUT', body: payload, token });

// File upload needs FormData, not JSON — bypasses apiRequest's JSON body handling
export async function uploadProfilePicture(file, token) {
  const formData = new FormData();
  formData.append('picture', file);

  const res = await fetch(`${BASE_URL}/api/users/me/picture`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }, // no Content-Type — browser sets multipart boundary
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || 'Upload failed');
    error.status = res.status;
    throw error;
  }
  return data;
}

// Builds the full image URL from a stored filename (or null for no picture)
export function profilePictureUrl(filename) {
  if (!filename) return null;
  return `${BASE_URL}/uploads/${filename}`;
}
