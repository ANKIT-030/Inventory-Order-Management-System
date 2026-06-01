import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const AuthContext = createContext(null);

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function getUserFromToken(token) {
  if (!token) return null;
  const payload = parseJwt(token);
  if (!payload) return null;
  return {
    id: payload.sub || payload.user_id || payload.id,
    username: payload.username || payload.name || payload.sub,
    email: payload.email || '',
  };
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => getUserFromToken(localStorage.getItem('token')));

  const login = useCallback(
    async (username, password) => {
      const response = await api.post('/auth/login', { username, password });
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(getUserFromToken(access_token));
      navigate('/dashboard');
    },
    [navigate]
  );

  const register = useCallback(async (username, email, password) => {
    await api.post('/auth/register', { username, email, password });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const isAuthenticated = useMemo(() => !!token, [token]);

  const value = useMemo(
    () => ({ user, token, login, register, logout, isAuthenticated }),
    [user, token, login, register, logout, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
