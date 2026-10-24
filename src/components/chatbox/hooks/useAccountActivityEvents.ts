import { useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getArchivedSessions, getMyPayouts } from '../../../api';
import { logSystemEvent } from '../../../utils/systemLog';
import { logTradeEvent } from '../../../utils/tradeLog';

const POLL_INTERVAL_MS = 20_000;

const SEEN_SESSIONS_KEY = 'chat:seen-sessions-v2';
const SEEN_SESSIONS_INIT_KEY = `${SEEN_SESSIONS_KEY}:init`;
const SEEN_PAYOUTS_KEY_PREFIX = 'chat:seen-payouts-v2:';

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

  }
}

function formatGp(n: number): string {
  return Math.round(n).toLocaleString();
}

export function useAccountActivityEvents(intervalMs: number = POLL_INTERVAL_MS) {
  const { user, token } = useAuth();

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
          if (isFirstRun) continue;

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

          }
        }
      } catch {

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
            if (isFirstRun) continue;
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
