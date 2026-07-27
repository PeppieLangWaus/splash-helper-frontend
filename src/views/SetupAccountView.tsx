import { useState } from 'react';
import { setupAccount } from '../api';
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
    maxWidth: 400,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  heading: { fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1f2937' },
  subheading: { fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' },
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
  successBox: {
    marginBottom: '1rem',
    padding: '0.65rem 0.85rem',
    background: '#d1fae5',
    border: '1px solid #6ee7b7',
    borderRadius: 6,
    color: '#065f46',
    fontSize: '0.875rem',
  },
  hint: { fontSize: '0.78rem', color: '#9ca3af', marginTop: '-0.6rem', marginBottom: '1rem' },
} as const;

interface Props {
  setupToken: string;
  onSuccess?: () => void;
}

export default function SetupAccountView({ setupToken, onSuccess }: Props) {
  const { setFromToken } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordsMatch = password === confirm;
  const canSubmit = password.length >= 8 && passwordsMatch && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    try {
      const result = await setupAccount(setupToken, password);
      setFromToken(result.token, result.username, result.isAdmin, result.communityEligible);
      setDone(true);
      setTimeout(() => onSuccess?.(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.wrapper}>
      <div style={s.card}>
        <h1 style={s.heading}>Create your account</h1>
        <p style={s.subheading}>Choose a password to finish setting up your Splash Helper account.</p>
        {error && <div style={s.errorBox}>{error}</div>}
        {done && <div style={s.successBox}>Account created! Redirecting…</div>}
        {!done && (
          <form onSubmit={handleSubmit} noValidate>
            <label style={s.label} htmlFor="setup-password">Password</label>
            <input
              id="setup-password"
              style={s.input}
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <p style={s.hint}>Minimum 8 characters</p>
            <label style={s.label} htmlFor="setup-confirm">Confirm password</label>
            <input
              id="setup-confirm"
              style={{
                ...s.input,
                borderColor: confirm && !passwordsMatch ? '#ef4444' : '#d1d5db',
              }}
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            {confirm && !passwordsMatch && (
              <p style={{ ...s.hint, color: '#ef4444', marginTop: '-0.6rem' }}>Passwords do not match</p>
            )}
            <button
              type="submit"
              style={{ ...s.submitBtn, ...(!canSubmit ? s.submitBtnDisabled : {}) }}
              disabled={!canSubmit}
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
