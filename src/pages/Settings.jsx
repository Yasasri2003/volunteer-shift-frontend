// src/pages/Settings.jsx
import { useRef, useState } from 'react';
import { Camera, Save, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { updateMyProfile, uploadProfilePicture } from '../api/users';
import Avatar from '../components/Avatar';

export default function Settings() {
  const { user, token, updateUser } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handlePictureChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      showToast('Image must be smaller than 3MB', 'error');
      return;
    }

    setUploading(true);
    try {
      const data = await uploadProfilePicture(file, token);
      updateUser({ profile_picture: data.profile_picture });
      showToast('Profile picture updated', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUploading(false);
      e.target.value = ''; // allow re-selecting the same file later
    }
  }

  async function handleSaveDetails(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await updateMyProfile({ name, phone }, token);
      updateUser(data.user);
      showToast('Profile updated', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="muted">Manage your profile picture and account details.</p>
        </div>
      </div>

      <div className="card animate-in" style={{ marginBottom: 16 }}>
        <h3>Profile picture</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 12 }}>
          <Avatar user={user} size={72} />
          <div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Camera size={14} /> {uploading ? 'Uploading…' : 'Change picture'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handlePictureChange}
              style={{ display: 'none' }}
            />
            <p className="muted" style={{ marginTop: 8, marginBottom: 0, fontSize: '0.8rem' }}>
              JPG, PNG, WEBP or GIF · up to 3MB
            </p>
          </div>
        </div>
      </div>

      <div className="card animate-in" style={{ animationDelay: '0.05s' }}>
        <h3>Account details</h3>
        <form onSubmit={handleSaveDetails} style={{ marginTop: 12 }}>
          <div className="field">
            <label>Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="field">
            <label>Phone (optional)</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+94 7X XXX XXXX" />
          </div>

          <div className="field">
            <label><Mail size={13} style={{ verticalAlign: -2 }} /> Email</label>
            <input value={user?.email || ''} disabled style={{ opacity: 0.65, cursor: 'not-allowed' }} />
            <p className="muted" style={{ marginTop: 6, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Lock size={12} /> Email can't be changed here — it was verified as a real address at registration.
            </p>
          </div>

          <button className="btn btn-primary" disabled={saving}>
            <Save size={15} /> {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
