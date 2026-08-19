import { useEffect, useState, useCallback } from 'react';
import { getSplasherVotes, voteSplasher } from '../api';
import type { ActiveSession, SplasherVotes } from '../types';
import './SessionPanel.css';
import Icon from './Icon';
import Tile from './Tile';
import PixelText from './chatbox/PixelText';
import worldsData from '../worldsData';
import { formatRelativeTime, formatDurationMs } from '../utils/formatTime';
import type * as CSS from 'csstype';

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
  iconMargin,
}: {
  label: string;
  value: string;
  icon?: TileIcon;
  iconPosition?: 'start' | 'end' | 'label';
  iconMargin?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
}) {
  const style: CSS.Properties = {
    margin: iconMargin
  }
  const tileIcon = icon ? (
    <Icon
      className="session-panel-tile-icon"
      name={icon.name}
      spell={icon.spell}
      src={icon.src}
      size={icon.size}
      alt={icon.alt ?? `${label} icon`}
      style={style}
    />
  ) : null;

  return (
    <Tile
      width={width}
      height={height}
      className={`session-panel-tile ${className ?? ''}`}
      contentClassName="session-panel-tile-content"
    >
      <div className="session-panel-tile-label">
        {iconPosition === 'label' && (
          <div className='session-panel-tile-label-icon'>
            {tileIcon}
          </div>
        )}
        <div className='session-panel-tile-label-text'>
          <PixelText text={`${label}:`} fontSize={16} color="#F29130" />
        </div>
      </div>
      <div className="session-panel-tile-value">
        {iconPosition === 'start' && (
          <div className='session-panel-tile-label-icon'>
            {tileIcon}
          </div>
        )}
        <div className='session-panel-tile-label-text'>
          <PixelText text={value} fontSize={16} color="#0CBA0C" />
        </div>
        {iconPosition === 'end' && (
          <div className='session-panel-tile-label-icon'>
            {tileIcon}
          </div>
        )}
      </div>
    </Tile>
  );
}

/** Anonymous like/dislike buttons for a splasher. Voter identity is tracked server-side (e.g.
 *  by IP), so clicking a button always just sends that value — the backend decides whether it's
 *  a new vote, a retraction (clicking the same value again), or a switch (clicking the other
 *  value), and returns the up-to-date tally + the caller's resulting vote. */
function VoteButtons({ username }: { username: string }) {
  const [votes, setVotes] = useState<SplasherVotes | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getSplasherVotes(username)
      .then((v) => { if (!cancelled) setVotes(v); })
      .catch(() => { /* vote counts are non-critical; leave buttons in their default state */ });
    return () => { cancelled = true; };
  }, [username]);

  const handleVote = useCallback((value: 1 | -1) => {
    if (pending) return;
    setPending(true);
    voteSplasher(username, value)
      .then(setVotes)
      .catch(() => { /* leave prior tally on failure, e.g. rate-limited */ })
      .finally(() => setPending(false));
  }, [username, pending]);

  const liked = votes?.myVote === 1;
  const disliked = votes?.myVote === -1;

  // No votes yet reads as a full green bar (nothing dragging it down), same as a splasher
  // with only likes.
  const likes = votes?.likes ?? 0;
  const dislikes = votes?.dislikes ?? 0;
  const totalVotes = likes + dislikes;
  const likePct = totalVotes === 0 ? 100 : (likes / totalVotes) * 100;

  // Like always renders left, dislike always renders right, so each one only picks up the
  // outward-facing edge highlight (matching the reference asset) when it's the sole visible
  // segment on that side — the boundary between two nonzero segments has no reference pixels
  // to match, so it's left plain rather than guessed.
  const likeIsRightmost = dislikes === 0;
  const dislikeIsLeftmost = likes === 0;

  return (
    <div className="session-panel-vote-section">
      <div
        className="session-panel-vote-ratio-outer"
        role="img"
        aria-label={totalVotes === 0 ? 'No votes yet' : `${Math.round(likePct)}% liked, ${Math.round(100 - likePct)}% disliked`}
      >
        <div className="session-panel-vote-ratio-highlight">
          <div className="session-panel-vote-ratio-shadow">
            <div className="session-panel-vote-ratio-track">
              <div
                className={`session-panel-vote-ratio-fill-like${likeIsRightmost ? ' is-rightmost' : ''}`}
                style={{ width: `${likePct}%` }}
              />
              <div
                className={`session-panel-vote-ratio-fill-dislike${dislikeIsLeftmost ? ' is-leftmost' : ''}`}
                style={{ width: `${100 - likePct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="session-panel-vote-row">
        <button
          type="button"
          className="session-panel-vote-btn like-btn"
          aria-label="Like"
          aria-pressed={liked}
          disabled={pending}
          onClick={() => handleVote(1)}
        >
          <Icon
            name={liked ? 'components.buttons.like.selected' : 'components.buttons.like.unselected'}
            size="2.5em"
            alt="Like"
          />
        </button>
        <button
          type="button"
          className="session-panel-vote-btn dislike-btn"
          aria-label="Dislike"
          aria-pressed={disliked}
          disabled={pending}
          onClick={() => handleVote(-1)}
        >
          <Icon
            name={disliked ? 'components.buttons.dislike.selected' : 'components.buttons.dislike.unselected'}
            size="2.5em"
            alt="Dislike"
          />
        </button>
      </div>
    </div>
  );
}

interface Props {
  session: ActiveSession;
  onSelectUser?: (username: string) => void;
}

/** A single splasher's card: username, optional community links, their live stat tiles, and
 *  the anonymous like/dislike bar — everything AllSplashersView's grid repeats per session. */
export default function SessionPanel({ session, onSelectUser }: Props) {
  const d = session.sessionData;
  const location = worldsData.find((w) => w.world === d?.world)?.location;
  const iconName = location ? LOCATION_ICONS[location] : undefined;
  if (d?.world && !iconName) {
    console.warn(`Unknown world ${d.world} for user ${session.username}`);
  }

  return (
    <div className="session-panel">
      <button className="session-panel-username" type="button" onClick={() => onSelectUser?.(session.username)}>
        <span>{session.username}</span>
      </button>

      {session.communities && session.communities.length > 0 && (
        <div className="session-panel-community-links">
          {session.communities.map((c) => (
            <a
              key={c.communityId}
              className="session-panel-community-link"
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
          <div className="session-panel-pair-row">
            <StatTile label="World" value={String(d.world)} icon={{ name: iconName, size: '1.35em' }} />
            <StatTile
              label="Thievers"
              value={fmt(d.currentPlayerCount ?? 0)}
              icon={{ name: 'thieving', size: '1.25em' }}
              iconPosition="start"
            />
          </div>
          <StatTile
            label="XP Gained"
            value={fmt(d.currentMagicXp - d.startMagicXp)}
            icon={{ name: 'xp' , size: '1.25em'}}
            iconPosition="label"
            className="session-panel-tile-wide"
          />
          <div className="session-panel-pair-row">
            <StatTile
              label={"Knight Type"}
              value={d.stickyKnight ? 'Sticky' : 'Regular'}
              icon={{
                name: d.stickyKnight ? 'knight.sticky' : 'knight.normal',
                size: '1.2em',
              }}
              iconMargin='0 0 .25em 0'
            />
            <StatTile
              label="Spells Cast"
              value={fmt(d.spellsCast)}
              icon={{ name: d.spell, size: '1.55em' }}
              iconMargin='0 -.4em 0 -.5em'
            />
          </div>
          <div className="session-panel-pair-row">
            <StatTile
              label={"Session\nStart time"}
              value={formatRelativeTime(new Date(d.startTime))}
              icon={{ name: 'start', size: '1.2em'}}
              iconMargin='0 -.2em .25em 0'
            />
            <StatTile
              label={"Latest\nSession Update"}
              value={timeSince(session.lastUpdate)}
              icon={{ name: 'update', size: '1.2em'}}
              iconMargin='0 -.2em .25em 0'

            />
          </div>
          <StatTile
            label="Session duration"
            value={fmtDuration(d.startTime)}
            className="session-panel-tile-wide"
          />
        </>
      ) : (
        <p className="session-panel-no-data">Session data pending…</p>
      )}

      <VoteButtons username={session.username} />
    </div>
  );
}
