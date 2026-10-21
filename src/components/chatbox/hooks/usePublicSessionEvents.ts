import { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '../../../types/chatbox';
import { getActiveSessions } from '../../../api';
import { CHAT_GREEN, CHAT_ORANGE } from '../utils/chatColors';
import {
  PUBLIC_KEY,
  appendStoredMessage,
  loadStoredMessages,
  subscribeToStoredMessages,
} from '../../../utils/chatStorage';

const POLL_INTERVAL_MS = 15_000;

let seq = 0;

function buildMessage(username: string, world: number): ChatMessage {
  return {
    id: `public-${Date.now()}-${seq++}`,
    timestamp: Date.now(),
    kind: 'public',
    message: `[Worlds] ${username} has started splashing over at W${world}!`,
    icon: '/assets/icons/world.png',
    prefix: { text: 'Worlds' },
    segments: [
      { text: username, color: CHAT_ORANGE },
      { text: ' has started splashing over at ' },
      { text: `W${world}`, color: CHAT_GREEN },
      { text: '!' },
    ],
  };
}

export function usePublicSessionEvents(pollIntervalMs: number = POLL_INTERVAL_MS) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadStoredMessages(PUBLIC_KEY));
  const knownUsernames = useRef<Set<string> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const sessions = await getActiveSessions();
        if (cancelled) return;
        const current = new Set(sessions.map((s) => s.username));

        if (knownUsernames.current === null) {
          knownUsernames.current = current;
          return;
        }

        for (const session of sessions) {
          if (knownUsernames.current.has(session.username) || !session.sessionData) continue;
          setMessages(appendStoredMessage(PUBLIC_KEY, buildMessage(session.username, session.sessionData.world)));
        }
        knownUsernames.current = current;
      } catch {

      }
    }

    void poll();
    const id = setInterval(() => void poll(), pollIntervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [pollIntervalMs]);

  useEffect(() => subscribeToStoredMessages((detail) => {
    if (detail.key === PUBLIC_KEY) setMessages(loadStoredMessages(PUBLIC_KEY));
  }), []);

  return messages;
}
