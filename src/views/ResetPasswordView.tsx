import { useState } from 'react';
import { confirmPasswordReset } from '../api';
import { useAuth } from '../context/AuthContext';
import { colors, fontSerif, shadow } from '../theme';

const s = {
  wrapper: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.bg },
  card: { background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 10, padding: '2rem', width: '100%', maxWidth: 380, boxShadow: shadow },
  heading: { fontFamily: fontSerif, fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem', color: colors.text },
  label: { display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.35rem', color: colors.textMuted },
  input: {
    width: '100%', padding: '0.55rem 0.75rem', background: colors.inputBg, border: `1px solid ${colors.inputBorder}`,
    borderRadius: 6, color: colors.text, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' as const, marginBottom: '1rem',
  },
  submitBtn: { width: '100%', padding: '0.65rem', background: colors.accent, color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' },
  submitBtnDisabled: { background: colors.borderStrong, color: colors.textDisabled, cursor: 'not-allowed' },
  errorBox: { marginBottom: '1rem', padding: '0.65rem 0.85rem', background: colors.dangerSoft, border: `1px solid ${colors.danger}`, borderRadius: 6, color: colors.dangerText, fontSize: '0.875rem' },
  successBox: { marginBottom: '1rem', padding: '0.65rem 0.85rem', background: colors.successSoft, border: `1px solid ${colors.success}`, borderRadius: 6, color: colors.successText, fontSize: '0.875rem' },
  hint: { fontSize: '0.78rem', color: colors.textFaint, marginTop: '-0.6rem', marginBottom: '1rem' },
} as const;

interface Props {
  resetToken: string;
  onSuccess?: () => void;
}

export default function ResetPasswordView({ resetToken, onSuccess }: Props) {
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
      const result = await confirmPasswordReset(resetToken, password);
      setFromToken(result.token, result.username, result.isAdmin, result.communityEligible);
      setDone(true);
      setTimeout(() => onSuccess?.(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.wrapper}>
      <div style={s.card}>
        <h1 style={s.heading}>Set a new password</h1>
        {error && <div style={s.errorBox}>{error}</div>}
        {done && <div style={s.successBox}>Password reset! Redirecting…</div>}
        {!done && (
          <form onSubmit={handleSubmit} noValidate>
            <label style={s.label} htmlFor="reset-password">New password</label>
            <input
              id="reset-password"
              style={s.input}
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <p style={s.hint}>Minimum 8 characters</p>
            <label style={s.label} htmlFor="reset-confirm">Confirm new password</label>
            <input
              id="reset-confirm"
              style={{ ...s.input, borderColor: confirm && !passwordsMatch ? colors.danger : colors.inputBorder }}
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            {confirm && !passwordsMatch && (
              <p style={{ ...s.hint, color: colors.dangerText, marginTop: '-0.6rem' }}>Passwords do not match</p>
            )}
            <button type="submit" style={{ ...s.submitBtn, ...(!canSubmit ? s.submitBtnDisabled : {}) }} disabled={!canSubmit}>
              {loading ? 'Resetting…' : 'Reset password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
