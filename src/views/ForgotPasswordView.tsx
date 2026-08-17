import { useState } from 'react';
import { requestPasswordReset } from '../api';
import { colors, fontSerif, shadow } from '../theme';

const s = {
  wrapper: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.bg },
  card: { background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 10, padding: '2rem', width: '100%', maxWidth: 400, boxShadow: shadow },
  heading: { fontFamily: fontSerif, fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem', color: colors.text },
  subheading: { fontSize: '0.875rem', color: colors.textFaint, marginBottom: '1.5rem', lineHeight: 1.5 },
  label: { display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.35rem', color: colors.textMuted },
  input: {
    width: '100%', padding: '0.55rem 0.75rem', background: colors.inputBg, border: `1px solid ${colors.inputBorder}`,
    borderRadius: 6, color: colors.text, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' as const, marginBottom: '1rem',
  },
  submitBtn: { width: '100%', padding: '0.65rem', background: colors.accent, color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' },
  submitBtnDisabled: { background: colors.borderStrong, color: colors.textDisabled, cursor: 'not-allowed' },
  backBtn: { width: '100%', marginTop: '0.75rem', background: 'none', border: 'none', color: colors.link, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', padding: '0.4rem' },
  errorBox: { marginBottom: '1rem', padding: '0.65rem 0.85rem', background: colors.dangerSoft, border: `1px solid ${colors.danger}`, borderRadius: 6, color: colors.dangerText, fontSize: '0.875rem' },
  successBox: { marginBottom: '1rem', padding: '0.65rem 0.85rem', background: colors.successSoft, border: `1px solid ${colors.success}`, borderRadius: 6, color: colors.successText, fontSize: '0.875rem' },
} as const;

interface Props {
  onBack?: () => void;
}

export default function ForgotPasswordView({ onBack }: Props) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const canSubmit = email.trim().length > 0 && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.wrapper}>
      <div style={s.card}>
        <h1 style={s.heading}>Reset your password</h1>
        <p style={s.subheading}>
          Enter the email address on your account and, if it's registered and verified, we'll
          send you a link to reset your password.
        </p>
        {error && <div style={s.errorBox}>{error}</div>}
        {done ? (
          <div style={s.successBox}>
            If that address is registered, a reset link has been sent. Check your inbox.
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <label style={s.label} htmlFor="forgot-email">Email</label>
            <input
              id="forgot-email"
              style={s.input}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" style={{ ...s.submitBtn, ...(!canSubmit ? s.submitBtnDisabled : {}) }} disabled={!canSubmit}>
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}
        {onBack && (
          <button type="button" style={s.backBtn} onClick={onBack}>
            ← Back to sign in
          </button>
        )}
      </div>
    </div>
  );
}
