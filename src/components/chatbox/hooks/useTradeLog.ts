import { useEffect, useState } from 'react';
import type { ChatMessage } from '../../../types/chatbox';
import { useAuth } from '../../../context/AuthContext';
import { TRADE_KEY, loadStoredMessages, subscribeToStoredMessages } from '../../../utils/chatStorage';

export function useTradeLog() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>(() => (user ? loadStoredMessages(TRADE_KEY) : []));

  const [trackedUser, setTrackedUser] = useState(user);
  if (user !== trackedUser) {
    setTrackedUser(user);
    setMessages(user ? loadStoredMessages(TRADE_KEY) : []);
  }

  useEffect(() => subscribeToStoredMessages((detail) => {
    if (detail.key === TRADE_KEY && user) setMessages(loadStoredMessages(TRADE_KEY));
  }), [user]);

  return { messages, loggedIn: !!user };
}
