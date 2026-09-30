// src/pages/Events.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Plus, X, Sparkles, LayoutGrid, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getEvents, getTodaysEvents, createEvent } from '../api/events';

export default function Events() {
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const [events, setEvents] = useState([]);
  const [todaysEvents, setTodaysEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const isStaff = user?.role === 'admin' || user?.role === 'organizer';

  async function loadEvents() {
    setLoading(true);
    try {
      const [all, today] = await Promise.all([getEvents(token), getTodaysEvents(token)]);
      setEvents(all);
      setTodaysEvents(today);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadEvents(); }, []);

  const totalSubEvents = events.reduce((sum, e) => sum + (e.sub_events?.length || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Events</h1>
          <p className="muted">Browse upcoming events and their shifts.</p>
        </div>
        {isStaff && (
          <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? 'Cancel' : 'New event'}
          </button>
        )}
      </div>

      <div className="stat-grid animate-in" style={{ animationDelay: '0.05s' }}>
        <StatCard icon={<CalendarDays size={18} />} value={events.length} label="Total events" tint="var(--color-primary-light)" iconColor="var(--color-primary)" />
        <StatCard icon={<LayoutGrid size={18} />} value={totalSubEvents} label="Sub-events" tint="var(--color-accent-light)" iconColor="var(--color-accent)" />
        <StatCard icon={<Sparkles size={18} />} value={todaysEvents.length} label="Happening today" tint="var(--color-success-bg)" iconColor="var(--color-success)" />
      </div>

      {showForm && <CreateEventForm onCreated={() => { setShowForm(false); loadEvents(); showToast('Event created', 'success'); }} />}

      {todaysEvents.length > 1 && (
        <div className="card animate-in" style={{ background: 'var(--color-warning-bg)', borderColor: '#E8D6A3', marginBottom: 16 }}>
          <strong>{todaysEvents.length} events are happening today</strong>
          <p className="muted" style={{ margin: '4px 0 0' }}>
            Shift times are checked across all of them — a volunteer can't be double-booked even between unrelated events.
          </p>
        </div>
      )}

      {loading ? (
        <SkeletonList />
      ) : events.length === 0 ? (
        <div className="empty-state">
          <CalendarDays size={36} />
          <p>No events yet.{isStaff && ' Create the first one above.'}</p>
        </div>
      ) : (
        events.map((event, i) => <EventCard key={event.id} event={event} delay={i * 0.05} />)
      )}
    </div>
  );
}

function StatCard({ icon, value, label, tint, iconColor }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: tint, color: iconColor }}>{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function SkeletonList() {
  return (
    <>
      <div className="skeleton skeleton-card" />
      <div className="skeleton skeleton-card" />
    </>
  );
}

function EventCard({ event, delay }) {
  return (
    <div className="card event-card animate-in" style={{ animationDelay: `${delay}s` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ marginBottom: 4 }}>
            <Link to={`/events/${event.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>{event.title}</Link>
          </h2>
          <div className="icon-row">
            <MapPin size={14} /> {event.location || 'Location TBD'}
            <span style={{ margin: '0 2px' }}>·</span>
            <CalendarDays size={14} /> {event.start_date}
            {event.end_date !== event.start_date && ` – ${event.end_date}`}
          </div>
        </div>
        <Link to={`/events/${event.id}`} className="btn btn-secondary btn-sm">
          View shifts <ChevronRight size={14} />
        </Link>
      </div>

      {event.sub_events?.length > 0 && (
        <div className="sub-event-list">
          {event.sub_events.map((sub) => (
            <div key={sub.id} style={{ padding: '7px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link to={`/events/${sub.id}`} style={{ textDecoration: 'none', fontWeight: 500 }}>{sub.title}</Link>
              <span className="muted">{sub.start_date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateEventForm({ onCreated }) {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ title: '', location: '', start_date: '', end_date: '', description: '' });
  const [saving, setSaving] = useState(false);

  function update(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await createEvent(form, token);
      onCreated();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card animate-in" style={{ marginBottom: 16 }}>
      <h3>New event</h3>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Title</label>
          <input value={form.title} onChange={(e) => update('title', e.target.value)} required />
        </div>
        <div className="field-row">
          <div className="field">
            <label>Start date</label>
            <input type="date" value={form.start_date} onChange={(e) => update('start_date', e.target.value)} required />
          </div>
          <div className="field">
            <label>End date</label>
            <input type="date" value={form.end_date} onChange={(e) => update('end_date', e.target.value)} required />
          </div>
        </div>
        <div className="field">
          <label>Location</label>
          <input value={form.location} onChange={(e) => update('location', e.target.value)} />
        </div>
        <button className="btn btn-primary" disabled={saving}>{saving ? 'Creating…' : 'Create event'}</button>
      </form>
    </div>
  );
}
