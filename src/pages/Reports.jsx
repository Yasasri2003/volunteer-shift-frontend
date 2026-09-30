// src/pages/Reports.jsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ClipboardList, LogIn, LogOut, UserX, TrendingUp, Clock3, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getDailyReport, getMonthlyReport } from '../api/reports';
import { checkIn, checkOut, markNoShow } from '../api/assignments';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function Reports() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState('daily');

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}><ClipboardList size={26} /> Reports</h1>
          <p className="muted">Daily attendance with check-in/check-out, and monthly volunteer hours.</p>
        </div>
      </div>

      <div className="tab-group">
        <button className={`tab-btn ${tab === 'daily' ? 'active' : ''}`} onClick={() => setTab('daily')}>Daily</button>
        <button className={`tab-btn ${tab === 'monthly' ? 'active' : ''}`} onClick={() => setTab('monthly')}>Monthly</button>
      </div>

      {tab === 'daily' ? <DailyReport initialDate={searchParams.get('date') || todayISO()} /> : <MonthlyReport />}
    </div>
  );
}

function DailyReport({ initialDate }) {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [date, setDate] = useState(initialDate);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const data = await getDailyReport(date, token);
      setRows(data.rows);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [date]);

  async function handleAction(assignmentId, action, label) {
    setBusyId(assignmentId);
    try {
      if (action === 'checkin') await checkIn(assignmentId, token);
      if (action === 'checkout') await checkOut(assignmentId, token);
      if (action === 'no-show') await markNoShow(assignmentId, token);
      await load();
      showToast(label, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBusyId(null);
    }
  }

  const presentCount = rows.filter((r) => r.attendance_status === 'present').length;
  const noShowCount = rows.filter((r) => r.attendance_status === 'no_show').length;

  return (
    <div>
      <div className="field animate-in" style={{ maxWidth: 220 }}>
        <label>Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      {!loading && rows.length > 0 && (
        <div className="stat-grid animate-in">
          <StatCard icon={<Users size={17} />} value={rows.length} label="Total assigned" tint="var(--color-primary-light)" iconColor="var(--color-primary)" />
          <StatCard icon={<LogIn size={17} />} value={presentCount} label="Checked in" tint="var(--color-success-bg)" iconColor="var(--color-success)" />
          <StatCard icon={<UserX size={17} />} value={noShowCount} label="No-shows" tint="var(--color-danger-bg)" iconColor="var(--color-danger)" />
        </div>
      )}

      <div className="card animate-in">
        {loading ? (
          <div className="skeleton skeleton-line" style={{ width: '60%' }} />
        ) : rows.length === 0 ? (
          <div className="empty-state">
            <Clock3 size={32} />
            <p>No shifts scheduled for this date.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Time</th>
                <th>Volunteer</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.assignment_id}>
                  <td>{row.event}</td>
                  <td>{row.start_time}–{row.end_time}</td>
                  <td>{row.volunteer}</td>
                  <td>{row.check_in_time?.slice(11, 16) || '—'}</td>
                  <td>{row.check_out_time?.slice(11, 16) || '—'}</td>
                  <td><span className={`badge badge-${row.attendance_status}`}>{row.attendance_status.replace('_', ' ')}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {!row.check_in_time && (
                        <button className="btn btn-secondary btn-sm" disabled={busyId === row.assignment_id} onClick={() => handleAction(row.assignment_id, 'checkin', 'Checked in')}>
                          <LogIn size={13} /> Check in
                        </button>
                      )}
                      {row.check_in_time && !row.check_out_time && (
                        <button className="btn btn-secondary btn-sm" disabled={busyId === row.assignment_id} onClick={() => handleAction(row.assignment_id, 'checkout', 'Checked out')}>
                          <LogOut size={13} /> Check out
                        </button>
                      )}
                      {row.attendance_status === 'pending' && (
                        <button className="btn btn-danger btn-sm" disabled={busyId === row.assignment_id} onClick={() => handleAction(row.assignment_id, 'no-show', 'Marked as no-show')}>
                          <UserX size={13} /> No-show
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function MonthlyReport() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await getMonthlyReport(year, month, token);
      setRows(data.rows);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [year, month]);

  const totalHours = rows.reduce((sum, r) => sum + (Number(r.total_hours) || 0), 0);

  return (
    <div>
      <div className="field-row animate-in" style={{ maxWidth: 320 }}>
        <div className="field">
          <label>Year</label>
          <input type="number" value={year} onChange={(e) => setYear(e.target.value)} />
        </div>
        <div className="field">
          <label>Month</label>
          <select value={month} onChange={(e) => setMonth(e.target.value)}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
        </div>
      </div>

      {!loading && rows.length > 0 && (
        <div className="stat-grid animate-in">
          <StatCard icon={<Users size={17} />} value={rows.length} label="Volunteers active" tint="var(--color-primary-light)" iconColor="var(--color-primary)" />
          <StatCard icon={<TrendingUp size={17} />} value={totalHours.toFixed(1)} label="Total hours logged" tint="var(--color-accent-light)" iconColor="var(--color-accent)" />
        </div>
      )}

      <div className="card animate-in">
        {loading ? (
          <div className="skeleton skeleton-line" style={{ width: '60%' }} />
        ) : rows.length === 0 ? (
          <div className="empty-state">
            <TrendingUp size={32} />
            <p>No attendance data for this month.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Volunteer</th>
                <th>Shifts attended</th>
                <th>Total hours</th>
                <th>No-shows</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td>{row.volunteer}</td>
                  <td>{row.shifts_attended}</td>
                  <td>{row.total_hours ?? '—'}</td>
                  <td>{row.no_shows}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
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
