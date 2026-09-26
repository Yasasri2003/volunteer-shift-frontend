// src/pages/ResetPassword.jsx
import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { resetPassword } from '../api/auth';
import { getPasswordIssues } from '../utils/validatePassword';
import PasswordInput from '../components/PasswordInput';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const issues = getPasswordIssues(password);
  const passwordsMatch = confirmPassword.length === 0 || password === confirmPassword;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (issues.length > 0) {
      setError(`Password needs ${issues.join(', ')}`);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password, confirmPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="auth-shell">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <h1>Invalid link</h1>
          <p className="muted" style={{ marginBottom: 20 }}>This password reset link is missing its token.</p>
          <Link to="/forgot-password" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Request a new link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-icon"><ShieldCheck size={24} /></div>
        <h1>Set a new password</h1>
        <p className="muted" style={{ marginBottom: 22 }}>Choose a strong password for your account.</p>

        {error && <div className="error-banner"><AlertCircle size={16} />{error}</div>}
        {success && <div className="success-banner"><CheckCircle2 size={16} />Password reset — taking you to login…</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>New password</label>
            <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoFocus />
            {password.length > 0 && (
              <p className="muted" style={{ fontSize: '0.78rem', marginTop: 5, marginBottom: 0, color: issues.length ? 'var(--color-danger)' : 'var(--color-success)' }}>
                {issues.length ? `Needs: ${issues.join(', ')}` : '✓ Strong password'}
              </p>
            )}
          </div>
          <div className="field">
            <label>Confirm new password</label>
            <PasswordInput value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p style={{ color: 'var(--color-danger)', fontSize: '0.78rem', marginTop: 5, marginBottom: 0 }}>Passwords do not match</p>
            )}
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} disabled={loading}>
            {loading ? 'Resetting…' : 'Reset password'}
          </button>
        </form>
      </div>
    </div>
  );
}
