import { useEffect, useState, useCallback } from 'react';
import { getActiveSessions } from '../api';
import type { ActiveSession } from '../types';
import './AllSplashersView.css';
import Icon from '../components/Icon';
import Tile from '../components/Tile';
import worldsData from '../worldsData';
import { formatRelativeTime, formatDurationMs } from '../utils/formatTime';

function fmt(n: number) { return n.toLocaleString(); }
function timeSince(ts: number) {
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  return `${Math.floor(min / 60)}h ago`;
}
function fmtDuration(startIso: string) {
  const start = new Date(startIso).getTime();
  if (Number.isNaN(start)) return '—';
  return formatDurationMs(Date.now() - start);
}

const LOCATION_ICONS: Record<string, string> = {
  'United Kingdom': 'location.uk',
  'United States (east)': 'location.useast',
  'United States (west)': 'location.uswest',
  Australia: 'location.aus',
  Germany: 'location.ger',
  Brazil: 'location.bra',
  Japan: 'location.jap',
  Singapore: 'location.sin',
};

type TileIcon = {
  name?: string;
  spell?: string;
  src?: string;
  size?: number | string;
  alt?: string;
};

function StatTile({
  label,
  value,
  icon,
  iconPosition = 'start',
  width,
  height,
  className,
}: {
  label: string;
  value: string;
  icon?: TileIcon;
  iconPosition?: 'start' | 'end';
  width?: number | string;
  height?: number | string;
  className?: string;
}) {
  const tileIcon = icon ? (
    <Icon
      className="all-splashers-tile-icon"
      name={icon.name}
      spell={icon.spell}
      src={icon.src}
      size={icon.size}
      alt={icon.alt ?? `${label} icon`}
    />
  ) : null;

  return (
    <Tile
      width={width}
      height={height}
      className={`all-splashers-tile ${className ?? ''}`}
      contentClassName="all-splashers-tile-content"
    >
      <div className="all-splashers-tile-label">{label}:</div>
      <div className="all-splashers-tile-value-inline">
        {iconPosition === 'start' && tileIcon}
        <span className="all-splashers-tile-value">{value}</span>
        {iconPosition === 'end' && tileIcon}
      </div>
    </Tile>
  );
}

function SessionCard({ session, onSelectUser }: { session: ActiveSession; onSelectUser?: (username: string) => void }) {
  const d = session.sessionData;
  const location = worldsData.find((w) => w.world === d?.world)?.location;
  const iconName = location ? LOCATION_ICONS[location] : undefined;
  if (d?.world && !iconName) {
    console.warn(`Unknown world ${d.world} for user ${session.username}`);
  }

  return (
    <div className="all-splashers-panel">
      <button className="all-splashers-username" type="button" onClick={() => onSelectUser?.(session.username)}>
        {session.username}
      </button>

      {session.communities && session.communities.length > 0 && (
        <div className="all-splashers-community-links">
          {session.communities.map((c) => (
            <a
              key={c.communityId}
              className="all-splashers-community-link"
              href={c.discordInviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              Splashing for {c.communityName} ↗
            </a>
          ))}
        </div>
      )}

      {d ? (
        <>
          <div className="all-splashers-pair-row">
            <StatTile label="World" value={String(d.world)} icon={{ name: iconName, size: '1.35em' }} />
            <StatTile
              label="Thievers"
              value={fmt(d.pickpocketerCount)}
              icon={{ name: 'thieving', size: '1em' }}
              iconPosition="end"
            />
          </div>
          <StatTile label="XP Gained" value={fmt(d.currentMagicXp - d.startMagicXp)} icon={{ name: 'xp' }} iconPosition="end" className="all-splashers-tile-wide" />
          <div className="all-splashers-pair-row">
            <StatTile
              label="Knight type"
              value={d.stickyKnight ? 'Sticky' : 'Regular'}
              icon={{
                name: d.stickyKnight ? 'knight.sticky' : 'knight.normal',
                size: '.8em',
              }}
            />
            <StatTile label="Spells Cast" value={fmt(d.spellsCast)} icon={{ name: d.spell }} />
          </div>
          <div className="all-splashers-pair-row">
            <StatTile label="Session Started" value={formatRelativeTime(new Date(d.startTime))} />
            <StatTile label="Last Update" value={timeSince(session.lastUpdate)} />
          </div>
          <StatTile label="Time Played" value={fmtDuration(d.startTime)} className="all-splashers-tile-wide" />
        </>
      ) : (
        <p className="all-splashers-no-data">Session data pending…</p>
      )}
    </div>
  );
}

interface Props {
  onSelectUser?: (username: string) => void;
}

export default function AllSplashersView({ onSelectUser }: Props) {
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
    <div className="all-splashers-view">
      <div className="all-splashers-header">
        <div>
          <h2 className="all-splashers-heading">Active Splashers</h2>
          {lastRefresh && (
            <div className="all-splashers-meta">Updated {lastRefresh.toLocaleTimeString()} · auto-refreshes every 15s</div>
          )}
        </div>
        <button className="all-splashers-refresh-btn" onClick={() => { void load(); }} type="button">
          ↻ Refresh
        </button>
      </div>

      {error && <div className="all-splashers-error-box">{error}</div>}

      {loading && <p className="all-splashers-empty-msg">Loading…</p>}

      {!loading && !error && sessions.length === 0 && (
        <p className="all-splashers-empty-msg">No splashers are currently active.</p>
      )}

      {!error && sessions.length > 0 && (
        <div className="all-splashers-grid">
          {sessions.map((session) => (
            <SessionCard key={session.username} session={session} onSelectUser={onSelectUser} />
          ))}
        </div>
      )}
    </div>
  );
}
