import { useState } from 'react';
import { colors } from '../theme';

const s = {
  wrap: { display: 'flex', flexDirection: 'column' as const, gap: '0.35rem' },
  fieldLabel: { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: colors.textMuted },
  row: { display: 'flex', gap: '0.5rem' },
  input: {
    padding: '0.5rem 0.7rem',
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: 6,
    fontSize: '0.82rem',
    flex: 1,
    outline: 'none',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    background: colors.inputBg,
    color: colors.textMuted,
  },
  btnSecondary: { padding: '0.5rem 0.9rem', background: colors.accentSoft, border: `1px solid ${colors.accent}`, borderRadius: 6, color: colors.accentText, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap' as const },
  btnDanger: { padding: '0.5rem 0.9rem', background: colors.dangerSoft, border: `1px solid ${colors.danger}`, borderRadius: 6, color: colors.dangerText, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap' as const },
  hint: { color: colors.textFaint, fontSize: '0.78rem' },
} as const;

interface Props {
  label: string;
  value: string;
  hint?: string;
  /** If provided, shows a "Regenerate" control (with a confirm step, since it invalidates
   *  the old value) alongside the copy button. */
  onRegenerate?: () => Promise<void>;
}

/** A read-only, copyable secret field — used for the plugin token and community API tokens.
 *  Not a show-once secret: both values are re-displayed here on every visit. */
export default function CopyableField({ label, value, hint, onRegenerate }: Props) {
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can fail (permissions, insecure context) — the value is still
      // selectable in the input, so this isn't fatal.
    }
  }

  async function handleRegenerate() {
    if (!onRegenerate) return;
    setRegenerating(true);
    try {
      await onRegenerate();
    } finally {
      setRegenerating(false);
      setConfirming(false);
    }
  }

  return (
    <div style={s.wrap}>
      <label style={s.fieldLabel}>{label}</label>
      <div style={s.row}>
        <input
          style={s.input}
          type="text"
          readOnly
          value={value}
          onFocus={(e) => e.target.select()}
        />
        <button style={s.btnSecondary} type="button" onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
        {onRegenerate && !confirming && (
          <button style={s.btnDanger} type="button" onClick={() => setConfirming(true)}>
            Regenerate
          </button>
        )}
        {onRegenerate && confirming && (
          <>
            <button style={s.btnDanger} type="button" onClick={handleRegenerate} disabled={regenerating}>
              {regenerating ? 'Regenerating…' : 'Confirm'}
            </button>
            <button style={s.btnSecondary} type="button" onClick={() => setConfirming(false)} disabled={regenerating}>
              Cancel
            </button>
          </>
        )}
      </div>
      {confirming && (
        <p style={{ ...s.hint, color: colors.dangerText }}>
          Regenerating invalidates the current value immediately — anything using it (like the
          Discord bot's /setup) will need the new one.
        </p>
      )}
      {hint && !confirming && <p style={s.hint}>{hint}</p>}
    </div>
  );
}
