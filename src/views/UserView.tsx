import { useEffect, useState } from 'react';
import { getArchivedSessions, setSplasherWebhook } from '../api';
import { useAuth } from '../context/AuthContext';
import WebhookFieldsEditor from '../components/WebhookFieldsEditor';
import type { ArchivedSession, SplasherWebhooks } from '../types';

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
  list: {
    background: '#fff',
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.65rem 1rem',
    borderBottom: '1px solid #eef0f2',
    cursor: 'pointer',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: '#e0e7ff',
    color: '#4338ca',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.8rem',
    flexShrink: 0,
  },
  rowMain: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' as const, gap: '0.15rem' },
  rowTitle: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#1f2937',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  rowSubtitle: {
    fontSize: '0.78rem',
    color: '#6b7280',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  rowMeta: { display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 },
  rowTime: { fontSize: '0.78rem', color: '#6b7280', minWidth: 64, textAlign: 'right' as const },
  sha: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: '0.72rem',
    color: '#57606a',
    background: '#f6f8fa',
    border: '1px solid #d0d7de',
    borderRadius: 6,
    padding: '0.1rem 0.4rem',
  },
  chevron: (open: boolean) => ({
    width: 14,
    height: 14,
    color: '#6b7280',
    transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
    transition: 'transform 0.15s',
    flexShrink: 0,
  }),
  expandedPanel: {
    padding: '0.75rem 1rem 1rem 3.55rem',
    background: '#f9fafb',
    borderBottom: '1px solid #eef0f2',
  },
  expandedLabel: {
    fontSize: '0.7rem',
    fontWeight: 700,
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: '0.4rem',
  },
  pill: (tone: 'green' | 'amber' | 'gray') => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.1rem 0.5rem',
    borderRadius: 12,
    fontSize: '0.7rem',
    fontWeight: 600,
    background: tone === 'green' ? '#d1fae5' : tone === 'amber' ? '#fef3c7' : '#f3f4f6',
    color: tone === 'green' ? '#065f46' : tone === 'amber' ? '#92400e' : '#6b7280',
    whiteSpace: 'nowrap' as const,
  }),
  errorBox: { padding: '0.75rem 1rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 6, color: '#991b1b' },
  emptyMsg: { color: '#9ca3af', textAlign: 'center' as const, padding: '2rem' },
  runeChips: { display: 'flex', flexWrap: 'wrap' as const, gap: '0.35rem' },
  runeChip: { background: '#ede9fe', color: '#5b21b6', borderRadius: 4, padding: '0.15rem 0.5rem', fontSize: '0.78rem', fontWeight: 500 },
  activityWrap: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: '1rem',
    overflowX: 'auto' as const,
  },
  activityInner: { display: 'inline-flex', gap: '0.3rem' },
  activityDayLabels: { display: 'flex', flexDirection: 'column' as const, gap: '3px', marginTop: '1.05rem' },
  activityDayLabel: { fontSize: '0.65rem', color: '#6b7280', height: 11, lineHeight: '11px' },
  activityMonthRow: { display: 'flex', gap: '3px', marginBottom: '0.25rem' },
  activityMonthLabel: { width: 11, fontSize: '0.65rem', color: '#6b7280', whiteSpace: 'nowrap' as const },
  activityGrid: { display: 'flex', gap: '3px' },
  activityCol: { display: 'flex', flexDirection: 'column' as const, gap: '3px' },
  activityCell: { width: 11, height: 11, borderRadius: 2 },
  activityLegend: { display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.6rem', fontSize: '0.7rem', color: '#6b7280' },
  webhookCard: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1.1rem', marginBottom: '0.5rem' },
  webhookHint: { color: '#9ca3af', fontSize: '0.78rem', marginTop: '0.75rem' },
} as const;

const ACTIVITY_WEEKS = 53;
const ACTIVITY_LEVEL_COLORS = ['#ebedf0', '#bfdbfe', '#60a5fa', '#2563eb', '#1e3a5f'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function dayKey(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function activityLevel(count: number, max: number) {
  if (count === 0) return 0;
  if (max <= 1) return 4;
  const ratio = count / max;
  if (ratio > 0.75) return 4;
  if (ratio > 0.5) return 3;
  if (ratio > 0.25) return 2;
  return 1;
}

function ActivityGrid({ sessions }: { sessions: ArchivedSession[] }) {
  const counts = new Map<string, number>();
  for (const entry of sessions) {
    const key = dayKey(entry.createdTimestamp);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const max = Math.max(0, ...counts.values());

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - (ACTIVITY_WEEKS * 7 - 1));
  start.setDate(start.getDate() - start.getDay());

  const weeks: Date[][] = [];
  const cursor = new Date(start);
  for (let w = 0; w < ACTIVITY_WEEKS; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  let lastMonth = -1;
  const monthLabels = weeks.map((week) => {
    const m = week[0].getMonth();
    if (m !== lastMonth) {
      lastMonth = m;
      return MONTH_LABELS[m];
    }
    return '';
  });

  return (
    <div style={s.activityWrap}>
      <div style={s.activityInner}>
        <div style={s.activityDayLabels}>
          <div style={s.activityDayLabel} />
          <div style={s.activityDayLabel}>Mon</div>
          <div style={s.activityDayLabel} />
          <div style={s.activityDayLabel}>Wed</div>
          <div style={s.activityDayLabel} />
          <div style={s.activityDayLabel}>Fri</div>
          <div style={s.activityDayLabel} />
        </div>
        <div>
          <div style={s.activityMonthRow}>
            {monthLabels.map((label, i) => (
              <span key={i} style={s.activityMonthLabel}>{label}</span>
            ))}
          </div>
          <div style={s.activityGrid}>
            {weeks.map((week, wi) => (
              <div key={wi} style={s.activityCol}>
                {week.map((date, di) => {
                  if (date > today) return <div key={di} style={s.activityCell} />;
                  const count = counts.get(dayKey(date.getTime())) ?? 0;
                  const level = activityLevel(count, max);
                  return (
                    <div
                      key={di}
                      style={{ ...s.activityCell, background: ACTIVITY_LEVEL_COLORS[level] }}
                      title={`${count} session${count === 1 ? '' : 's'} on ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={s.activityLegend}>
        <span>Less</span>
        {ACTIVITY_LEVEL_COLORS.map((c, i) => (
          <span key={i} style={{ ...s.activityCell, background: c }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

function fmt(n: number) { return n.toLocaleString(); }
function fmtDate(ts: number) { return new Date(ts).toLocaleString(); }

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const min = 60_000, hr = 3_600_000, day = 86_400_000;
  if (diff < min) return 'just now';
  if (diff < hr) return `${Math.floor(diff / min)}m ago`;
  if (diff < day) return `${Math.floor(diff / hr)}h ago`;
  if (diff < day * 30) return `${Math.floor(diff / day)}d ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg style={s.chevron(open)} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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
  const { token, user } = useAuth();
  const [sessions, setSessions] = useState<ArchivedSession[]>([]);
  const [webhooks, setWebhooks] = useState<SplasherWebhooks>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      onLoginRequired?.();
      return;
    }
    setLoading(true);
    setError(null);
    getArchivedSessions(username, token)
      .then((data) => {
        setSessions(data.sessions);
        setWebhooks({
          discordActiveWebhookUrl: data.discordActiveWebhookUrl,
          discordHistoryWebhookUrl: data.discordHistoryWebhookUrl,
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load sessions.'))
      .finally(() => setLoading(false));
  }, [username, token, onLoginRequired]);

  const stats = calcStats(sessions);
  const isOwnProfile = user?.username === username;

  async function saveActiveWebhook(value: string) {
    if (!token) return;
    setWebhooks(await setSplasherWebhook(username, { activeWebhookUrl: value }, token));
  }

  async function saveHistoryWebhook(value: string) {
    if (!token) return;
    setWebhooks(await setSplasherWebhook(username, { historyWebhookUrl: value }, token));
  }

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

          {isOwnProfile && (
            <>
              <h3 style={s.subheading}>Discord webhooks</h3>
              <div style={s.webhookCard}>
                <WebhookFieldsEditor
                  activeUrl={webhooks.discordActiveWebhookUrl}
                  historyUrl={webhooks.discordHistoryWebhookUrl}
                  onSaveActive={saveActiveWebhook}
                  onSaveHistory={saveHistoryWebhook}
                />
                <p style={s.webhookHint}>
                  Personal webhooks, additive with any community you belong to — your posts go
                  to both.
                </p>
              </div>
            </>
          )}

          <div style={s.statsGrid}>
            <StatCard value={fmt(sessions.length)} label="Sessions" />
            <StatCard value={fmt(stats.spells)} label="Spells Cast" />
            <StatCard value={`${fmt(stats.xp)} XP`} label="Magic XP Gained" />
            <StatCard value={`${fmt(stats.runeCost)} gp`} label="Total Rune Cost" />
            <StatCard value={fmt(stats.knightMoves)} label="Knight Movements" />
          </div>

          {sessions.length > 0 && (
            <>
              <h3 style={s.subheading}>Activity</h3>
              <ActivityGrid sessions={sessions} />
            </>
          )}

          <h3 style={s.subheading}>Sessions ({sessions.length})</h3>

          {sessions.length === 0 ? (
            <p style={s.emptyMsg}>No sessions recorded.</p>
          ) : (
            <>
              <style>{`.session-row:hover { background: #f6f8fa; } .session-row:last-child { border-bottom: none; }`}</style>
              <div style={s.list}>
                {[...sessions]
                  .sort((a, b) => b.createdTimestamp - a.createdTimestamp)
                  .map((entry: ArchivedSession) => {
                    const d = entry.session;
                    const xpGained = d.currentMagicXp - d.startMagicXp;
                    const isOpen = expandedId === entry.sessionId;
                    const runeEntries = Object.entries(d.runeUsageMap);
                    return (
                      <div key={entry.sessionId}>
                        <div
                          className="session-row"
                          style={s.row}
                          role="button"
                          tabIndex={0}
                          aria-expanded={isOpen}
                          onClick={() => setExpandedId(isOpen ? null : entry.sessionId)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setExpandedId(isOpen ? null : entry.sessionId);
                            }
                          }}
                        >
                          <ChevronIcon open={isOpen} />
                          <div style={s.avatar}>{d.spell.charAt(0).toUpperCase()}</div>
                          <div style={s.rowMain}>
                            <div style={s.rowTitle}>{d.spell} · World {d.world}</div>
                            <div style={s.rowSubtitle}>
                              {fmt(d.spellsCast)} casts · +{fmt(xpGained)} XP · {fmt(d.runeCostGp)}gp · {fmt(d.knightMovements)} knight moves · {d.averagePlayerCount.toFixed(1)} avg players
                            </div>
                          </div>
                          <div style={s.rowMeta}>
                            {d.stickyKnight && <span style={s.pill('amber')}>Sticky</span>}
                            <span style={s.pill(entry.syncedToServer ? 'green' : 'gray')}>
                              {entry.syncedToServer ? 'Synced' : 'Pending'}
                            </span>
                            <span style={s.rowTime} title={fmtDate(entry.createdTimestamp)}>
                              {timeAgo(entry.createdTimestamp)}
                            </span>
                            <span style={s.sha}>{entry.sessionId.slice(0, 7)}</span>
                          </div>
                        </div>
                        {isOpen && (
                          <div style={s.expandedPanel}>
                            <div style={s.expandedLabel}>Runes Used</div>
                            {runeEntries.length === 0 ? (
                              <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>No runes recorded.</span>
                            ) : (
                              <div style={s.runeChips}>
                                {runeEntries.map(([id, count]) => (
                                  <span key={id} style={s.runeChip}>{id}: {count}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </>
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
