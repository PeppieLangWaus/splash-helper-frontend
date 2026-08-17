import { useEffect, useState } from 'react';
import { verifyEmailToken } from '../api';
import { colors, fontSerif, shadow } from '../theme';

const s = {
  wrapper: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.bg },
  card: { background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 10, padding: '2rem', width: '100%', maxWidth: 380, boxShadow: shadow, textAlign: 'center' as const },
  heading: { fontFamily: fontSerif, fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem', color: colors.text },
  errorBox: { padding: '0.65rem 0.85rem', background: colors.dangerSoft, border: `1px solid ${colors.danger}`, borderRadius: 6, color: colors.dangerText, fontSize: '0.875rem' },
  successBox: { padding: '0.65rem 0.85rem', background: colors.successSoft, border: `1px solid ${colors.success}`, borderRadius: 6, color: colors.successText, fontSize: '0.875rem' },
  link: { display: 'inline-block', marginTop: '1rem', background: 'none', border: 'none', color: colors.link, fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', padding: 0 },
} as const;

interface Props {
  verifyToken: string;
  onDone: () => void;
}

export default function VerifyEmailView({ verifyToken, onDone }: Props) {
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    verifyEmailToken(verifyToken)
      .then((result) => {
        if (cancelled) return;
        setStatus('success');
        setMessage(result.message);
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Verification failed');
      });
    return () => {
      cancelled = true;
    };
  }, [verifyToken]);

  return (
    <div style={s.wrapper}>
      <div style={s.card}>
        <h1 style={s.heading}>Verify your email</h1>
        {status === 'pending' && <p>Verifying…</p>}
        {status === 'success' && <div style={s.successBox}>{message}</div>}
        {status === 'error' && <div style={s.errorBox}>{message}</div>}
        <button type="button" style={s.link} onClick={onDone}>← Back to Splash Helper</button>
      </div>
    </div>
  );
}
