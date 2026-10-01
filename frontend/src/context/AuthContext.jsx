import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { request } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('hotel_token') || '');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hotel_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('hotel_token', token);
    } else {
      localStorage.removeItem('hotel_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('hotel_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('hotel_user');
    }
  }, [user]);

  const loadCurrentUser = async (authToken = token) => {
    if (!authToken) return null;

    setLoading(true);
    try {
      const data = await request('/auth/me', {}, authToken);
      setUser(data);
      return data;
    } catch (error) {
      setToken('');
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const accessToken = data.access_token;
    setToken(accessToken);
    const currentUser = await loadCurrentUser(accessToken);
    return currentUser;
  };

  const register = async (payload) => {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  };

  const logout = () => {
    setToken('');
    setUser(null);
  };

  useEffect(() => {
    if (token) {
      loadCurrentUser();
    }
  }, [token]);

  const value = useMemo(() => ({
    token,
    user,
    loading,
    setUser,
    login,
    register,
    logout,
    loadCurrentUser,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'ADMIN',
  }), [token, user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
