// src/api/events.js
import { apiRequest } from './client';

export const getEvents = (token) => apiRequest('/events', { token });
export const getTodaysEvents = (token) => apiRequest('/events/today', { token });
export const getEventById = (id, token) => apiRequest(`/events/${id}`, { token });
export const createEvent = (payload, token) => apiRequest('/events', { method: 'POST', body: payload, token });

export const getShiftsForEvent = (eventId, token) => apiRequest(`/events/${eventId}/shifts`, { token });
export const createShift = (eventId, payload, token) =>
  apiRequest(`/events/${eventId}/shifts`, { method: 'POST', body: payload, token });
