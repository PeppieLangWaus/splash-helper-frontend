import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChatItemRef, ChatMessage, LiveChatChannelType } from '../../../types/chatbox';
import { getRankIcon, parsePlayerName } from '../utils/chatIcons';
import { ccKey, fcKey, loadStoredMessages, subscribeToStoredMessages, upsertStoredMessage } from '../../../utils/chatStorage';

const WS_URL = `${import.meta.env.VITE_API_BASE_URL}`.replace(/^http/, 'ws');

const RECONNECT_DELAYS_MS = [2000, 4000, 8000, 16000, 30000];

const RECONNECT_JITTER = 0.2;

interface ChatBroadcastPayload {
  id: string;
  sender?: string;
  message: string;
  timestamp: number;

  rank?: number;

  items?: ChatItemRef[];

  showQuantities?: boolean;

  edited?: boolean;
}

interface ChatSubscribedMessage {
  type: 'CHAT_SUBSCRIBED';
  communityId: string;
  channelType: LiveChatChannelType;
  recent: ChatBroadcastPayload[];
}

type ChatMessageEvent = { type: 'CHAT_MESSAGE' } & ChatBroadcastPayload;

type ChatMessageEditedEvent = { type: 'CHAT_MESSAGE_EDITED' } & ChatBroadcastPayload;

function storageKey(communityId: string, channelType: LiveChatChannelType): string {
  return channelType === 'fc' ? fcKey(communityId) : ccKey(communityId);
}

function toChatMessage(raw: ChatBroadcastPayload, channelType: LiveChatChannelType): ChatMessage {
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

export function useChatFeed(communityId: string | null, channelType: LiveChatChannelType | null) {
  const feedKey = communityId && channelType ? storageKey(communityId, channelType) : null;
  const [messages, setMessages] = useState<ChatMessage[]>(() => (feedKey ? loadStoredMessages(feedKey) : []));

  const [trackedFeedKey, setTrackedFeedKey] = useState(feedKey);
  if (feedKey !== trackedFeedKey) {
    setTrackedFeedKey(feedKey);
    setMessages(feedKey ? loadStoredMessages(feedKey) : []);
  }
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const targetRef = useRef<{ communityId: string; channelType: LiveChatChannelType } | null>(null);

  useEffect(() => {
    targetRef.current = communityId && channelType ? { communityId, channelType } : null;
  }, [communityId, channelType]);

  const sendSubscribe = useCallback((ws: WebSocket) => {
    const target = targetRef.current;
    if (!target || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: 'SUBSCRIBE_CHAT', communityId: target.communityId, channelType: target.channelType }));
  }, []);

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

      const isCurrent = () => wsRef.current === ws;

      ws.onopen = () => {
        if (!isCurrent()) return;
        reconnectAttempts = 0;
        setConnected(true);

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

  useEffect(() => {
    const ws = wsRef.current;
    if (ws) sendSubscribe(ws);
  }, [communityId, channelType, sendSubscribe]);

  useEffect(() => subscribeToStoredMessages((detail) => {
    if (communityId && channelType && detail.key === storageKey(communityId, channelType)) {
      setMessages(loadStoredMessages(detail.key));
    }
  }), [communityId, channelType]);

  return { messages, connected };
}
