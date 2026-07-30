import { useState } from 'react';

const s = {
  wrap: { display: 'flex', flexDirection: 'column' as const, gap: '0.35rem' },
  fieldLabel: { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151' },
  row: { display: 'flex', gap: '0.5rem' },
  input: {
    padding: '0.5rem 0.7rem',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    fontSize: '0.82rem',
    flex: 1,
    outline: 'none',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    background: '#f9fafb',
    color: '#374151',
  },
  btnSecondary: { padding: '0.5rem 0.9rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, color: '#1d4ed8', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap' as const },
  btnDanger: { padding: '0.5rem 0.9rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 6, color: '#991b1b', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap' as const },
  hint: { color: '#9ca3af', fontSize: '0.78rem' },
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
        <p style={{ ...s.hint, color: '#991b1b' }}>
          Regenerating invalidates the current value immediately — anything using it (like the
          Discord bot's /setup) will need the new one.
        </p>
      )}
      {hint && !confirming && <p style={s.hint}>{hint}</p>}
    </div>
  );
}
