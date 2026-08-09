import { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '../types/chatbox';
import { CHAT_BLUE } from '../components/chatbox/chatColors';
import chatInfoMessages from '../data/chatInfoMessages';
import {
  INFO_KEY,
  appendStoredMessage,
  loadStoredMessages,
  subscribeToStoredMessages,
} from '../utils/chatStorage';

/** How often the Game tab gets a new info tip — "by default every 10 minutes" (point 1). */
export const INFO_MESSAGE_INTERVAL_MS = 10 * 60 * 1000;

let seq = 0;

function pickNext(excluding: string | null): string {
  if (chatInfoMessages.length <= 1) return chatInfoMessages[0] ?? '';
  let pick: string;
  do {
    pick = chatInfoMessages[Math.floor(Math.random() * chatInfoMessages.length)];
  } while (pick === excluding);
  return pick;
}

function buildMessage(text: string): ChatMessage {
  return {
    id: `info-${Date.now()}-${seq++}`,
    timestamp: Date.now(),
    kind: 'info',
    message: text,
    icon: '/assets/chatbox/icons/info/msg.png',
    prefix: { text: '[info]', color: CHAT_BLUE },
    // "use blue letters" (point 1) — the whole line is blue, not just the [info] tag.
    segments: [{ text, color: CHAT_BLUE }],
  };
}

/** Owns the Game tab's periodic info tips: loads whatever's already stored, then appends a new
 *  random one (never repeating the last one shown) every INFO_MESSAGE_INTERVAL_MS. */
export function useInfoMessages(intervalMs: number = INFO_MESSAGE_INTERVAL_MS) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadStoredMessages(INFO_KEY));
  const lastTextRef = useRef<string | null>(messages.length ? messages[messages.length - 1].message : null);

  useEffect(() => {
    const id = setInterval(() => {
      const text = pickNext(lastTextRef.current);
      lastTextRef.current = text;
      setMessages(appendStoredMessage(INFO_KEY, buildMessage(text)));
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  useEffect(() => subscribeToStoredMessages((detail) => {
    if (detail.key === INFO_KEY) setMessages(loadStoredMessages(INFO_KEY));
  }), []);

  return messages;
}
