import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { colors, fontSerif, shadow } from '../theme';

const s = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: colors.bg,
  },
  card: {
    background: colors.panel,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    padding: '2rem',
    width: '100%',
    maxWidth: 380,
    boxShadow: shadow,
  },
  heading: { fontFamily: fontSerif, fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem', color: colors.text },
  label: { display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.35rem', color: colors.textMuted },
  input: {
    width: '100%',
    padding: '0.55rem 0.75rem',
    background: colors.inputBg,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: 6,
    color: colors.text,
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box' as const,
    marginBottom: '1rem',
  },
  submitBtn: {
    width: '100%',
    padding: '0.65rem',
    background: colors.accent,
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontWeight: 700,
    fontSize: '0.95rem',
    cursor: 'pointer',
  },
  submitBtnDisabled: { background: colors.borderStrong, color: colors.textDisabled, cursor: 'not-allowed' },
  errorBox: {
    marginBottom: '1rem',
    padding: '0.65rem 0.85rem',
    background: colors.dangerSoft,
    border: `1px solid ${colors.danger}`,
    borderRadius: 6,
    color: colors.dangerText,
    fontSize: '0.875rem',
  },
  forgotBtn: {
    display: 'block',
    marginTop: '0.85rem',
    background: 'none',
    border: 'none',
    color: colors.link,
    fontWeight: 600,
    fontSize: '0.82rem',
    cursor: 'pointer',
    padding: 0,
  },
} as const;

interface Props {
  onSuccess?: () => void;
  onForgotPassword?: () => void;
}

export default function LoginView({ onSuccess, onForgotPassword }: Props) {
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
        {onForgotPassword && (
          <button type="button" style={s.forgotBtn} onClick={onForgotPassword}>
            Forgot password?
          </button>
        )}
      </div>
    </div>
  );
}
