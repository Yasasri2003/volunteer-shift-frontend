// src/api/auth.js
import { apiRequest } from './client';

export const registerUser = (payload) => apiRequest('/auth/register', { method: 'POST', body: payload });
export const loginUser = (payload) => apiRequest('/auth/login', { method: 'POST', body: payload });
export const resendVerification = (email) => apiRequest('/auth/resend-verification', { method: 'POST', body: { email } });
export const googleLogin = (credential) => apiRequest('/auth/google', { method: 'POST', body: { credential } });
export const forgotPassword = (email) => apiRequest('/auth/forgot-password', { method: 'POST', body: { email } });
export const resetPassword = (token, password, confirmPassword) =>
  apiRequest('/auth/reset-password', { method: 'POST', body: { token, password, confirmPassword } });
