import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const s = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f3f4f6',
  },
  card: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    padding: '2rem',
    width: '100%',
    maxWidth: 380,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  heading: { fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1f2937' },
  label: { display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.35rem', color: '#374151' },
  input: {
    width: '100%',
    padding: '0.55rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box' as const,
    marginBottom: '1rem',
  },
  submitBtn: {
    width: '100%',
    padding: '0.65rem',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontWeight: 600,
    fontSize: '0.95rem',
    cursor: 'pointer',
  },
  submitBtnDisabled: { background: '#93c5fd', cursor: 'not-allowed' },
  errorBox: {
    marginBottom: '1rem',
    padding: '0.65rem 0.85rem',
    background: '#fee2e2',
    border: '1px solid #fca5a5',
    borderRadius: 6,
    color: '#991b1b',
    fontSize: '0.875rem',
  },
} as const;

interface Props {
  onSuccess?: () => void;
}

export default function LoginView({ onSuccess }: Props) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.wrapper}>
      <div style={s.card}>
        <h1 style={s.heading}>Sign in</h1>
        {error && <div style={s.errorBox}>{error}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <label style={s.label} htmlFor="login-username">Username</label>
          <input
            id="login-username"
            style={s.input}
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <label style={s.label} htmlFor="login-password">Password</label>
          <input
            id="login-password"
            style={s.input}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            style={{ ...s.submitBtn, ...(loading || !username || !password ? s.submitBtnDisabled : {}) }}
            disabled={loading || !username || !password}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
