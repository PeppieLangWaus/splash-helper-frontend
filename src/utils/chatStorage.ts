import type { ChatMessage } from '../types/chatbox';

/** Everything the chatbox persists lives under this prefix in `localStorage` — never the
 *  backend (see point 8 of the chatbox feature notes). Keeping it all under one prefix lets
 *  `applyMessageLimitToAllStores` find every feed without needing to know their exact keys. */
const KEY_PREFIX = 'chat:';
const LIMIT_KEY = `${KEY_PREFIX}limit`;
const DEFAULT_LIMIT = 100;

export const INFO_KEY = `${KEY_PREFIX}info`;
export const PUBLIC_KEY = `${KEY_PREFIX}public`;
export const PRIVATE_KEY = `${KEY_PREFIX}private`;
export const TRADE_KEY = `${KEY_PREFIX}trade`;

export function fcKey(communityId: string): string {
  return `${KEY_PREFIX}fc:${communityId}`;
}

export function ccKey(communityId: string): string {
  return `${KEY_PREFIX}cc:${communityId}`;
}

/** Per-feed message cap — "100 messages ... for each type and per fc/cc chat feed", editable
 *  from Account Settings while logged in (see views/AccountSettingsView.tsx); everyone else
 *  (including logged-out visitors) gets the default. */
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
    // Storage unavailable (private browsing, quota) — the limit just falls back to default.
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
    // Storage full/unavailable — the in-memory copy the caller already has still renders fine
    // for this session, it just won't survive a reload.
  }
}

/** Appends one message to a feed's stored history, trims it to the current limit, persists it,
 *  and returns the updated array (so callers can set it straight into state). */
export function appendStoredMessage(key: string, message: ChatMessage): ChatMessage[] {
  const limit = getMessageLimit();
  const next = [...loadStoredMessages(key), message];
  const trimmed = next.length > limit ? next.slice(next.length - limit) : next;
  saveMessages(key, trimmed);
  return trimmed;
}

/** Re-trims every already-stored feed to a newly-changed limit — called from Account Settings'
 *  save handler so lowering the limit takes effect immediately instead of waiting for each
 *  feed's next message. */
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
    // Storage unavailable — nothing to re-trim.
  }
}

// ── Same-tab pub/sub ──────────────────────────────────────────────────────────────────
//
// logSystemEvent/logTradeEvent (utils/systemLog.ts, utils/tradeLog.ts) can be called from
// anywhere in the app, not just from a mounted Chatbox — this lets whichever Chatbox is mounted
// pick up the new message immediately instead of only on its next unrelated re-render.

const CHAT_MESSAGE_EVENT = 'chat:message';

export interface ChatMessageEventDetail {
  key: string;
  message: ChatMessage;
}

export function publishStoredMessage(key: string, message: ChatMessage): void {
  window.dispatchEvent(new CustomEvent<ChatMessageEventDetail>(CHAT_MESSAGE_EVENT, { detail: { key, message } }));
}

export function subscribeToStoredMessages(handler: (detail: ChatMessageEventDetail) => void): () => void {
  function onEvent(e: Event) {
    handler((e as CustomEvent<ChatMessageEventDetail>).detail);
  }
  window.addEventListener(CHAT_MESSAGE_EVENT, onEvent);
  return () => window.removeEventListener(CHAT_MESSAGE_EVENT, onEvent);
}
