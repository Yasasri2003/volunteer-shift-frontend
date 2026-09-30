// src/pages/Register.jsx
import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, AlertCircle, MailCheck, HeartHandshake, ClipboardCheck, ShieldCheck, Camera, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isValidEmail } from '../utils/validateEmail';
import { getPasswordIssues } from '../utils/validatePassword';
import { uploadProfilePicture } from '../api/users';
import PasswordInput from '../components/PasswordInput';
import GoogleSignInButton from '../components/GoogleSignInButton';

export default function Register() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'volunteer' });
  const [emailTouched, setEmailTouched] = useState(false);
  const [pictureFile, setPictureFile] = useState(null);
  const [picturePreview, setPicturePreview] = useState(null);
  const [error, setError] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState(null);
  const [loading, setLoading] = useState(false);

  const emailIsValid = form.email.length === 0 || isValidEmail(form.email);
  const passwordIssues = getPasswordIssues(form.password);

  function update(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  function handlePictureSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setError('Image must be smaller than 3MB');
      return;
    }
    setPictureFile(file);
    setPicturePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!isValidEmail(form.email)) {
      setEmailTouched(true);
      setError('Please enter a real, valid email address.');
      return;
    }
    if (passwordIssues.length > 0) {
      setError(`Password needs ${passwordIssues.join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      // The server independently re-verifies the email is real (syntax,
      // not disposable, AND actually sends a confirmation link — the only
      // way to prove someone can really access an inbox) and re-checks
      // the password strength, regardless of what the UI already caught.
      await register(form);
      setRegisteredEmail(form.email);
    } catch (err) {
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
      if (pictureFile) {
        try {
          const token = localStorage.getItem('token');
          await uploadProfilePicture(pictureFile, token);
        } catch {
          // Non-fatal — they can add it later from Settings.
        }
      }
      navigate('/events');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginWithGoogle, pictureFile, navigate]);

  function goToLogin() {
    navigate('/login', { state: { email: form.email, pendingPictureFile: pictureFile } });
  }

  if (registeredEmail) {
    return (
      <div className="auth-shell">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="auth-icon" style={{ margin: '0 auto 16px', background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
            <MailCheck size={24} />
          </div>
          <h1>Check your email</h1>
          <p className="muted" style={{ marginBottom: 8 }}>We sent a verification link to</p>
          <p style={{ fontWeight: 600, marginBottom: 20 }}>{registeredEmail}</p>
          <p className="muted" style={{ fontSize: '0.85rem', marginBottom: 24 }}>
            Click the link in that email to activate your account, then come back and log in.
            {pictureFile && ' Your profile picture will be uploaded automatically on your first login.'}
          </p>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={goToLogin}>
            I've verified — take me to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-icon"><UserPlus size={24} /></div>
        <h1>Create an account</h1>
        <p className="muted" style={{ marginBottom: 22 }}>
          Register as an organizer or volunteer.
        </p>

        {error && <div className="error-banner"><AlertCircle size={16} />{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                background: picturePreview ? 'transparent' : 'var(--color-bg-deep)',
                border: '2px dashed var(--color-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {picturePreview ? (
                <img src={picturePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={20} color="var(--color-text-muted)" />
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                <Camera size={13} /> {picturePreview ? 'Change photo' : 'Add photo (optional)'}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handlePictureSelect} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          <div className="field">
            <label>Username</label>
            <input value={form.name} onChange={(e) => update('name', e.target.value)} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              onBlur={() => setEmailTouched(true)}
              required
              style={emailTouched && !emailIsValid ? { borderColor: 'var(--color-danger)' } : undefined}
            />
            {emailTouched && !emailIsValid && form.email.length > 0 ? (
              <p style={{ color: 'var(--color-danger)', fontSize: '0.78rem', marginTop: 5, marginBottom: 0 }}>
                That doesn't look like a real email address (needs a proper domain, e.g. name@gmail.com)
              </p>
            ) : (
              <p className="muted" style={{ fontSize: '0.78rem', marginTop: 5, marginBottom: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                <ShieldCheck size={12} /> We'll send a real verification link to this address
              </p>
            )}
          </div>
          <div className="field">
            <label>Password</label>
            <PasswordInput value={form.password} onChange={(e) => update('password', e.target.value)} required minLength={8} />
            {form.password.length > 0 && (
              <p style={{ fontSize: '0.78rem', marginTop: 5, marginBottom: 0, color: passwordIssues.length ? 'var(--color-danger)' : 'var(--color-success)' }}>
                {passwordIssues.length ? `Needs: ${passwordIssues.join(', ')}` : '✓ Strong password'}
              </p>
            )}
          </div>
          <div className="field">
            <label>I am a…</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <RoleOption
                icon={<HeartHandshake size={18} />}
                label="Volunteer"
                active={form.role === 'volunteer'}
                onClick={() => update('role', 'volunteer')}
              />
              <RoleOption
                icon={<ClipboardCheck size={18} />}
                label="Organizer"
                active={form.role === 'organizer'}
                onClick={() => update('role', 'organizer')}
              />
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} disabled={loading}>
            {loading ? 'Sending verification email…' : 'Register'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
          <span className="muted" style={{ fontSize: '0.78rem' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
        </div>

        <GoogleSignInButton onCredential={handleGoogleCredential} onError={setError} text="signup_with" />

        <p className="muted" style={{ marginTop: 20, textAlign: 'center' }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

function RoleOption({ icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        padding: '10px 10px',
        borderRadius: 'var(--radius-sm)',
        border: `1.5px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
        background: active ? 'var(--color-primary-light)' : 'var(--color-bg)',
        color: active ? 'var(--color-primary-dark)' : 'var(--color-text-muted)',
        fontWeight: 600,
        fontSize: '0.85rem',
        transition: 'all 0.15s ease',
      }}
    >
      {icon}
      {label}
    </button>
  );
}
