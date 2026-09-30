// src/components/Layout.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { Sprout, CalendarDays, ClipboardList, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isStaff = user?.role === 'admin' || user?.role === 'organizer';

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Sprout size={22} strokeWidth={2.2} />
          VolunteerHub
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/events" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <CalendarDays size={18} /> Events
          </NavLink>
          {isStaff && (
            <NavLink to="/reports" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              <ClipboardList size={18} /> Reports
            </NavLink>
          )}
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/settings" className="user-chip" style={{ textDecoration: 'none' }}>
            <Avatar user={user} clickable />
            <div className="user-chip-info">
              <div className="user-chip-name">{user?.name}</div>
              <div className="user-chip-role">{user?.role}</div>
            </div>
          </NavLink>
          <button className="btn btn-secondary btn-sm logout-btn" onClick={handleLogout}>
            <LogOut size={15} /> Log out
          </button>
        </div>
      </aside>

      <div className="content-area">
        <main className="page-container">{children}</main>
      </div>
    </div>
  );
}
