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
/** Command-console replies (see utils/chatCommands.ts) — a separate feed from INFO_KEY's
 *  periodic tips so `::clear info` and `::clear system` can target either independently, even
 *  though both surface on the Game tab (see chatFilter.ts's KIND_TO_TAB). */
export const SYSTEM_KEY = `${KEY_PREFIX}system`;

const FC_PREFIX = `${KEY_PREFIX}fc:`;
const CC_PREFIX = `${KEY_PREFIX}cc:`;

export function fcKey(communityId: string): string {
  return `${FC_PREFIX}${communityId}`;
}

export function ccKey(communityId: string): string {
  return `${CC_PREFIX}${communityId}`;
}

/** A viewer's locally-persisted Filtered-list selection (which linked communities' fc/cc chats
 *  they've picked to narrow down to) — see the chatbox-multi-link feature notes for the
 *  linked-vs-selected distinction. Community IDs only; never sent to the backend. */
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
    // Storage unavailable — the selection just won't survive a reload.
  }
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

/** Adds or updates one message in a feed's stored history — the single entry point for every
 *  incoming fc/cc broadcast, live (`CHAT_MESSAGE`) or replayed (`CHAT_SUBSCRIBED`'s `recent`
 *  buffer), edited or not. Matched against an already-stored message by id alone (unique within
 *  one feed's own key, so kind/timestamp add nothing — and dropping timestamp from the match
 *  means an edit is still recognized as "the same line" even if the relay bumps its timestamp
 *  when re-sending it):
 *
 *  - No match → genuinely new message, appended normally.
 *  - Match, incoming copy flagged `edited` → replaces the stored copy's text in place (same
 *    position, every other field untouched) and marks it edited.
 *  - Match, incoming copy NOT flagged `edited` → a plain resend of a line we already have (e.g.
 *    the relay's `recent` buffer replaying it verbatim on reconnect). Left completely alone —
 *    critically, this never *un*-marks an already-edited message back to its original text, which
 *    is what previously made an unrelated new message arriving (any resend sharing an id with an
 *    edited line) appear to "reset" every edited message until the next reload re-read storage
 *    from scratch and got it right again.
 *
 *  Trims to the current limit and persists, like appendStoredMessage. */
export function upsertStoredMessage(key: string, message: ChatMessage): ChatMessage[] {
  const existing = loadStoredMessages(key);
  const matchIndex = existing.findIndex((m) => m.id === message.id);

  if (matchIndex !== -1 && !message.edited) return existing; // known line, not an edit — no-op.

  const next = [...existing];
  if (matchIndex !== -1) {
    // `items` isn't in the edited resend's own field list above by default — it's resolved
    // once, on the original message, and left alone by a later edit for an unrelated reason (see
    // splash-helper-backend's chatBroadcast.ts) — but falls back to whatever the resend itself
    // carries, in case that ever changes.
    next[matchIndex] = {
      ...next[matchIndex],
      message: message.message,
      segments: message.segments,
      items: message.items ?? next[matchIndex].items,
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

/** Wipes one feed's stored history (used by the `::clear` chat command — see
 *  utils/chatCommands.ts) and notifies anything currently watching that key. */
export function clearStoredMessages(key: string): void {
  saveMessages(key, []);
  publishStoredMessagesChanged(key);
}

/** Wipes every stored feed whose key starts with `prefix` — used for `::clear channel`/`::clear
 *  clan`, which need to reach every linked community's per-community fc/cc key (fcKey/ccKey
 *  above), not just one fixed key. */
export function clearStoredMessagesByPrefix(prefix: string): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) keys.push(k);
    }
    keys.forEach(clearStoredMessages);
  } catch {
    // Storage unavailable — nothing to clear.
  }
}

export const FC_KEY_PREFIX = FC_PREFIX;
export const CC_KEY_PREFIX = CC_PREFIX;

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
  /** Unset for a plain "reload this key from storage" notification (see
   *  publishStoredMessagesChanged) — every subscriber below only re-reads storage keyed off
   *  `key` and never actually looks at this field, so it's fine for it to be absent. */
  message?: ChatMessage;
}

export function publishStoredMessage(key: string, message: ChatMessage): void {
  window.dispatchEvent(new CustomEvent<ChatMessageEventDetail>(CHAT_MESSAGE_EVENT, { detail: { key, message } }));
}

/** Tells anything watching `key` to re-read it from storage, without a specific new message to
 *  carry — used after clearStoredMessages/clearStoredMessagesByPrefix. */
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
