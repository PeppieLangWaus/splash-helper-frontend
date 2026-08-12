import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getArchivedSessions, getMyPayouts } from '../api';
import { logSystemEvent } from '../utils/systemLog';
import { logTradeEvent } from '../utils/tradeLog';

const POLL_INTERVAL_MS = 20_000;
// "-v2": these replace an older id-set format (capped at a fixed count, evicting oldest ids on
// overflow) that would resurrect and re-announce old history once an account passed the cap —
// see the Watermark comment below. New key names mean any leftover old-format value is just
// ignored rather than misparsed, so migration re-seeds quietly instead of replaying history once.
const SEEN_SESSIONS_KEY = 'chat:seen-sessions-v2';
const SEEN_SESSIONS_INIT_KEY = `${SEEN_SESSIONS_KEY}:init`;
const SEEN_PAYOUTS_KEY_PREFIX = 'chat:seen-payouts-v2:';

/**
 * "Seen up through timestamp `ts`, plus these specific ids that share that exact timestamp"
 * (ties need explicit ids since a bare timestamp can't distinguish them). Everything strictly
 * before `ts` is implicitly seen forever — no per-item bookkeeping needed, so this never grows
 * unbounded and never needs to evict/forget anything, unlike a capped id list would.
 */
interface Watermark {
  ts: number;
  ids: string[];
}

const EMPTY_WATERMARK: Watermark = { ts: -Infinity, ids: [] };

function loadWatermark(key: string): Watermark {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return EMPTY_WATERMARK;
    const parsed = JSON.parse(raw) as Partial<Watermark>;
    if (typeof parsed.ts !== 'number' || !Array.isArray(parsed.ids)) return EMPTY_WATERMARK;
    return { ts: parsed.ts, ids: parsed.ids };
  } catch {
    return EMPTY_WATERMARK;
  }
}

function saveWatermark(key: string, watermark: Watermark): void {
  try {
    localStorage.setItem(key, JSON.stringify(watermark));
  } catch {
    // Storage unavailable — the watermark just won't survive a reload.
  }
}

function formatGp(n: number): string {
  return Math.round(n).toLocaleString();
}

/**
 * Watches the logged-in user's own account for the real, server-side events point 7.5/7.7 ask
 * for — new archived sessions (and what they earned, if anything), and completed payout tickets
 * plus a running balance — and turns them into Private/Trade log entries via logSystemEvent/
 * logTradeEvent (utils/systemLog.ts, utils/tradeLog.ts).
 *
 * Neither event has a push channel from the backend today (session archiving happens over the
 * RuneLite plugin's own WebSocket connection, payouts happen via the Discord bot's /income and
 * /bank commands — the browser isn't party to either), so this polls the same way
 * usePublicSessionEvents does: diffing against a timestamp watermark persisted in localStorage
 * so a reload doesn't replay a user's entire history as "new". The very first poll (no watermark
 * stored yet) only seeds that baseline — it never emits for pre-existing history.
 *
 * Every poll re-fetches the account's *entire* session/payout history (no incremental endpoint
 * exists), so the watermark has to track "seen" indefinitely without ever forgetting — that's
 * why this is a timestamp high-water mark rather than a capped set of recently-seen ids. A
 * capped id set would eventually evict its oldest entries, at which point the still-unbounded
 * full history fetched next poll makes those evicted-but-already-announced items look "new"
 * again, bulk-replaying old archived-session/payout messages into the chat on a rolling basis.
 *
 * Runs unconditionally alongside the other local-feed hooks (see Chatbox.tsx); a no-op while
 * logged out.
 */
export function useAccountActivityEvents(intervalMs: number = POLL_INTERVAL_MS) {
  const { user, token } = useAuth();
  // Every communityId the user has ever earned in, discovered from their own archived sessions'
  // earningsSnapshot — there's no "communities I'm a member of" endpoint for a regular splasher,
  // so this is how the payout poll below learns which communities to check — plus each one's
  // running lifetime-earned total, for the balance shown alongside payout events.
  const totalEarnedByCommunity = useRef<Map<string, number>>(new Map());
  const initializedCommunityIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user || !token) return;
    let cancelled = false;

    async function pollSessions() {
      try {
        const data = await getArchivedSessions(user!.username, token!);
        if (cancelled) return;

        const watermark = loadWatermark(SEEN_SESSIONS_KEY);
        const isFirstRun = !localStorage.getItem(SEEN_SESSIONS_INIT_KEY);
        let newestTs = watermark.ts;
        let newestIds = new Set(watermark.ids);
        let changed = false;

        // Sorted ascending so both the watermark advances monotonically and, as a bonus, new
        // sessions get logged in chronological order rather than Mongo's unspecified return order.
        const sortedSessions = [...data.sessions].sort((a, b) => a.finalizedTimestamp - b.finalizedTimestamp);

        const earnedTotals = new Map<string, number>();
        for (const session of sortedSessions) {
          const hours = (session.finalizedTimestamp - session.createdTimestamp) / 3_600_000;
          for (const [communityId, earnings] of Object.entries(session.earningsSnapshot ?? {})) {
            earnedTotals.set(communityId, (earnedTotals.get(communityId) ?? 0) + hours * earnings.hourlyRate);
          }

          const ts = session.finalizedTimestamp;
          const alreadySeen = ts < watermark.ts || (ts === watermark.ts && watermark.ids.includes(session._id));
          if (alreadySeen) continue;

          changed = true;
          if (ts > newestTs) {
            newestTs = ts;
            newestIds = new Set([session._id]);
          } else {
            newestIds.add(session._id);
          }
          if (isFirstRun) continue; // establish the baseline quietly, don't replay old history

          const xpGained = session.session.currentMagicXp - session.session.startMagicXp;
          logSystemEvent(
            `Archived a splash session (${session.session.spellsCast.toLocaleString()} casts, ${xpGained.toLocaleString()} XP)`,
          );

          for (const earnings of Object.values(session.earningsSnapshot ?? {})) {
            const amount = hours * earnings.hourlyRate;
            if (amount > 0) {
              logTradeEvent(`Earned ${formatGp(amount)} gp from a splash session (${earnings.rankName})`);
            }
          }
        }
        totalEarnedByCommunity.current = earnedTotals;

        if (changed) {
          saveWatermark(SEEN_SESSIONS_KEY, { ts: newestTs, ids: [...newestIds] });
          try {
            localStorage.setItem(SEEN_SESSIONS_INIT_KEY, '1');
          } catch {
            // Non-critical — worst case a later reload re-treats this batch as "first run".
          }
        }
      } catch {
        // Transient fetch failure — try again next tick.
      }
    }

    async function pollPayouts() {
      for (const communityId of totalEarnedByCommunity.current.keys()) {
        try {
          const { communityName, payouts } = await getMyPayouts(communityId, token!);
          if (cancelled) return;

          const completed = payouts.filter((p) => p.status === 'completed');
          const totalPaidOut = completed.reduce((sum, p) => sum + p.amountGp, 0);
          const balance = Math.max(0, (totalEarnedByCommunity.current.get(communityId) ?? 0) - totalPaidOut);

          // resolvedAt is when a completed payout actually completed; createdAt is a fallback in
          // case a completed ticket somehow lacks one. Sorted ascending for the same reason as
          // sessions above — monotonic watermark advancement plus chronological log order.
          const sortedPayouts = [...completed].sort(
            (a, b) => (a.resolvedAt ?? a.createdAt) - (b.resolvedAt ?? b.createdAt),
          );

          const watermarkKey = SEEN_PAYOUTS_KEY_PREFIX + communityId;
          const watermark = loadWatermark(watermarkKey);
          const isFirstRun = !initializedCommunityIds.current.has(communityId);
          let newestTs = watermark.ts;
          let newestIds = new Set(watermark.ids);
          let changed = false;

          for (const payout of sortedPayouts) {
            const ts = payout.resolvedAt ?? payout.createdAt;
            const alreadySeen = ts < watermark.ts || (ts === watermark.ts && watermark.ids.includes(payout.id));
            if (alreadySeen) continue;

            changed = true;
            if (ts > newestTs) {
              newestTs = ts;
              newestIds = new Set([payout.id]);
            } else {
              newestIds.add(payout.id);
            }
            if (isFirstRun) continue; // establish the baseline quietly, don't replay old history
            logTradeEvent(
              `Received a payout of ${formatGp(payout.amountGp)} gp in ${communityName} — balance now ${formatGp(balance)} gp`,
            );
          }

          if (isFirstRun) {
            initializedCommunityIds.current.add(communityId);
            logTradeEvent(`Your balance in ${communityName}: ${formatGp(balance)} gp`);
          }

          if (changed) saveWatermark(watermarkKey, { ts: newestTs, ids: [...newestIds] });
        } catch {
          // Transient fetch failure — try again next tick.
        }
      }
    }

    async function poll() {
      await pollSessions();
      await pollPayouts();
    }

    void poll();
    const id = setInterval(() => void poll(), intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [user, token, intervalMs]);
}
