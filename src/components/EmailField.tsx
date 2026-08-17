import { useState } from 'react';
import { colors } from '../theme';

const s = {
  wrap: { display: 'flex', flexDirection: 'column' as const, gap: '0.6rem' },
  fieldLabel: { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: colors.textMuted, marginBottom: '0.35rem' },
  badge: (verified: boolean) => ({
    display: 'inline-block',
    padding: '0.1rem 0.5rem',
    borderRadius: 4,
    fontSize: '0.72rem',
    fontWeight: 600,
    background: verified ? colors.successSoft : colors.warningSoft,
    color: verified ? colors.successText : colors.warningText,
    marginLeft: '0.5rem',
  }),
  row: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const },
  input: { padding: '0.5rem 0.7rem', background: colors.inputBg, border: `1px solid ${colors.inputBorder}`, borderRadius: 6, color: colors.text, fontSize: '0.875rem', flex: 1, minWidth: 160, outline: 'none' },
  btnSecondary: { padding: '0.5rem 0.9rem', background: colors.accentSoft, border: `1px solid ${colors.accent}`, borderRadius: 6, color: colors.accentText, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap' as const },
  btnSecondaryDisabled: { cursor: 'not-allowed', opacity: 0.6 },
  errorText: { color: colors.dangerText, fontSize: '0.78rem', marginTop: '0.3rem' },
  successText: { color: colors.successText, fontSize: '0.78rem', marginTop: '0.3rem' },
} as const;

interface Props {
  email?: string;
  emailVerifiedAt?: string;
  onSave: (email: string, currentPassword: string) => Promise<void>;
  onResendVerification: () => Promise<void>;
}

/** Add/change the account's recovery email (requires the current password as a second factor),
 *  and while unverified, resend the verification link. */
export default function EmailField({ email, emailVerifiedAt, onSave, onResendVerification }: Props) {
  const [value, setValue] = useState(email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [resending, setResending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  const verified = !!emailVerifiedAt;

  function flash(type: 'error' | 'success', message: string) {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  }

  async function handleSave() {
    if (!value.trim() || !currentPassword) return;
    setSaving(true);
    try {
      await onSave(value.trim(), currentPassword);
      setCurrentPassword('');
      flash('success', 'Verification email sent — check your inbox.');
    } catch (err) {
      flash('error', err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      await onResendVerification();
      flash('success', 'Verification email sent.');
    } catch (err) {
      flash('error', err instanceof Error ? err.message : 'Failed to resend');
    } finally {
      setResending(false);
    }
  }

  return (
    <div style={s.wrap}>
      <div>
        <label style={s.fieldLabel}>
          Email
          {email && <span style={s.badge(verified)}>{verified ? 'Verified' : 'Unverified'}</span>}
        </label>
        <div style={s.row}>
          <input
            style={s.input}
            type="email"
            placeholder="you@example.com"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={saving}
          />
          <input
            style={s.input}
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={saving}
          />
          <button
            style={{ ...s.btnSecondary, ...(saving || !value.trim() || !currentPassword ? s.btnSecondaryDisabled : {}) }}
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || !value.trim() || !currentPassword}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
        {email && !verified && (
          <button
            style={{ ...s.btnSecondary, marginTop: '0.5rem', ...(resending ? s.btnSecondaryDisabled : {}) }}
            type="button"
            onClick={() => void handleResend()}
            disabled={resending}
          >
            {resending ? 'Resending…' : 'Resend verification email'}
          </button>
        )}
      </div>
      {feedback && <div style={feedback.type === 'error' ? s.errorText : s.successText}>{feedback.message}</div>}
    </div>
  );
}
