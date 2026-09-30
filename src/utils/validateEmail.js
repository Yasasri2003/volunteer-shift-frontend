// src/utils/validateEmail.js
//
// Mirrors backend/utils/validateEmail.js — used for instant feedback in the
// UI. The backend re-checks the same rule regardless, so this can't be
// bypassed by editing frontend code.
const EMAIL_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9._%+-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

export function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length === 0 || trimmed.length > 254) return false;
  if (trimmed.includes('..')) return false;
  return EMAIL_REGEX.test(trimmed);
}
