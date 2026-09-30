// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, googleLogin } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on page load/refresh
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  async function login(email, password) {
    const data = await loginUser({ email, password });
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
  }

  async function loginWithGoogle(credential) {
    const data = await googleLogin(credential);
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
  }

  async function register(payload) {
    return registerUser(payload);
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Merges partial updates (e.g. new name or profile_picture) into the cached user,
  // so the sidebar/avatar reflect changes immediately without a full re-login.
  function updateUser(partialUser) {
    setUser((prev) => {
      const merged = { ...prev, ...partialUser };
      localStorage.setItem('user', JSON.stringify(merged));
      return merged;
    });
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginWithGoogle, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider');
  return ctx;
}
