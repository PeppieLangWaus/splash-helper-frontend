/** Chatbox-wide settings the `::settings` chat command reads/writes (see utils/chatCommands.ts).
 *  Kept as its own small store, separate from chatStorage.ts's message feeds and per-feed
 *  message-limit setting — this is viewer preference, not chat history. */

const SETTINGS_KEY = 'chat:settings';

export interface ChatSettings {
  /** Whether ChatLog renders each line's leading `[HH:MM]` timestamp — toggled via
   *  `::settings timestamp on|off` (default on, matching the chatbox's original behavior). */
  timestamps: boolean;
}

const DEFAULT_SETTINGS: ChatSettings = { timestamps: true };

export function loadChatSettings(): ChatSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<ChatSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveChatSettings(settings: ChatSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Storage unavailable — the setting just won't survive a reload.
  }
}

export function setTimestampsEnabled(enabled: boolean): void {
  const settings = loadChatSettings();
  if (settings.timestamps === enabled) return;
  saveChatSettings({ ...settings, timestamps: enabled });
  publishChatSettingsChange();
}

// ── Same-tab pub/sub, mirroring chatStorage.ts's message event — lets useChatSettings pick up a
// change made via ::settings immediately, without waiting on an unrelated re-render. ──────────

const CHAT_SETTINGS_EVENT = 'chat:settings-changed';

function publishChatSettingsChange(): void {
  window.dispatchEvent(new Event(CHAT_SETTINGS_EVENT));
}

export function subscribeToChatSettings(handler: () => void): () => void {
  window.addEventListener(CHAT_SETTINGS_EVENT, handler);
  return () => window.removeEventListener(CHAT_SETTINGS_EVENT, handler);
}
