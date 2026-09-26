// src/pages/Login.jsx
import { useState, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Sprout, AlertCircle, MailCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { resendVerification } from '../api/auth';
import { uploadProfilePicture } from '../api/users';
import PasswordInput from '../components/PasswordInput';
import GoogleSignInButton from '../components/GoogleSignInButton';

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const pendingPictureFile = location.state?.pendingPictureFile || null;

  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendStatus, setResendStatus] = useState('');
  const [loading, setLoading] = useState(false);

  async function afterLoginSuccess() {
    if (pendingPictureFile) {
      try {
        const token = localStorage.getItem('token');
        await uploadProfilePicture(pendingPictureFile, token);
      } catch {
        // Non-fatal — they can always add it later from Settings.
      }
    }
    navigate('/events');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setNeedsVerification(false);
    setLoading(true);
    try {
      await login(email, password);
      await afterLoginSuccess();
    } catch (err) {
      if (err.data?.code === 'EMAIL_NOT_VERIFIED') {
        setNeedsVerification(true);
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleCredential = useCallback(async (credential) => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle(credential);
      await afterLoginSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [loginWithGoogle]);

  async function handleResend() {
    setResendStatus('Sending…');
    try {
      const data = await resendVerification(email);
      setResendStatus(data.message);
    } catch (err) {
      setResendStatus(err.message);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-icon"><Sprout size={24} /></div>
        <h1>Welcome back</h1>
        <p className="muted" style={{ marginBottom: 22 }}>
          Log in to manage or join volunteer shifts.
        </p>

        {error && (
          <div className="error-banner" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><AlertCircle size={16} />{error}</div>
            {needsVerification && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleResend} style={{ marginTop: 4 }}>
                <MailCheck size={13} /> Resend verification email
              </button>
            )}
            {resendStatus && <p className="muted" style={{ margin: 0, fontSize: '0.8rem' }}>{resendStatus}</p>}
          </div>
        )}

        <GoogleSignInButton onCredential={handleGoogleCredential} onError={setError} text="signin_with" />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
          <span className="muted" style={{ fontSize: '0.78rem' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </div>
          <div className="field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <label style={{ marginBottom: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.78rem' }}>Forgot password?</Link>
            </div>
            <div style={{ marginTop: 6 }}>
              <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} disabled={loading}>
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="muted" style={{ marginTop: 20, textAlign: 'center' }}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
