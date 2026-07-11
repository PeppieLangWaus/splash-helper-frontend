import { useEffect, useState, useCallback } from 'react';
import { getActiveSessions, devAddFakeSession, devTickFakeSession, devRemoveFakeSession } from '../api';
import type { ActiveSession } from '../types';

const s = {
  container: { maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' },
  heading: { fontSize: '1.5rem', fontWeight: 700, color: '#1f2937', margin: '0 0 0.25rem' },
  note: { fontSize: '0.8rem', color: '#9ca3af', marginBottom: '1.25rem' },
  form: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' },
  input: {
    flex: 1,
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    fontSize: '0.9rem',
    outline: 'none',
  },
  addBtn: {
    padding: '0.5rem 1rem',
    background: '#1e3a5f',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 600,
  },
  errorBox: { padding: '0.75rem 1rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 6, color: '#991b1b', marginBottom: '1rem' },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: '0.75rem 1rem',
    marginBottom: '0.6rem',
  },
  rowLeft: { display: 'flex', flexDirection: 'column' as const, gap: '0.15rem' },
  username: { fontWeight: 700, color: '#1f2937', fontSize: '0.95rem' },
  meta: { fontSize: '0.78rem', color: '#6b7280' },
  actions: { display: 'flex', gap: '0.5rem' },
  actionBtn: {
    padding: '0.35rem 0.7rem',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    background: '#fff',
    cursor: 'pointer',
    fontSize: '0.8rem',
    color: '#374151',
  },
  removeBtn: {
    padding: '0.35rem 0.7rem',
    border: '1px solid #fca5a5',
    borderRadius: 6,
    background: '#fff',
    cursor: 'pointer',
    fontSize: '0.8rem',
    color: '#b91c1c',
  },
  emptyMsg: { color: '#9ca3af', textAlign: 'center' as const, padding: '2rem' },
} as const;

export default function DevSessionsPanel() {
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setSessions(await getActiveSessions());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load active sessions.');
    }
  }, []);

  useEffect(() => {
    void load();
    const id = setInterval(() => { void load(); }, 5000);
    return () => clearInterval(id);
  }, [load]);

  async function handleAdd() {
    const name = username.trim();
    if (!name) return;
    setError(null);
    try {
      await devAddFakeSession(name);
      setUsername('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add fake session.');
    }
  }

  async function handleTick(name: string) {
    setError(null);
    try {
      await devTickFakeSession(name);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update fake session.');
    }
  }

  async function handleRemove(name: string) {
    setError(null);
    try {
      await devRemoveFakeSession(name);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove fake session.');
    }
  }

  return (
    <div style={s.container}>
      <h2 style={s.heading}>Dev: Fake Active Sessions</h2>
      <p style={s.note}>
        Injects sessions directly into the backend's in-memory session map (no real plugin connection
        required). Only available when the backend is not running with NODE_ENV=production.
      </p>

      {error && <div style={s.errorBox}>{error}</div>}

      <div style={s.form}>
        <input
          style={s.input}
          placeholder="Fake username, e.g. TestSplasher1"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') void handleAdd(); }}
        />
        <button style={s.addBtn} type="button" onClick={() => void handleAdd()}>
          Add fake session
        </button>
      </div>

      {sessions.length === 0 && <p style={s.emptyMsg}>No active sessions. Add one above.</p>}

      {sessions.map((session) => (
        <div style={s.row} key={session.username}>
          <div style={s.rowLeft}>
            <span style={s.username}>{session.username}</span>
            <span style={s.meta}>
              {session.sessionData
                ? `${session.sessionData.spell} · World ${session.sessionData.world} · ${session.sessionData.spellsCast} casts`
                : 'Session data pending…'}
            </span>
          </div>
          <div style={s.actions}>
            <button style={s.actionBtn} type="button" onClick={() => void handleTick(session.username)}>
              Tick (+casts)
            </button>
            <button style={s.removeBtn} type="button" onClick={() => void handleRemove(session.username)}>
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
