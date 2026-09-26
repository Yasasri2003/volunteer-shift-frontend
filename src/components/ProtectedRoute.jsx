// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from './Layout';

export default function ProtectedRoute({ children, staffOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) return <p className="muted" style={{ padding: 24 }}>Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;

  const isStaff = user.role === 'admin' || user.role === 'organizer';
  if (staffOnly && !isStaff) return <Navigate to="/events" replace />;

  return <Layout>{children}</Layout>;
}
