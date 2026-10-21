const SETTINGS_KEY = 'chat:settings';

export interface ChatSettings {

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

  }
}

export function setTimestampsEnabled(enabled: boolean): void {
  const settings = loadChatSettings();
  if (settings.timestamps === enabled) return;
  saveChatSettings({ ...settings, timestamps: enabled });
  publishChatSettingsChange();
}

const CHAT_SETTINGS_EVENT = 'chat:settings-changed';

function publishChatSettingsChange(): void {
  window.dispatchEvent(new Event(CHAT_SETTINGS_EVENT));
}

export function subscribeToChatSettings(handler: () => void): () => void {
  window.addEventListener(CHAT_SETTINGS_EVENT, handler);
  return () => window.removeEventListener(CHAT_SETTINGS_EVENT, handler);
}
