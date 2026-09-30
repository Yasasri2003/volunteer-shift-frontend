// src/pages/ForgotPassword.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, AlertCircle, MailCheck } from 'lucide-react';
import { forgotPassword } from '../api/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="auth-shell">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="auth-icon" style={{ margin: '0 auto 16px', background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
            <MailCheck size={24} />
          </div>
          <h1>Check your email</h1>
          <p className="muted" style={{ marginBottom: 20 }}>
            If <strong>{email}</strong> is registered with a password, we've sent a link to reset it.
          </p>
          <Link to="/login" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Back to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-icon"><KeyRound size={24} /></div>
        <h1>Forgot your password?</h1>
        <p className="muted" style={{ marginBottom: 22 }}>
          Enter your email and we'll send you a link to reset it.
        </p>

        {error && <div className="error-banner"><AlertCircle size={16} />{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <p className="muted" style={{ marginTop: 20, textAlign: 'center' }}>
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
