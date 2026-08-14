import { useEffect, useMemo, useState } from 'react';
import { getArchivedSessions } from '../api';
import { useAuth } from '../context/AuthContext';
import type { ArchivedSession } from '../types';
import { colors, fontSans, fontSerif } from '../theme';
import { formatDurationMs } from '../utils/formatTime';
import RuneUsagePanel from '../components/RuneUsagePanel';

const s = {
  container: { maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: colors.link,
    fontWeight: 600,
    fontSize: '0.9rem',
    padding: 0,
    marginBottom: '1.25rem',
  },
  heading: { fontFamily: fontSerif, fontSize: '1.6rem', fontWeight: 700, marginBottom: '1.5rem', color: colors.text },
  subheading: { fontFamily: fontSerif, fontSize: '1.15rem', fontWeight: 700, color: colors.text, margin: '1.75rem 0 0.75rem' },
  sectionHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '1.75rem 0 0.75rem' },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  statCard: {
    background: colors.panel,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    padding: '0.9rem',
    textAlign: 'center' as const,
  },
  statValue: { fontFamily: fontSerif, fontSize: '1.4rem', fontWeight: 700, color: colors.accentText },
  statLabel: { fontSize: '0.78rem', color: colors.textFaint, marginTop: '0.2rem' },
  list: {
    background: colors.panel,
    borderRadius: 8,
    border: `1px solid ${colors.border}`,
    overflow: 'hidden',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.65rem 1rem',
    borderBottom: `1px solid ${colors.border}`,
    cursor: 'pointer',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: colors.accentSoft,
    color: colors.accentText,
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
    color: colors.text,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  rowSubtitle: {
    fontSize: '0.78rem',
    color: colors.textFaint,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  rowMeta: { display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 },
  rowTime: { fontSize: '0.78rem', color: colors.textFaint, minWidth: 64, textAlign: 'right' as const },
  sha: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: '0.72rem',
    color: colors.textMuted,
    background: colors.panelAlt,
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    padding: '0.1rem 0.4rem',
  },
  chevron: (open: boolean) => ({
    width: 14,
    height: 14,
    color: colors.textFaint,
    transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
    transition: 'transform 0.15s',
    flexShrink: 0,
  }),
  expandedPanel: {
    padding: '0.75rem 1rem 1rem 3.55rem',
    background: colors.panelAlt,
    borderBottom: `1px solid ${colors.border}`,
  },
  expandedLabel: {
    fontSize: '0.7rem',
    fontWeight: 700,
    color: colors.textFaint,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: '0.4rem',
  },
  pill: (tone: 'green' | 'amber' | 'gray' | 'accent') => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.1rem 0.5rem',
    borderRadius: 12,
    fontSize: '0.7rem',
    fontWeight: 600,
    background: tone === 'green' ? colors.successSoft : tone === 'amber' ? colors.warningSoft : tone === 'accent' ? colors.accentSoft : colors.panelAlt,
    color: tone === 'green' ? colors.successText : tone === 'amber' ? colors.warningText : tone === 'accent' ? colors.accentText : colors.textFaint,
    whiteSpace: 'nowrap' as const,
  }),
  durationBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.15rem 0.55rem',
    borderRadius: 12,
    fontSize: '0.78rem',
    fontWeight: 700,
    fontFamily: fontSerif,
    background: colors.accentSoft,
    color: colors.accentText,
    whiteSpace: 'nowrap' as const,
    flexShrink: 0,
  },
  errorBox: { padding: '0.75rem 1rem', background: colors.dangerSoft, border: `1px solid ${colors.danger}`, borderRadius: 6, color: colors.dangerText },
  emptyMsg: { color: colors.textFaint, textAlign: 'center' as const, padding: '2rem' },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '0.5rem 1rem',
    marginBottom: '1rem',
  },
  detailItem: { display: 'flex', flexDirection: 'column' as const, gap: '0.1rem' },
  detailLabel: { fontSize: '0.68rem', color: colors.textFaint, textTransform: 'uppercase' as const, letterSpacing: '0.04em' },
  detailValue: { fontSize: '0.85rem', color: colors.textMuted, fontWeight: 600, overflowWrap: 'anywhere' as const },
  activityWrap: {
    display: 'flex',
    alignItems: 'stretch',
    gap: '1rem',
    background: colors.panel,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    padding: '1rem',
    overflowX: 'auto' as const,
  },
  activityMain: { flex: 1, minWidth: 0 },
  activityInner: { display: 'inline-flex', gap: '0.3rem' },
  activityDayLabels: { display: 'flex', flexDirection: 'column' as const, gap: '3px', marginTop: '1.05rem' },
  activityDayLabel: { fontSize: '0.65rem', color: colors.textFaint, height: 11, lineHeight: '11px' },
  activityMonthRow: { display: 'flex', gap: '3px', marginBottom: '0.25rem' },
  activityMonthLabel: { width: 11, fontSize: '0.65rem', color: colors.textFaint, whiteSpace: 'nowrap' as const },
  activityGrid: { display: 'flex', gap: '3px' },
  activityCol: { display: 'flex', flexDirection: 'column' as const, gap: '3px' },
  activityCell: { width: 11, height: 11, borderRadius: 2 },
  activityLegend: { display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.6rem', fontSize: '0.7rem', color: colors.textFaint },
  activityYearMenu: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.2rem',
    flexShrink: 0,
    minWidth: 56,
    borderLeft: `1px solid ${colors.border}`,
    paddingLeft: '0.6rem',
    overflowY: 'auto' as const,
  },
  activityYearBtn: (active: boolean) => ({
    background: active ? colors.accentSoft : 'none',
    border: 'none',
    borderRadius: 6,
    color: active ? colors.accentText : colors.textMuted,
    cursor: 'pointer',
    padding: '0.3rem 0.4rem',
    fontSize: '0.85rem',
    fontWeight: active ? 700 : 500,
    textAlign: 'left' as const,
  }),
  monthChartWrap: {
    background: colors.panel,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    padding: '1rem',
    marginTop: '0.75rem',
  },
  monthChartHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', gap: '0.5rem' },
  monthChartTitle: { display: 'flex', alignItems: 'baseline', gap: '0.5rem', fontFamily: fontSerif, fontSize: '1rem', fontWeight: 700, color: colors.text },
  monthChartTotal: { fontFamily: fontSans, fontSize: '0.75rem', fontWeight: 500, color: colors.textFaint },
  monthNavBtn: (disabled: boolean) => ({
    background: colors.panelAlt,
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    color: disabled ? colors.textDisabled : colors.text,
    cursor: disabled ? 'default' : 'pointer',
    width: 28,
    height: 28,
    fontSize: '1rem',
    lineHeight: 1,
    opacity: disabled ? 0.5 : 1,
  }),
  monthChartBars: { display: 'flex', alignItems: 'flex-end', gap: 2, height: 140, overflowX: 'auto' as const },
  monthChartBarCol: { flex: '1 0 8px', display: 'flex', flexDirection: 'column-reverse' as const, height: '100%', minWidth: 6 },
  monthChartBar: { width: '100%', borderRadius: '2px 2px 0 0', transition: 'height 0.15s' },
  monthChartAxis: { display: 'flex', gap: 2, marginTop: '0.3rem' },
  monthChartAxisLabel: { flex: '1 0 8px', minWidth: 6, textAlign: 'center' as const, fontSize: '0.62rem', color: colors.textFaint },
} as const;

const ACTIVITY_LEVEL_COLORS = [colors.panelAlt, '#7c3a17', '#a8460f', colors.accent, colors.accentText];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function dayKey(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function activityLevel(value: number, max: number) {
  if (value <= 0) return 0;
  if (max <= 0) return 4;
  const ratio = value / max;
  if (ratio > 0.75) return 4;
  if (ratio > 0.5) return 3;
  if (ratio > 0.25) return 2;
  return 1;
}

/** Builds Sun-Sat weeks fully covering [rangeStart, rangeEnd]. */
function buildWeeksInRange(rangeStart: Date, rangeEnd: Date): Date[][] {
  const start = new Date(rangeStart);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());

  const end = new Date(rangeEnd);
  end.setHours(0, 0, 0, 0);
  end.setDate(end.getDate() + (6 - end.getDay()));

  const weeks: Date[][] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

function ActivityGrid({ sessions, year, years, onYearChange }: { sessions: ArchivedSession[]; year: number; years: number[]; onYearChange: (year: number) => void }) {
  // Keyed by day, summing play duration (ms) rather than counting sessions — hours
  // splashed is the metric that matters, not how many separate sessions produced it.
  const durations = new Map<string, number>();
  for (const entry of sessions) {
    const key = dayKey(entry.createdTimestamp);
    durations.set(key, (durations.get(key) ?? 0) + sessionDurationMs(entry.session));
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weeks = buildWeeksInRange(new Date(year, 0, 1), new Date(year, 11, 31));
  const inRange = (date: Date) => date.getFullYear() === year;

  // Scale color intensity relative to the visible year only, not all-time history.
  let max = 0;
  for (const week of weeks) {
    for (const date of week) {
      if (date > today || !inRange(date)) continue;
      max = Math.max(max, durations.get(dayKey(date.getTime())) ?? 0);
    }
  }

  let lastMonth = -1;
  const monthLabels = weeks.map((week) => {
    // Skip the leading padding week(s) that belong to the previous year — labeling them
    // would put "Dec" right next to "Jan" with barely a column between them.
    if (week[0].getFullYear() !== year) return '';
    const m = week[0].getMonth();
    if (m !== lastMonth) {
      lastMonth = m;
      return MONTH_LABELS[m];
    }
    return '';
  });

  return (
    <div style={s.activityWrap}>
      <div style={s.activityMain}>
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
                    if (date > today || !inRange(date)) return <div key={di} style={{ ...s.activityCell, background: ACTIVITY_LEVEL_COLORS[0] }} />;
                    const durationMs = durations.get(dayKey(date.getTime())) ?? 0;
                    const level = activityLevel(durationMs, max);
                    const dateLabel = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                    return (
                      <div
                        key={di}
                        style={{ ...s.activityCell, background: ACTIVITY_LEVEL_COLORS[level] }}
                        title={durationMs > 0 ? `${formatDurationMs(durationMs)} splashed on ${dateLabel}` : `No time splashed on ${dateLabel}`}
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
      <div style={s.activityYearMenu}>
        {years.map((y) => (
          <button key={y} type="button" style={s.activityYearBtn(y === year)} onClick={() => onYearChange(y)}>
            {y}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Daily-resolution bar chart of hours splashed within a single month, with prev/next navigation. */
function MonthlyHoursChart({ sessions, month, onMonthChange }: { sessions: ArchivedSession[]; month: Date; onMonthChange: (month: Date) => void }) {
  const year = month.getFullYear();
  const mo = month.getMonth();
  const daysInMonth = new Date(year, mo + 1, 0).getDate();

  const hoursByDay = useMemo(() => {
    const ms = new Array(daysInMonth).fill(0);
    for (const entry of sessions) {
      const d = new Date(entry.createdTimestamp);
      if (d.getFullYear() === year && d.getMonth() === mo) {
        ms[d.getDate() - 1] += sessionDurationMs(entry.session);
      }
    }
    return ms.map((v) => v / 3_600_000);
  }, [sessions, year, mo, daysInMonth]);

  const maxHours = Math.max(...hoursByDay, 0.0001);
  const totalHours = hoursByDay.reduce((a, b) => a + b, 0);

  const today = new Date();
  const isCurrentMonth = year === today.getFullYear() && mo === today.getMonth();

  return (
    <div style={s.monthChartWrap}>
      <div style={s.monthChartHeader}>
        <button type="button" style={s.monthNavBtn(false)} onClick={() => onMonthChange(new Date(year, mo - 1, 1))} aria-label="Previous month">
          ‹
        </button>
        <div style={s.monthChartTitle}>
          {month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          <span style={s.monthChartTotal}>{totalHours.toFixed(1)}h splashed</span>
        </div>
        <button
          type="button"
          style={s.monthNavBtn(isCurrentMonth)}
          onClick={() => !isCurrentMonth && onMonthChange(new Date(year, mo + 1, 1))}
          disabled={isCurrentMonth}
          aria-label="Next month"
        >
          ›
        </button>
      </div>
      <div style={s.monthChartBars}>
        {hoursByDay.map((h, i) => {
          const date = new Date(year, mo, i + 1);
          const label = `${h > 0 ? formatDurationMs(h * 3_600_000) : 'No time'} splashed on ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
          return (
            <div key={i} style={s.monthChartBarCol} title={label}>
              <div
                style={{
                  ...s.monthChartBar,
                  height: `${Math.max(h > 0 ? 3 : 0, (h / maxHours) * 100)}%`,
                  background: h > 0 ? colors.accent : colors.panelAlt,
                }}
              />
            </div>
          );
        })}
      </div>
      <div style={s.monthChartAxis}>
        {hoursByDay.map((_, i) => (
          <span key={i} style={s.monthChartAxisLabel}>{i === 0 || (i + 1) % 5 === 0 ? i + 1 : ''}</span>
        ))}
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

/** A session's play duration in ms — `logoutTime` is when the session ended normally;
 *  fall back to `endTime` for sessions that don't have it populated. */
function sessionDurationMs(d: ArchivedSession['session']): number {
  const start = new Date(d.startTime).getTime();
  const end = new Date(d.logoutTime || d.endTime || d.startTime).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0;
  return end - start;
}

function calcStats(sessions: ArchivedSession[]) {
  let spells = 0, xp = 0, runeCost = 0, totalPlayedMs = 0;
  for (const entry of sessions) {
    spells += entry.session.spellsCast;
    xp += entry.session.currentMagicXp - entry.session.startMagicXp;
    runeCost += entry.session.runeCostGp;
    totalPlayedMs += sessionDurationMs(entry.session);
  }
  return { spells, xp, runeCost, totalPlayedMs };
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
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Computed once per mount rather than at module load, so a long-lived tab doesn't
  // carry a stale "current year" across a real-world rollover.
  const [CURRENT_YEAR] = useState(() => new Date().getFullYear());

  const [activityYear, setActivityYear] = useState(CURRENT_YEAR);

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

  // Years that actually have recorded sessions, most recent first — populates the year menu.
  const sessionYears = useMemo(() => {
    const set = new Set<number>();
    for (const entry of sessions) set.add(new Date(entry.createdTimestamp).getFullYear());
    return [...set].sort((a, b) => b - a);
  }, [sessions]);

  // Default to the most recent year with recorded activity once sessions load, rather than
  // always the current calendar year (which may have no data yet).
  useEffect(() => {
    if (sessionYears.length > 0 && !sessionYears.includes(activityYear)) {
      setActivityYear(sessionYears[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionYears]);

  const [selectedMonth, setSelectedMonth] = useState<Date>(() => new Date());

  // Default the monthly chart to the most recent month with recorded activity, once sessions load.
  const latestSessionTs = useMemo(() => sessions.reduce((max, e) => Math.max(max, e.createdTimestamp), 0), [sessions]);
  useEffect(() => {
    if (latestSessionTs > 0) {
      const d = new Date(latestSessionTs);
      setSelectedMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestSessionTs]);

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
            <StatCard value={formatDurationMs(stats.totalPlayedMs)} label="Time splashed" />
          </div>

          {sessions.length > 0 && (
            <>
              <div style={s.sectionHeader}>
                <h3 style={{ ...s.subheading, margin: 0 }}>Activity</h3>
              </div>
              <ActivityGrid sessions={sessions} year={activityYear} years={sessionYears} onYearChange={setActivityYear} />
              <MonthlyHoursChart sessions={sessions} month={selectedMonth} onMonthChange={setSelectedMonth} />
            </>
          )}

          <h3 style={s.subheading}>Sessions ({sessions.length})</h3>

          {sessions.length === 0 ? (
            <p style={s.emptyMsg}>No sessions recorded.</p>
          ) : (
            <>
              <style>{`.session-row:hover { background: ${colors.panelAlt}; } .session-row:last-child { border-bottom: none; }`}</style>
              <div style={s.list}>
                {[...sessions]
                  .sort((a, b) => b.createdTimestamp - a.createdTimestamp)
                  .map((entry: ArchivedSession) => {
                    const d = entry.session;
                    const xpGained = d.currentMagicXp - d.startMagicXp;
                    const isOpen = expandedId === entry.sessionId;
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
                            <span style={s.durationBadge} title="Time splashed">
                              {formatDurationMs(sessionDurationMs(d))}
                            </span>
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
                            <div style={s.expandedLabel}>Session Details</div>
                            <div style={s.detailGrid}>
                              <div style={s.detailItem}>
                                <span style={s.detailLabel}>Player</span>
                                <span style={s.detailValue}>{d.playerName}</span>
                              </div>
                              <div style={s.detailItem}>
                                <span style={s.detailLabel}>Rune cost / cast</span>
                                <span style={s.detailValue}>{fmt(d.runeCostPerCast)} gp</span>
                              </div>
                              <div style={s.detailItem}>
                                <span style={s.detailLabel}>Started</span>
                                <span style={s.detailValue}>{new Date(d.startTime).toLocaleString()}</span>
                              </div>
                              <div style={s.detailItem}>
                                <span style={s.detailLabel}>Logged out</span>
                                <span style={s.detailValue}>{d.logoutTime ? new Date(d.logoutTime).toLocaleString() : '—'}</span>
                              </div>
                              {d.endTime && (
                                <div style={s.detailItem}>
                                  <span style={s.detailLabel}>Ended</span>
                                  <span style={s.detailValue}>{new Date(d.endTime).toLocaleString()}</span>
                                </div>
                              )}
                              <div style={s.detailItem}>
                                <span style={s.detailLabel}>Duration</span>
                                <span style={s.detailValue}>{formatDurationMs(sessionDurationMs(d))}</span>
                              </div>
                              <div style={s.detailItem}>
                                <span style={s.detailLabel}>Highest players</span>
                                <span style={s.detailValue}>{fmt(d.highestPlayerCount)}</span>
                              </div>
                              <div style={s.detailItem}>
                                <span style={s.detailLabel}>Pickpocketers</span>
                                <span style={s.detailValue}>{fmt(d.currentPlayerCount ?? 0)}</span>
                              </div>
                              <div style={s.detailItem}>
                                <span style={s.detailLabel}>Starting rune count</span>
                                <span style={s.detailValue}>{fmt(d.startingRuneCount)}</span>
                              </div>
                              <div style={s.detailItem}>
                                <span style={s.detailLabel}>Ending rune count</span>
                                <span style={s.detailValue}>{fmt(d.currentRuneCount)}</span>
                              </div>
                              <div style={s.detailItem}>
                                <span style={s.detailLabel}>Finalized</span>
                                <span style={s.detailValue}>{entry.finalizedTimestamp ? fmtDate(entry.finalizedTimestamp) : '—'}</span>
                              </div>
                              <div style={s.detailItem}>
                                <span style={s.detailLabel}>Synced to server</span>
                                <span style={s.detailValue}>{entry.syncedToServer ? 'Yes' : 'No'}</span>
                              </div>
                            </div>

                            <div style={s.expandedLabel}>Runes Used</div>
                            <RuneUsagePanel runeUsageMap={d.runeUsageMap} />
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
