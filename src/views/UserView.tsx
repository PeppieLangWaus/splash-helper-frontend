import { useEffect, useState } from 'react';
import { getArchivedSessions } from '../api';
import { useAuth } from '../context/AuthContext';
import type { ArchivedSession } from '../types';

const s = {
  container: { maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#2563eb',
    fontWeight: 600,
    fontSize: '0.9rem',
    padding: 0,
    marginBottom: '1.25rem',
  },
  heading: { fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1f2937' },
  subheading: { fontSize: '1.1rem', fontWeight: 700, color: '#374151', margin: '1.75rem 0 0.75rem' },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  statCard: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: '0.9rem',
    textAlign: 'center' as const,
  },
  statValue: { fontSize: '1.4rem', fontWeight: 700, color: '#2563eb' },
  statLabel: { fontSize: '0.78rem', color: '#6b7280', marginTop: '0.2rem' },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    background: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    border: '1px solid #e5e7eb',
    fontSize: '0.85rem',
  },
  th: {
    background: '#f9fafb',
    padding: '0.6rem 0.75rem',
    textAlign: 'left' as const,
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#374151',
    borderBottom: '1px solid #e5e7eb',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap' as const,
  },
  td: { padding: '0.6rem 0.75rem', color: '#374151', borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap' as const },
  badge: (ok: boolean) => ({
    display: 'inline-block',
    padding: '0.1rem 0.45rem',
    borderRadius: 4,
    fontSize: '0.75rem',
    fontWeight: 600,
    background: ok ? '#d1fae5' : '#fee2e2',
    color: ok ? '#065f46' : '#991b1b',
  }),
  errorBox: { padding: '0.75rem 1rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 6, color: '#991b1b' },
  emptyMsg: { color: '#9ca3af', textAlign: 'center' as const, padding: '2rem' },
  runeChips: { display: 'flex', flexWrap: 'wrap' as const, gap: '0.25rem' },
  runeChip: { background: '#ede9fe', color: '#5b21b6', borderRadius: 4, padding: '0.1rem 0.4rem', fontSize: '0.75rem', fontWeight: 500 },
} as const;

function fmt(n: number) { return n.toLocaleString(); }
function fmtDate(ts: number) { return new Date(ts).toLocaleString(); }

function calcStats(sessions: ArchivedSession[]) {
  let spells = 0, xp = 0, runeCost = 0, knightMoves = 0;
  for (const entry of sessions) {
    spells += entry.session.spellsCast;
    xp += entry.session.currentMagicXp - entry.session.startMagicXp;
    runeCost += entry.session.runeCostGp;
    knightMoves += entry.session.knightMovements;
  }
  return { spells, xp, runeCost, knightMoves };
}

interface Props {
  username: string;
  onBack: () => void;
  onLoginRequired?: () => void;
}

export default function UserView({ username, onBack, onLoginRequired }: Props) {
  const { token } = useAuth();
  const [sessions, setSessions] = useState<ArchivedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      onLoginRequired?.();
      return;
    }
    setLoading(true);
    setError(null);
    getArchivedSessions(username, token)
      .then((data) => setSessions(data.sessions))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load sessions.'))
      .finally(() => setLoading(false));
  }, [username, token, onLoginRequired]);

  const stats = calcStats(sessions);

  return (
    <div style={s.container}>
      <button style={s.backBtn} onClick={onBack} type="button">
        ← Back to all splashers
      </button>

      {loading && <p style={s.emptyMsg}>Loading…</p>}
      {error && <div style={s.errorBox}>{error}</div>}

      {!loading && !error && (
        <>
          <h2 style={s.heading}>{username}</h2>

          <div style={s.statsGrid}>
            <StatCard value={fmt(sessions.length)} label="Sessions" />
            <StatCard value={fmt(stats.spells)} label="Spells Cast" />
            <StatCard value={`${fmt(stats.xp)} XP`} label="Magic XP Gained" />
            <StatCard value={`${fmt(stats.runeCost)} gp`} label="Total Rune Cost" />
            <StatCard value={fmt(stats.knightMoves)} label="Knight Movements" />
          </div>

          <h3 style={s.subheading}>Sessions ({sessions.length})</h3>

          {sessions.length === 0 ? (
            <p style={s.emptyMsg}>No sessions recorded.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Date</th>
                    <th style={s.th}>Spell</th>
                    <th style={s.th}>World</th>
                    <th style={s.th}>Spells Cast</th>
                    <th style={s.th}>XP Gained</th>
                    <th style={s.th}>Rune Cost (gp)</th>
                    <th style={s.th}>Knight Moves</th>
                    <th style={s.th}>Avg Players</th>
                    <th style={s.th}>Sticky Knight</th>
                    <th style={s.th}>Synced</th>
                    <th style={s.th}>Runes Used</th>
                  </tr>
                </thead>
                <tbody>
                  {[...sessions]
                    .sort((a, b) => b.createdTimestamp - a.createdTimestamp)
                    .map((entry: ArchivedSession) => {
                      const d = entry.session;
                      const xpGained = d.currentMagicXp - d.startMagicXp;
                      return (
                        <tr key={entry.sessionId}>
                          <td style={s.td}>{fmtDate(entry.createdTimestamp)}</td>
                          <td style={s.td}>{d.spell}</td>
                          <td style={s.td}>{d.world}</td>
                          <td style={s.td}>{fmt(d.spellsCast)}</td>
                          <td style={s.td}>{fmt(xpGained)}</td>
                          <td style={s.td}>{fmt(d.runeCostGp)}</td>
                          <td style={s.td}>{fmt(d.knightMovements)}</td>
                          <td style={s.td}>{d.averagePlayerCount.toFixed(1)}</td>
                          <td style={s.td}>
                            <span style={s.badge(d.stickyKnight)}>{d.stickyKnight ? 'Yes' : 'No'}</span>
                          </td>
                          <td style={s.td}>
                            <span style={s.badge(entry.syncedToServer)}>{entry.syncedToServer ? 'Yes' : 'No'}</span>
                          </td>
                          <td style={s.td}>
                            <div style={s.runeChips}>
                              {Object.entries(d.runeUsageMap).map(([id, count]) => (
                                <span key={id} style={s.runeChip}>{id}: {count}</span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div style={s.statCard}>
      <div style={s.statValue}>{value}</div>
      <div style={s.statLabel}>{label}</div>
    </div>
  );
}
