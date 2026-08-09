import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getArchivedSessions, getMyPayouts } from '../api';
import { logSystemEvent } from '../utils/systemLog';
import { logTradeEvent } from '../utils/tradeLog';

const POLL_INTERVAL_MS = 20_000;
const SEEN_SESSIONS_KEY = 'chat:seen-sessions';
const SEEN_SESSIONS_INIT_KEY = `${SEEN_SESSIONS_KEY}:init`;
const SEEN_PAYOUTS_KEY_PREFIX = 'chat:seen-payouts:';
const MAX_TRACKED_IDS = 500;

function loadSeenSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveSeenSet(key: string, set: Set<string>): void {
  try {
    localStorage.setItem(key, JSON.stringify([...set].slice(-MAX_TRACKED_IDS)));
  } catch {
    // Storage unavailable — the ids just won't survive a reload.
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
 * usePublicSessionEvents does: diffing against an id set persisted in localStorage so a reload
 * doesn't replay a user's entire history as "new". The very first poll (no id set stored yet)
 * only seeds that baseline — it never emits for pre-existing history.
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

        const seen = loadSeenSet(SEEN_SESSIONS_KEY);
        const isFirstRun = !localStorage.getItem(SEEN_SESSIONS_INIT_KEY);
        let changed = false;

        const earnedTotals = new Map<string, number>();
        for (const session of data.sessions) {
          const hours = (session.finalizedTimestamp - session.createdTimestamp) / 3_600_000;
          for (const [communityId, earnings] of Object.entries(session.earningsSnapshot ?? {})) {
            earnedTotals.set(communityId, (earnedTotals.get(communityId) ?? 0) + hours * earnings.hourlyRate);
          }

          if (seen.has(session._id)) continue;
          seen.add(session._id);
          changed = true;
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
          saveSeenSet(SEEN_SESSIONS_KEY, seen);
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

          const totalPaidOut = payouts
            .filter((p) => p.status === 'completed')
            .reduce((sum, p) => sum + p.amountGp, 0);
          const balance = Math.max(0, (totalEarnedByCommunity.current.get(communityId) ?? 0) - totalPaidOut);

          const seenKey = SEEN_PAYOUTS_KEY_PREFIX + communityId;
          const seen = loadSeenSet(seenKey);
          const isFirstRun = !initializedCommunityIds.current.has(communityId);
          let changed = false;

          for (const payout of payouts) {
            if (payout.status !== 'completed' || seen.has(payout.id)) continue;
            seen.add(payout.id);
            changed = true;
            if (isFirstRun) continue; // establish the baseline quietly, don't replay old history
            logTradeEvent(
              `Received a payout of ${formatGp(payout.amountGp)} gp in ${communityName} — balance now ${formatGp(balance)} gp`,
            );
          }

          if (isFirstRun) {
            initializedCommunityIds.current.add(communityId);
            logTradeEvent(`Your balance in ${communityName}: ${formatGp(balance)} gp`);
          }

          if (changed) saveSeenSet(seenKey, seen);
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
