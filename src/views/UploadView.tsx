import { useState } from 'react';
import { uploadJson } from '../api';
import type { SplashEntry } from '../types';

const s = {
  container: { maxWidth: 640, margin: '0 auto', padding: '2rem 1rem' },
  heading: { fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1f2937' },
  label: { display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#374151' },
  textarea: {
    width: '100%',
    minHeight: 180,
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    fontFamily: 'monospace',
    fontSize: '0.85rem',
    resize: 'vertical' as const,
    boxSizing: 'border-box' as const,
    outline: 'none',
  },
  divider: { display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0', color: '#9ca3af' },
  dividerLine: { flex: 1, height: 1, background: '#e5e7eb' },
  fileRow: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  fileBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.5rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    background: '#fff',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: '#374151',
  },
  fileName: { color: '#6b7280', fontSize: '0.875rem' },
  submitBtn: {
    marginTop: '1.25rem',
    width: '100%',
    padding: '0.65rem',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontWeight: 600,
    fontSize: '1rem',
    cursor: 'pointer',
  },
  submitBtnDisabled: { background: '#93c5fd', cursor: 'not-allowed' },
  successBox: {
    marginTop: '1rem',
    padding: '0.75rem 1rem',
    background: '#d1fae5',
    border: '1px solid #6ee7b7',
    borderRadius: 6,
    color: '#065f46',
    fontSize: '0.9rem',
  },
  errorBox: {
    marginTop: '1rem',
    padding: '0.75rem 1rem',
    background: '#fee2e2',
    border: '1px solid #fca5a5',
    borderRadius: 6,
    color: '#991b1b',
    fontSize: '0.9rem',
  },
} as const;

export default function UploadView() {
  const [jsonText, setJsonText] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonText(e.target.value);
    setStatus(null);
  };

  const handleSubmit = async () => {
    setStatus(null);
    setLoading(true);
    try {
      if (!jsonText.trim()) {
        setStatus({ type: 'error', message: 'Paste JSON first.' });
        return;
      }
      let parsed: unknown;
      try {
        parsed = JSON.parse(jsonText);
      } catch {
        setStatus({ type: 'error', message: 'Invalid JSON — could not parse.' });
        return;
      }
      if (!Array.isArray(parsed)) {
        setStatus({ type: 'error', message: 'JSON must be an array of session entries.' });
        return;
      }
      const result = await uploadJson(parsed as SplashEntry[]);
      setStatus({ type: 'success', message: result.message });
      setJsonText('');
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Upload failed.' });
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || !jsonText.trim();

  return (
    <div style={s.container}>
      <h2 style={s.heading}>Upload Session Data</h2>

      <label style={s.label} htmlFor="json-paste">Paste JSON</label>
      <textarea
        id="json-paste"
        style={s.textarea}
        placeholder="Paste a JSON array of session entries here..."
        value={jsonText}
        onChange={handleTextChange}
      />

      <button
        style={{ ...s.submitBtn, ...(isDisabled ? s.submitBtnDisabled : {}) }}
        disabled={isDisabled}
        onClick={handleSubmit}
        type="button"
      >
        {loading ? 'Uploading…' : 'Upload'}
      </button>

      {status && (
        <div style={status.type === 'success' ? s.successBox : s.errorBox}>
          {status.message}
        </div>
      )}
    </div>
  );
}
