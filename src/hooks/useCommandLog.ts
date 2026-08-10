import { useEffect, useState } from 'react';
import type { ChatMessage } from '../types/chatbox';
import { SYSTEM_KEY, loadStoredMessages, subscribeToStoredMessages } from '../utils/chatStorage';

/** Owns the Game tab's `::command` replies (see chatbox/chatCommands.ts) — loads whatever's
 *  already stored, then picks up new ones the moment runChatCommand appends them. No login
 *  required; unlike Private/Trade this works for every visitor. */
export function useCommandLog() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadStoredMessages(SYSTEM_KEY));

  useEffect(() => subscribeToStoredMessages((detail) => {
    if (detail.key === SYSTEM_KEY) setMessages(loadStoredMessages(SYSTEM_KEY));
  }), []);

  return messages;
}
