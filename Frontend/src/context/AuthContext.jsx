import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('dinobox_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const register = (username, email, password) => {
    const users = JSON.parse(localStorage.getItem('dinobox_users') || '[]');
    if (users.find(u => u.email === email)) {
      throw new Error('Email already registered');
    }
    const newUser = { id: Date.now(), username, email, password };
    users.push(newUser);
    localStorage.setItem('dinobox_users', JSON.stringify(users));
    const session = { id: newUser.id, username, email };
    localStorage.setItem('dinobox_user', JSON.stringify(session));
    setUser(session);
    return session;
  };

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('dinobox_users') || '[]');
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) throw new Error('Invalid credentials');
    const session = { id: found.id, username: found.username, email: found.email };
    localStorage.setItem('dinobox_user', JSON.stringify(session));
    setUser(session);
    return session;
  };

  const logout = () => {
    localStorage.removeItem('dinobox_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};