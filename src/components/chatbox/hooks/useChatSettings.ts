import { useEffect, useState } from 'react';
import type { ChatSettings } from '../utils/chatSettings';
import { loadChatSettings, subscribeToChatSettings } from '../utils/chatSettings';

export function useChatSettings(): ChatSettings {
  const [settings, setSettings] = useState<ChatSettings>(() => loadChatSettings());

  useEffect(() => subscribeToChatSettings(() => setSettings(loadChatSettings())), []);

  return settings;
}
