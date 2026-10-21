import { useEffect, useState } from 'react';
import type { ChatMessage } from '../../../types/chatbox';
import { SYSTEM_KEY, loadStoredMessages, subscribeToStoredMessages } from '../../../utils/chatStorage';

export function useCommandLog() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadStoredMessages(SYSTEM_KEY));

  useEffect(() => subscribeToStoredMessages((detail) => {
    if (detail.key === SYSTEM_KEY) setMessages(loadStoredMessages(SYSTEM_KEY));
  }), []);

  return messages;
}
