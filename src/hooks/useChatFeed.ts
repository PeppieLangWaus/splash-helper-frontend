import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChatMessage, LiveChatChannelType } from '../types/chatbox';
import { getRankIcon } from '../components/chatbox/chatIcons';
import { appendStoredMessage, ccKey, fcKey, loadStoredMessages, subscribeToStoredMessages } from '../utils/chatStorage';

// Same origin as the REST API, just ws(s):// instead of http(s):// — the backend's WebSocket
// server (see splash-helper-backend's websocket/server.ts) accepts connections on any path.
const WS_URL = `${import.meta.env.VITE_API_BASE_URL}`.replace(/^http/, 'ws');

const RECONNECT_DELAY_MS = 3000;

interface ChatBroadcastPayload {
  id: string;
  sender?: string;
  message: string;
  timestamp: number;
  /** Raw RuneLite rank attribute (FriendsChatRank / ClanRank numeric value) for the sender,
   *  interpreted per the channel it arrived on — see getRankIcon in chatbox/chatIcons.ts. */
  rank?: number;
}

interface ChatSubscribedMessage {
  type: 'CHAT_SUBSCRIBED';
  communityId: string;
  channelType: LiveChatChannelType;
  recent: ChatBroadcastPayload[];
}

type ChatMessageEvent = { type: 'CHAT_MESSAGE' } & ChatBroadcastPayload;

function storageKey(communityId: string, channelType: LiveChatChannelType): string {
  return channelType === 'fc' ? fcKey(communityId) : ccKey(communityId);
}

function toChatMessage(raw: ChatBroadcastPayload, channelType: LiveChatChannelType): ChatMessage {
  return {
    id: raw.id,
    timestamp: raw.timestamp,
    kind: channelType,
    username: raw.sender ?? 'Unknown',
    message: raw.message,
    rankIcon: raw.rank !== undefined ? getRankIcon(channelType, raw.rank) : undefined,
  };
}

/**
 * Owns one WebSocket connection to the backend's chat relay broadcast and keeps it subscribed
 * to whichever community + Friends/Clan Chat is currently selected — re-subscribing whenever
 * that selection changes, and reconnecting automatically if the socket drops. Requires no
 * login: this is the same read-only SUBSCRIBE_CHAT flow for any visitor (see the backend's
 * websocket/handlers.ts, which handles it before the AUTH gate).
 *
 * Pass null for communityId/channelType while nothing is selected yet — the socket still
 * connects (so it's ready the moment a selection is made) but never subscribes.
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

  // Persistent connection: opened once on mount, auto-reconnected if it drops.
  useEffect(() => {
    let cancelled = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

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
        setConnected(true);
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
          const local = loadStoredMessages(key);
          const knownIds = new Set(local.map((m) => m.id));
          const merged = [...local];
          for (const raw of msg.recent) {
            if (knownIds.has(raw.id)) continue;
            merged.push(toChatMessage(raw, msg.channelType));
          }
          merged.sort((a, b) => a.timestamp - b.timestamp);
          setMessages(merged);
        } else if (msgType === 'CHAT_MESSAGE') {
          // The event itself doesn't carry a channel type, only which channel we're currently
          // subscribed to does — fine since every message we get is for that subscription.
          const target = targetRef.current;
          if (!target) return;
          const msg = parsed as ChatMessageEvent;
          setMessages(appendStoredMessage(storageKey(target.communityId, target.channelType), toChatMessage(msg, target.channelType)));
        }
      };

      ws.onclose = () => {
        if (!isCurrent()) return;
        setConnected(false);
        wsRef.current = null;
        if (!cancelled) reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
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
  }, [sendSubscribe]);

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
