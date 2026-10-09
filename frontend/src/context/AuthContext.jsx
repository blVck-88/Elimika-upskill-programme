import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('elimika_token');
    if (token) {
      authApi.me()
        .then(setUser)
        .catch(() => localStorage.removeItem('elimika_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { access_token } = await authApi.login(email, password);
    localStorage.setItem('elimika_token', access_token);
    const me = await authApi.me();
    setUser(me);
    return me;
  };

  const register = async (data) => {
    const created = await authApi.register(data);
    await login(data.email, data.password);
    return created;
  };

  const logout = () => {
    localStorage.removeItem('elimika_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
