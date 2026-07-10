import { useEffect, useState, useCallback } from 'react';
import { getActiveSessions } from '../api';
import type { ActiveSession } from '../types';

const s = {
  container: { maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' },
  heading: { fontSize: '1.5rem', fontWeight: 700, color: '#1f2937', margin: 0 },
  meta: { fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.2rem' },
  refreshBtn: {
    padding: '0.4rem 0.9rem',
    background: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: '0.875rem',
    color: '#374151',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '1rem',
  },
  card: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: '1rem 1.1rem',
  },
  cardUsername: { fontWeight: 700, fontSize: '1rem', color: '#1f2937', marginBottom: '0.5rem' },
  pill: {
    display: 'inline-block',
    padding: '0.1rem 0.5rem',
    borderRadius: 20,
    fontSize: '0.72rem',
    fontWeight: 600,
    background: '#dcfce7',
    color: '#166534',
    marginBottom: '0.65rem',
  },
  statRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem', color: '#374151', marginBottom: '0.2rem' },
  statLabel: { color: '#6b7280' },
  noData: { color: '#9ca3af', fontStyle: 'italic' as const, fontSize: '0.875rem' },
  errorBox: { padding: '0.75rem 1rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 6, color: '#991b1b' },
  emptyMsg: { color: '#9ca3af', textAlign: 'center' as const, padding: '3rem' },
} as const;

function fmt(n: number) { return n.toLocaleString(); }
function fmtTime(iso: string) {
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}
function timeSince(ts: number) {
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  return `${Math.floor(min / 60)}h ago`;
}

function SessionCard({ session }: { session: ActiveSession }) {
  const d = session.sessionData;
  return (
    <div style={s.card}>
      <div style={s.cardUsername}>{session.username}</div>
      <div style={s.pill}>Live</div>
      {d ? (
        <>
          <div style={s.statRow}><span style={s.statLabel}>Spell</span><span>{d.spell}</span></div>
          <div style={s.statRow}><span style={s.statLabel}>World</span><span>{d.world}</span></div>
          <div style={s.statRow}><span style={s.statLabel}>Spells cast</span><span>{fmt(d.spellsCast)}</span></div>
          <div style={s.statRow}><span style={s.statLabel}>XP gained</span><span>{fmt(d.currentMagicXp - d.startMagicXp)}</span></div>
          <div style={s.statRow}><span style={s.statLabel}>Runes left</span><span>{fmt(d.currentRuneCount)}</span></div>
          <div style={s.statRow}><span style={s.statLabel}>Players nearby</span><span>{d.averagePlayerCount.toFixed(1)} avg</span></div>
          <div style={s.statRow}><span style={s.statLabel}>Knight moves</span><span>{d.knightMovements}</span></div>
          <div style={s.statRow}><span style={s.statLabel}>Session start</span><span>{fmtTime(d.startTime)}</span></div>
        </>
      ) : (
        <p style={s.noData}>Session data pending…</p>
      )}
      <div style={{ ...s.statRow, marginTop: '0.5rem', borderTop: '1px solid #f3f4f6', paddingTop: '0.4rem' }}>
        <span style={s.statLabel}>Last update</span>
        <span>{timeSince(session.lastUpdate)}</span>
      </div>
    </div>
  );
}

export default function AllSplashersView() {
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await getActiveSessions();
      setSessions(data);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load active sessions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    // Poll every 15 seconds
    const id = setInterval(() => { void load(); }, 15000);
    return () => clearInterval(id);
  }, [load]);

  return (
    <div style={s.container}>
      <div style={s.header}>
        <div>
          <h2 style={s.heading}>Active Splashers</h2>
          {lastRefresh && (
            <div style={s.meta}>Updated {lastRefresh.toLocaleTimeString()} · auto-refreshes every 15s</div>
          )}
        </div>
        <button style={s.refreshBtn} onClick={() => { void load(); }} type="button">
          ↻ Refresh
        </button>
      </div>

      {error && <div style={s.errorBox}>{error}</div>}

      {loading && <p style={s.emptyMsg}>Loading…</p>}

      {!loading && !error && sessions.length === 0 && (
        <p style={s.emptyMsg}>No splashers are currently active.</p>
      )}

      {!error && sessions.length > 0 && (
        <div style={s.grid}>
          {sessions.map((session) => (
            <SessionCard key={session.username} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}
