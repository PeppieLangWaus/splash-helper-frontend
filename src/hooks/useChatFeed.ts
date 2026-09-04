import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChatItemRef, ChatMessage, LiveChatChannelType } from '../types/chatbox';
import { getRankIcon, parsePlayerName } from '../components/chatbox/chatIcons';
import { ccKey, fcKey, loadStoredMessages, subscribeToStoredMessages, upsertStoredMessage } from '../utils/chatStorage';

// Same origin as the REST API, just ws(s):// instead of http(s):// — the backend's WebSocket
// server (see splash-helper-backend's websocket/server.ts) accepts connections on any path.
const WS_URL = `${import.meta.env.VITE_API_BASE_URL}`.replace(/^http/, 'ws');

// Exponential backoff (mirrors the RuneLite plugin's SplashWebSocketClient), capped and jittered
// so a socket that keeps closing right away — e.g. a reverse-proxy idle timeout silently killing
// an otherwise-fine connection — doesn't hammer the server with a fresh "WS connection" every 3s
// forever. Reset to the first delay on every successful open (see `onopen` below).
const RECONNECT_DELAYS_MS = [2000, 4000, 8000, 16000, 30000];
/** +/- this fraction of jitter, so many tabs reconnecting at once don't all land in lockstep. */
const RECONNECT_JITTER = 0.2;

interface ChatBroadcastPayload {
  id: string;
  sender?: string;
  message: string;
  timestamp: number;
  /** Raw RuneLite rank attribute (FriendsChatRank / ClanRank numeric value) for the sender,
   *  interpreted per the channel it arrived on — see getRankIcon in chatbox/chatIcons.ts. */
  rank?: number;
  /** Real items resolved server-side for a `!log <page>`/`!pets` line — see
   *  types/chatbox.ts's ChatItemRef. */
  items?: ChatItemRef[];
  /** Whether `items`' quantities are meaningful to show — see types/chatbox.ts's ChatMessage. */
  showQuantities?: boolean;
  /** Set when this broadcast is a re-send of a message we already relayed, with edited text —
   *  see toChatMessage/upsertStoredMessage. Absent (not just false) on the vast majority of
   *  messages, which are never edited. */
  edited?: boolean;
}

interface ChatSubscribedMessage {
  type: 'CHAT_SUBSCRIBED';
  communityId: string;
  channelType: LiveChatChannelType;
  recent: ChatBroadcastPayload[];
}

type ChatMessageEvent = { type: 'CHAT_MESSAGE' } & ChatBroadcastPayload;
// Sent instead of a second CHAT_MESSAGE when the relay correlates an edited resend with a
// message it already broadcast — same shape as CHAT_MESSAGE (including `edited: true`), just a
// distinct `type` so a viewer that only cares about new lines can ignore it. See the backend's
// websocket/chatBroadcast.ts.
type ChatMessageEditedEvent = { type: 'CHAT_MESSAGE_EDITED' } & ChatBroadcastPayload;

function storageKey(communityId: string, channelType: LiveChatChannelType): string {
  return channelType === 'fc' ? fcKey(communityId) : ccKey(communityId);
}

function toChatMessage(raw: ChatBroadcastPayload, channelType: LiveChatChannelType): ChatMessage {
  // The game embeds the sender's mod/ironman status as leading `<img=N>` tag(s) right in the
  // name itself (e.g. `<img=2>SomeUsername`) — see parsePlayerName's doc comment for what the
  // indices mean.
  const { username, modStatus, ironmanStatus } = parsePlayerName(raw.sender ?? 'Unknown');
  return {
    id: raw.id,
    timestamp: raw.timestamp,
    kind: channelType,
    username,
    modStatus,
    ironmanStatus,
    message: raw.message,
    rankIcon: raw.rank !== undefined ? getRankIcon(channelType, raw.rank) : undefined,
    items: raw.items,
    showQuantities: raw.showQuantities,
    edited: raw.edited || undefined,
  };
}

/**
 * Owns one WebSocket connection to the backend's chat relay broadcast and keeps it subscribed
 * to whichever community + Friends/Clan Chat is currently selected — re-subscribing whenever
 * that selection changes, and reconnecting automatically if the socket drops. Requires no
 * login: this is the same read-only SUBSCRIBE_CHAT flow for any visitor (see the backend's
 * websocket/handlers.ts, which handles it before the AUTH gate).
 *
 * Pass null for communityId/channelType while there's nothing to watch yet — no socket is opened
 * at all until a real target is set (see useChatFeeds, whose fixed-but-mostly-unlinked slots are
 * the main reason this matters: a viewer with only 2 linked communities shouldn't hold open 5
 * idle sockets per channel type just because the slot array is sized for headroom). Once a target
 * is set, the connection opens and is kept alive/reconnected for the life of the component same
 * as before, including across a later target change — only a null target actually closes it.
 *
 * Messages are persisted to localStorage per (communityId, channelType) — see utils/chatStorage
 * — so history survives a reload. On (re)subscribe, whatever the relay has buffered server-side
 * (ephemeral, resets on restart) is merged in behind local history rather than replacing it.
 */
export function useChatFeed(communityId: string | null, channelType: LiveChatChannelType | null) {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    communityId && channelType ? loadStoredMessages(storageKey(communityId, channelType)) : [],
  );
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const targetRef = useRef<{ communityId: string; channelType: LiveChatChannelType } | null>(null);

  // Keep the latest selection in a ref (not just React state) so the socket's onopen handler —
  // which can fire long after this render — always subscribes to whatever's current.
  useEffect(() => {
    targetRef.current = communityId && channelType ? { communityId, channelType } : null;
  }, [communityId, channelType]);

  const sendSubscribe = useCallback((ws: WebSocket) => {
    const target = targetRef.current;
    if (!target || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: 'SUBSCRIBE_CHAT', communityId: target.communityId, channelType: target.channelType }));
  }, []);

  // Persistent connection: opened once a real target is set (not on mount if there isn't one
  // yet), auto-reconnected if it drops. Re-runs — closing any existing connection and opening a
  // fresh one — only when hasTarget itself flips, not on every communityId/channelType change;
  // swapping between two real targets is handled by the re-subscribe effect below without a
  // reconnect, same as before this hasTarget gating was added.
  const hasTarget = Boolean(communityId && channelType);
  useEffect(() => {
    if (!hasTarget) return;

    let cancelled = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let reconnectAttempts = 0;

    function connect() {
      if (cancelled) return;
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      // React 18 StrictMode (dev only) intentionally mounts this effect, cleans it up, then
      // mounts it again — so an earlier `connect()`'s socket can still be mid-handshake when a
      // later one has already replaced it as wsRef.current. Every handler below must check it's
      // still *the* current socket before touching shared state, or a stale socket's
      // late-arriving close/message event silently clobbers the live one (this really did
      // happen: `wsRef.current = null` here from a stale socket's close, with no such check,
      // was ending up as null'd out from under an already-open, still-live connection).
      const isCurrent = () => wsRef.current === ws;

      ws.onopen = () => {
        if (!isCurrent()) return;
        reconnectAttempts = 0;
        setConnected(true);
        // Always send something immediately, even with nothing selected yet (sendSubscribe
        // no-ops in that case) — the backend closes any connection that stays silent for a
        // few seconds, since that's indistinguishable from a scanner just holding the socket
        // open. See splash-helper-backend's websocket/server.ts.
        ws.send(JSON.stringify({ type: 'HELLO' }));
        sendSubscribe(ws);
      };

      ws.onmessage = (event) => {
        if (!isCurrent()) return;
        let parsed: unknown;
        try {
          parsed = JSON.parse(event.data as string);
        } catch {
          return;
        }
        if (!parsed || typeof parsed !== 'object' || !('type' in parsed)) return;
        const msgType = (parsed as { type: unknown }).type;

        if (msgType === 'CHAT_SUBSCRIBED') {
          const msg = parsed as ChatSubscribedMessage;
          const key = storageKey(msg.communityId, msg.channelType);
          let latest = loadStoredMessages(key);
          for (const raw of msg.recent) {
            latest = upsertStoredMessage(key, toChatMessage(raw, msg.channelType));
          }
          setMessages([...latest].sort((a, b) => a.timestamp - b.timestamp));
        } else if (msgType === 'CHAT_MESSAGE' || msgType === 'CHAT_MESSAGE_EDITED') {
          // Neither event carries a channel type, only which channel we're currently subscribed
          // to does — fine since every message we get is for that subscription. Both go through
          // the same upsert: a CHAT_MESSAGE_EDITED carries the same `id` as (and `edited: true`
          // over) the CHAT_MESSAGE it's correlated with, so upsertStoredMessage updates that line
          // in place instead of appending a duplicate.
          const target = targetRef.current;
          if (!target) return;
          const msg = parsed as ChatMessageEvent | ChatMessageEditedEvent;
          const key = storageKey(target.communityId, target.channelType);
          setMessages(upsertStoredMessage(key, toChatMessage(msg, target.channelType)));
        }
      };

      ws.onclose = () => {
        if (!isCurrent()) return;
        setConnected(false);
        wsRef.current = null;
        if (!cancelled) {
          const base = RECONNECT_DELAYS_MS[Math.min(reconnectAttempts, RECONNECT_DELAYS_MS.length - 1)];
          reconnectAttempts++;
          const jitter = base * RECONNECT_JITTER * (Math.random() * 2 - 1);
          reconnectTimer = setTimeout(connect, base + jitter);
        }
      };

      ws.onerror = () => ws.close();
    }

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [hasTarget, sendSubscribe]);

  // Re-subscribe (and load that channel's stored history) whenever the selected community/
  // channel changes. No-ops quietly if the socket isn't open yet; onopen above will pick up the
  // now-current targetRef once it connects.
  useEffect(() => {
    setMessages(communityId && channelType ? loadStoredMessages(storageKey(communityId, channelType)) : []);
    const ws = wsRef.current;
    if (ws) sendSubscribe(ws);
  }, [communityId, channelType, sendSubscribe]);

  // Picks up out-of-band changes to this channel's stored history — currently only the `::clear`
  // chat command (see utils/chatCommands.ts), which wipes localStorage directly rather than going
  // through appendStoredMessage/setMessages above.
  useEffect(() => subscribeToStoredMessages((detail) => {
    if (communityId && channelType && detail.key === storageKey(communityId, channelType)) {
      setMessages(loadStoredMessages(detail.key));
    }
  }), [communityId, channelType]);

  return { messages, connected };
}
