// src/utils/validatePassword.js
//
// Mirrors backend/utils/validatePassword.js — used for instant feedback
// in the UI. The backend re-checks the same rule regardless.

export function getPasswordIssues(password) {
  const issues = [];
  if (typeof password !== 'string' || password.length < 8) {
    issues.push('at least 8 characters');
  }
  if (!/[a-zA-Z]/.test(password)) {
    issues.push('a letter');
  }
  if (!/[0-9]/.test(password)) {
    issues.push('a number');
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    issues.push('a symbol (e.g. ! @ # $ %)');
  }
  return issues;
}

export function isStrongPassword(password) {
  return getPasswordIssues(password).length === 0;
}
