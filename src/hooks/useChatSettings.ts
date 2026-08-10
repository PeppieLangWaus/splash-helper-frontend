import { useEffect, useState } from 'react';
import type { ChatSettings } from '../utils/chatSettings';
import { loadChatSettings, subscribeToChatSettings } from '../utils/chatSettings';

/** Reactive read of the chatbox's viewer settings (see utils/chatSettings.ts) — re-renders
 *  whenever `::settings` changes one, including from another mounted Chatbox in the same tab. */
export function useChatSettings(): ChatSettings {
  const [settings, setSettings] = useState<ChatSettings>(() => loadChatSettings());

  useEffect(() => subscribeToChatSettings(() => setSettings(loadChatSettings())), []);

  return settings;
}
