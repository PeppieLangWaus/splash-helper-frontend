import { useEffect, useState } from 'react';
import type { ChatMessage } from '../../../types/chatbox';
import { useAuth } from '../../../context/AuthContext';
import { PRIVATE_KEY, loadStoredMessages, subscribeToStoredMessages } from '../../../utils/chatStorage';

export function usePrivateLog() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>(() => (user ? loadStoredMessages(PRIVATE_KEY) : []));

  const [trackedUser, setTrackedUser] = useState(user);
  if (user !== trackedUser) {
    setTrackedUser(user);
    setMessages(user ? loadStoredMessages(PRIVATE_KEY) : []);
  }

  useEffect(() => subscribeToStoredMessages((detail) => {
    if (detail.key === PRIVATE_KEY && user) setMessages(loadStoredMessages(PRIVATE_KEY));
  }), [user]);

  return { messages, loggedIn: !!user };
}
