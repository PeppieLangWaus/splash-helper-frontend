import type { ChatMessage } from '../types/chatbox';

const KEY_PREFIX = 'chat:';
const LIMIT_KEY = `${KEY_PREFIX}limit`;
const DEFAULT_LIMIT = 100;

export const INFO_KEY = `${KEY_PREFIX}info`;
export const PUBLIC_KEY = `${KEY_PREFIX}public`;
export const PRIVATE_KEY = `${KEY_PREFIX}private`;
export const TRADE_KEY = `${KEY_PREFIX}trade`;

export const SYSTEM_KEY = `${KEY_PREFIX}system`;

const FC_PREFIX = `${KEY_PREFIX}fc:`;
const CC_PREFIX = `${KEY_PREFIX}cc:`;

export function fcKey(communityId: string): string {
  return `${FC_PREFIX}${communityId}`;
}

export function ccKey(communityId: string): string {
  return `${CC_PREFIX}${communityId}`;
}

export const FC_SELECTED_KEY = `${KEY_PREFIX}selected:fc`;
export const CC_SELECTED_KEY = `${KEY_PREFIX}selected:cc`;

export function loadSelectedIds(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? new Set(parsed.filter((v): v is string => typeof v === 'string')) : new Set();
  } catch {
    return new Set();
  }
}

export function saveSelectedIds(key: string, ids: Set<string>): void {
  try {
    localStorage.setItem(key, JSON.stringify([...ids]));
  } catch {

  }
}

export function getMessageLimit(): number {
  try {
    const raw = localStorage.getItem(LIMIT_KEY);
    const parsed = raw !== null ? Number(raw) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : DEFAULT_LIMIT;
  } catch {
    return DEFAULT_LIMIT;
  }
}

export function setMessageLimit(limit: number): void {
  try {
    localStorage.setItem(LIMIT_KEY, String(Math.max(1, Math.floor(limit))));
  } catch {

  }
}

export function loadStoredMessages(key: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

function saveMessages(key: string, messages: ChatMessage[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(messages));
  } catch {

  }
}

export function appendStoredMessage(key: string, message: ChatMessage): ChatMessage[] {
  const limit = getMessageLimit();
  const next = [...loadStoredMessages(key), message];
  const trimmed = next.length > limit ? next.slice(next.length - limit) : next;
  saveMessages(key, trimmed);
  return trimmed;
}

export function upsertStoredMessage(key: string, message: ChatMessage): ChatMessage[] {
  const existing = loadStoredMessages(key);
  const matchIndex = existing.findIndex((m) => m.id === message.id);

  if (matchIndex !== -1 && !message.edited) return existing;

  const next = [...existing];
  if (matchIndex !== -1) {
    next[matchIndex] = {
      ...next[matchIndex],
      message: message.message,
      segments: message.segments,
      items: message.items ?? next[matchIndex].items,
      showQuantities: message.showQuantities ?? next[matchIndex].showQuantities,
      edited: true,
    };
  } else {
    next.push(message);
  }

  const limit = getMessageLimit();
  const trimmed = next.length > limit ? next.slice(next.length - limit) : next;
  saveMessages(key, trimmed);
  return trimmed;
}

export function clearStoredMessages(key: string): void {
  saveMessages(key, []);
  publishStoredMessagesChanged(key);
}

export function clearStoredMessagesByPrefix(prefix: string): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) keys.push(k);
    }
    keys.forEach(clearStoredMessages);
  } catch {

  }
}

export const FC_KEY_PREFIX = FC_PREFIX;
export const CC_KEY_PREFIX = CC_PREFIX;

export function applyMessageLimitToAllStores(limit: number): void {
  setMessageLimit(limit);
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(KEY_PREFIX) || key === LIMIT_KEY) continue;
      const messages = loadStoredMessages(key);
      if (messages.length > limit) saveMessages(key, messages.slice(messages.length - limit));
    }
  } catch {

  }
}

const CHAT_MESSAGE_EVENT = 'chat:message';

export interface ChatMessageEventDetail {
  key: string;

  message?: ChatMessage;
}

export function publishStoredMessage(key: string, message: ChatMessage): void {
  window.dispatchEvent(new CustomEvent<ChatMessageEventDetail>(CHAT_MESSAGE_EVENT, { detail: { key, message } }));
}

export function publishStoredMessagesChanged(key: string): void {
  window.dispatchEvent(new CustomEvent<ChatMessageEventDetail>(CHAT_MESSAGE_EVENT, { detail: { key } }));
}

export function subscribeToStoredMessages(handler: (detail: ChatMessageEventDetail) => void): () => void {
  function onEvent(e: Event) {
    handler((e as CustomEvent<ChatMessageEventDetail>).detail);
  }
  window.addEventListener(CHAT_MESSAGE_EVENT, onEvent);
  return () => window.removeEventListener(CHAT_MESSAGE_EVENT, onEvent);
}
