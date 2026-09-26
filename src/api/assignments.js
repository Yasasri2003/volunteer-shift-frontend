// src/api/assignments.js
import { apiRequest } from './client';

export const signUpForShift = (shiftId, token) =>
  apiRequest(`/shifts/${shiftId}/signup`, { method: 'POST', token });

export const cancelAssignment = (assignmentId, token) =>
  apiRequest(`/assignments/${assignmentId}`, { method: 'DELETE', token });

export const checkIn = (assignmentId, token) =>
  apiRequest(`/assignments/${assignmentId}/checkin`, { method: 'POST', token });

export const checkOut = (assignmentId, token) =>
  apiRequest(`/assignments/${assignmentId}/checkout`, { method: 'POST', token });

export const markNoShow = (assignmentId, token) =>
  apiRequest(`/assignments/${assignmentId}/no-show`, { method: 'POST', token });
