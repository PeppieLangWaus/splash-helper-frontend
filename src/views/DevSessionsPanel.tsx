import { useEffect, useState, useCallback } from 'react';
import {
  getActiveSessions,
  devAddFakeSession,
  devTickFakeSession,
  devRemoveFakeSession,
  devSetFakeSessionPinned,
  devReset,
} from '../api';
import type { ActiveSession } from '../types';
import { colors, fontSerif } from '../theme';

// Remembered across reloads so the checkbox doesn't reset itself every time the dev view is
// re-opened while poking at fake sessions.
const PIN_NEW_SESSIONS_KEY = 'dev.pinNewFakeSessions';

const s = {
  container: { maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' },
  heading: { fontFamily: fontSerif, fontSize: '1.6rem', fontWeight: 700, color: colors.text, margin: '0 0 0.25rem' },
  note: { fontSize: '0.8rem', color: colors.textFaint, marginBottom: '1.25rem' },
  form: { display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' },
  pinOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.8rem',
    color: colors.textMuted,
    marginBottom: '1.5rem',
    cursor: 'pointer',
  },
  input: {
    flex: 1,
    padding: '0.5rem 0.75rem',
    background: colors.inputBg,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: 6,
    color: colors.text,
    fontSize: '0.9rem',
    outline: 'none',
  },
  addBtn: {
    padding: '0.5rem 1rem',
    background: colors.accent,
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 700,
  },
  errorBox: { padding: '0.75rem 1rem', background: colors.dangerSoft, border: `1px solid ${colors.danger}`, borderRadius: 6, color: colors.dangerText, marginBottom: '1rem' },
  headerRow: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' },
  resetBtn: {
    flexShrink: 0,
    padding: '0.5rem 1rem',
    background: colors.dangerSoft,
    color: colors.dangerText,
    border: `1px solid ${colors.danger}`,
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 700,
  },
  resetStatus: { fontSize: '0.8rem', color: colors.textFaint, marginBottom: '1rem' },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: colors.panel,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    padding: '0.75rem 1rem',
    marginBottom: '0.6rem',
  },
  rowLeft: { display: 'flex', flexDirection: 'column' as const, gap: '0.15rem' },
  username: { fontWeight: 700, color: colors.text, fontSize: '0.95rem' },
  meta: { fontSize: '0.78rem', color: colors.textFaint },
  actions: { display: 'flex', gap: '0.5rem' },
  actionBtn: {
    padding: '0.35rem 0.7rem',
    border: `1px solid ${colors.borderStrong}`,
    borderRadius: 6,
    background: '#3e2816',
    cursor: 'pointer',
    fontSize: '0.8rem',
    color: colors.textMuted,
  },
  removeBtn: {
    padding: '0.35rem 0.7rem',
    border: `1px solid ${colors.danger}`,
    borderRadius: 6,
    background: colors.dangerSoft,
    cursor: 'pointer',
    fontSize: '0.8rem',
    color: colors.dangerText,
  },
  pinBtn: {
    padding: '0.35rem 0.7rem',
    border: `1px solid ${colors.borderStrong}`,
    borderRadius: 6,
    background: '#3e2816',
    cursor: 'pointer',
    fontSize: '0.8rem',
    color: colors.textMuted,
  },
  pinBtnActive: {
    padding: '0.35rem 0.7rem',
    border: `1px solid ${colors.accent}`,
    borderRadius: 6,
    background: colors.accent,
    cursor: 'pointer',
    fontSize: '0.8rem',
    color: '#fff',
    fontWeight: 700,
  },
  emptyMsg: { color: colors.textFaint, textAlign: 'center' as const, padding: '2rem' },
} as const;

export default function DevSessionsPanel() {
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [resetStatus, setResetStatus] = useState<string | null>(null);
  const [pinNewSessions, setPinNewSessions] = useState(
    () => localStorage.getItem(PIN_NEW_SESSIONS_KEY) === 'true',
  );

  useEffect(() => {
    localStorage.setItem(PIN_NEW_SESSIONS_KEY, String(pinNewSessions));
  }, [pinNewSessions]);

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
      await devAddFakeSession(name, pinNewSessions);
      setUsername('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add fake session.');
    }
  }

  async function handleTogglePin(name: string, currentlyPinned: boolean) {
    setError(null);
    try {
      await devSetFakeSessionPinned(name, !currentlyPinned);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update fake session.');
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

  async function handleReset() {
    if (!window.confirm('Wipe every collection in the dev database and clear all active sessions? This cannot be undone.')) {
      return;
    }
    setError(null);
    setResetStatus(null);
    setResetting(true);
    try {
      const { collectionsCleared } = await devReset();
      setResetStatus(`Reset complete — cleared: ${collectionsCleared.join(', ') || 'nothing to clear'}.`);
      setUsername('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset dev data.');
    } finally {
      setResetting(false);
    }
  }

  return (
    <div style={s.container}>
      <div style={s.headerRow}>
        <div>
          <h2 style={s.heading}>Dev: Fake Active Sessions</h2>
          <p style={s.note}>
            Injects sessions directly into the backend's in-memory session map (no real plugin connection
            required). Only available when the backend is not running with NODE_ENV=production.
          </p>
        </div>
        <button style={s.resetBtn} type="button" disabled={resetting} onClick={() => void handleReset()}>
          {resetting ? 'Resetting…' : 'Reset dev data'}
        </button>
      </div>

      {resetStatus && <p style={s.resetStatus}>{resetStatus}</p>}
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

      <label style={s.pinOption}>
        <input
          type="checkbox"
          checked={pinNewSessions}
          onChange={(e) => setPinNewSessions(e.target.checked)}
        />
        Prevent auto-clear for new fake sessions (skips the inactivity sweep entirely)
      </label>

      {sessions.length === 0 && <p style={s.emptyMsg}>No active sessions. Add one above.</p>}

      {sessions.map((session) => (
        <div style={s.row} key={session.username}>
          <div style={s.rowLeft}>
            <span style={s.username}>{session.username}</span>
            <span style={s.meta}>
              {session.sessionData
                ? `${session.sessionData.spell} · World ${session.sessionData.world} · ${session.sessionData.spellsCast} casts`
                : 'Session data pending…'}
              {session.pinned ? ' · 📌 auto-clear disabled' : ''}
            </span>
          </div>
          <div style={s.actions}>
            <button
              style={session.pinned ? s.pinBtnActive : s.pinBtn}
              type="button"
              onClick={() => void handleTogglePin(session.username, !!session.pinned)}
            >
              {session.pinned ? 'Unpin' : 'Pin (no auto-clear)'}
            </button>
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
