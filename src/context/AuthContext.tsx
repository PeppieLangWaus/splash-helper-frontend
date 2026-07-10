import { createContext, useContext, useState } from 'react';
import type { AuthUser } from '../types';

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setFromToken: (token: string, username: string, isAdmin: boolean) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): AuthUser | null {
  try {
    const stored = localStorage.getItem('authUser');
    return stored ? (JSON.parse(stored) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'));
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);

  function setFromToken(newToken: string, username: string, isAdmin: boolean) {
    const authUser: AuthUser = { username, isAdmin };
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUser', JSON.stringify(authUser));
    setToken(newToken);
    setUser(authUser);
  }

  async function login(username: string, password: string) {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = (await res.json()) as { token?: string; username?: string; isAdmin?: boolean; error?: string };
    if (!res.ok) throw new Error(data.error ?? 'Login failed');
    setFromToken(data.token!, data.username!, data.isAdmin ?? false);
  }

  function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, setFromToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
