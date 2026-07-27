import { useState } from 'react';

const s = {
  wrap: { display: 'flex', flexDirection: 'column' as const, gap: '0.9rem' },
  fieldLabel: { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' },
  connectedBadge: { display: 'inline-block', padding: '0.1rem 0.5rem', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600, background: '#d1fae5', color: '#065f46', marginLeft: '0.5rem' },
  row: { display: 'flex', gap: '0.5rem' },
  input: { padding: '0.5rem 0.7rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.875rem', flex: 1, outline: 'none' },
  btnSecondary: { padding: '0.5rem 0.9rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, color: '#1d4ed8', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap' as const },
  btnDanger: { padding: '0.5rem 0.9rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 6, color: '#991b1b', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap' as const },
  errorText: { color: '#991b1b', fontSize: '0.78rem', marginTop: '0.3rem' },
  successText: { color: '#065f46', fontSize: '0.78rem', marginTop: '0.3rem' },
} as const;

function WebhookField({
  label,
  savedValue,
  onSave,
}: {
  label: string;
  savedValue?: string;
  onSave: (value: string) => Promise<void>;
}) {
  const [value, setValue] = useState(savedValue ?? '');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  function flash(type: 'error' | 'success', message: string) {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 2500);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(value.trim());
      flash('success', value.trim() ? 'Saved' : 'Cleared');
    } catch (err) {
      flash('error', err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleClear() {
    setSaving(true);
    try {
      await onSave('');
      setValue('');
      flash('success', 'Cleared');
    } catch (err) {
      flash('error', err instanceof Error ? err.message : 'Failed to clear');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <label style={s.fieldLabel}>
        {label}
        {savedValue && <span style={s.connectedBadge}>Connected</span>}
      </label>
      <div style={s.row}>
        <input
          style={s.input}
          type="text"
          placeholder="https://discord.com/api/webhooks/..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={saving}
        />
        <button style={s.btnSecondary} type="button" onClick={handleSave} disabled={saving || !value.trim()}>
          Save
        </button>
        {savedValue && (
          <button style={s.btnDanger} type="button" onClick={handleClear} disabled={saving}>
            Clear
          </button>
        )}
      </div>
      {feedback && <div style={feedback.type === 'error' ? s.errorText : s.successText}>{feedback.message}</div>}
    </div>
  );
}

interface Props {
  activeUrl?: string;
  historyUrl?: string;
  onSaveActive: (value: string) => Promise<void>;
  onSaveHistory: (value: string) => Promise<void>;
}

/**
 * A pair of independent webhook fields — one for the active-sessions embed, one for
 * archived-session history — each saved/cleared on its own. Reused for community-level,
 * per-member, and self-service webhook settings.
 */
export default function WebhookFieldsEditor({ activeUrl, historyUrl, onSaveActive, onSaveHistory }: Props) {
  return (
    <div style={s.wrap}>
      <WebhookField label="Active sessions webhook" savedValue={activeUrl} onSave={onSaveActive} />
      <WebhookField label="Session history webhook" savedValue={historyUrl} onSave={onSaveHistory} />
    </div>
  );
}
