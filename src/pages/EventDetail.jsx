// src/pages/EventDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, CalendarDays, Clock, Plus, Users, ClipboardList, PartyPopper } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getEventById, createShift } from '../api/events';
import { signUpForShift } from '../api/assignments';

export default function EventDetail() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showShiftForm, setShowShiftForm] = useState(false);

  const isStaff = user?.role === 'admin' || user?.role === 'organizer';
  const isVolunteer = user?.role === 'volunteer';

  async function load() {
    setLoading(true);
    try {
      const data = await getEventById(id, token);
      setEvent(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  if (loading) return <div className="skeleton skeleton-card" style={{ marginTop: 20 }} />;
  if (!event) return <div className="error-banner">Event not found</div>;

  return (
    <div>
      <Link to="/events" className="muted" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <ArrowLeft size={15} /> Back to events
      </Link>

      <div className="animate-in" style={{ marginTop: 14, marginBottom: 22 }}>
        <h1>{event.title}</h1>
        <div className="icon-row">
          <MapPin size={14} /> {event.location || 'Location TBD'}
          <span style={{ margin: '0 2px' }}>·</span>
          <CalendarDays size={14} /> {event.start_date}
          {event.end_date !== event.start_date && ` – ${event.end_date}`}
        </div>
        {event.description && <p style={{ marginTop: 10 }}>{event.description}</p>}
      </div>

      {event.sub_events?.length > 0 && (
        <div className="card animate-in" style={{ marginBottom: 16 }}>
          <h3>Sub-events</h3>
          {event.sub_events.map((sub) => (
            <div key={sub.id} style={{ padding: '7px 0', display: 'flex', justifyContent: 'space-between' }}>
              <Link to={`/events/${sub.id}`}>{sub.title}</Link>
              <span className="muted">{sub.start_date}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={19} /> Shifts</h2>
        {isStaff && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowShiftForm((s) => !s)}>
            <Plus size={14} /> {showShiftForm ? 'Cancel' : 'Add shift'}
          </button>
        )}
      </div>

      {showShiftForm && (
        <ShiftForm eventId={id} onCreated={() => { setShowShiftForm(false); load(); showToast('Shift created', 'success'); }} />
      )}

      {event.shifts?.length === 0 ? (
        <div className="empty-state">
          <Clock size={32} />
          <p>No shifts scheduled yet.</p>
        </div>
      ) : (
        event.shifts?.map((shift, i) => (
          <ShiftCard
            key={shift.id}
            shift={shift}
            isStaff={isStaff}
            isVolunteer={isVolunteer}
            onChanged={load}
            delay={i * 0.05}
          />
        ))
      )}
    </div>
  );
}

function ShiftForm({ eventId, onCreated }) {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ shift_date: '', start_time: '', end_time: '', capacity: 5 });
  const [saving, setSaving] = useState(false);

  function update(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await createShift(eventId, form, token);
      onCreated();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card animate-in" style={{ marginBottom: 16 }}>
      <h3>New shift</h3>
      <form onSubmit={handleSubmit}>
        <div className="field-row">
          <div className="field">
            <label>Date</label>
            <input type="date" value={form.shift_date} onChange={(e) => update('shift_date', e.target.value)} required />
          </div>
          <div className="field">
            <label>Capacity</label>
            <input type="number" min="1" value={form.capacity} onChange={(e) => update('capacity', e.target.value)} required />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Start time</label>
            <input type="time" value={form.start_time} onChange={(e) => update('start_time', e.target.value)} required />
          </div>
          <div className="field">
            <label>End time</label>
            <input type="time" value={form.end_time} onChange={(e) => update('end_time', e.target.value)} required />
          </div>
        </div>
        <button className="btn btn-primary" disabled={saving}>{saving ? 'Creating…' : 'Create shift'}</button>
      </form>
    </div>
  );
}

function ShiftCard({ shift, isStaff, isVolunteer, onChanged, delay }) {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);

  const spotsLeft = shift.capacity - shift.spots_filled;
  const isFull = spotsLeft <= 0;
  const fillPct = Math.min(100, Math.round((shift.spots_filled / shift.capacity) * 100));

  async function handleSignup() {
    setBusy(true);
    try {
      const res = await signUpForShift(shift.id, token);
      onChanged();
      if (res.status === 'waitlisted') {
        showToast(res.message, 'info');
      } else {
        showToast('Signed up for the shift', 'success');
      }
    } catch (err) {
      if (err.status === 409 && err.data?.conflict) {
        showToast(
          `Conflicts with "${err.data.conflict.conflicting_event}" (${err.data.conflict.start_time}–${err.data.conflict.end_time})`,
          'error'
        );
      } else {
        showToast(err.message, 'error');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card animate-in" style={{ animationDelay: `${delay}s` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong>{shift.shift_date}</strong>
          <span className="muted" style={{ marginLeft: 10 }}>{shift.start_time} – {shift.end_time}</span>
        </div>
        <div className="icon-row">
          <Users size={14} /> {shift.spots_filled}/{shift.capacity}
          {isFull && <span className="badge badge-waitlisted" style={{ marginLeft: 6 }}>Full</span>}
        </div>
      </div>

      <div className="capacity-bar"><div className="capacity-fill" style={{ width: `${fillPct}%` }} /></div>

      {isVolunteer && (
        <div style={{ marginTop: 14 }}>
          <button className="btn btn-primary btn-sm" onClick={handleSignup} disabled={busy}>
            {isFull ? <ClipboardList size={14} /> : <PartyPopper size={14} />}
            {busy ? 'Signing up…' : isFull ? 'Join waitlist' : 'Sign up'}
          </button>
        </div>
      )}

      {isStaff && (
        <p className="muted" style={{ marginTop: 12, fontSize: '0.82rem' }}>
          Check volunteers in or out from the <Link to={`/reports?date=${shift.shift_date}`}>Reports page</Link> (Daily tab, {shift.shift_date}).
        </p>
      )}
    </div>
  );
}
