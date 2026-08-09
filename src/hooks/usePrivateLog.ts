import { useEffect, useState } from 'react';
import type { ChatMessage } from '../types/chatbox';
import { useAuth } from '../context/AuthContext';
import { PRIVATE_KEY, loadStoredMessages, subscribeToStoredMessages } from '../utils/chatStorage';

/** Owns the Private tab's local action log (point 7.5). Entries are appended elsewhere via
 *  utils/systemLog.ts's logSystemEvent — this hook only reads/subscribes. Returns an empty array
 *  while logged out; callers should show the "log in to use this feature" prompt instead of an
 *  empty-log state in that case (see Chatbox.tsx). */
export function usePrivateLog() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>(() => (user ? loadStoredMessages(PRIVATE_KEY) : []));

  useEffect(() => {
    setMessages(user ? loadStoredMessages(PRIVATE_KEY) : []);
  }, [user]);

  useEffect(() => subscribeToStoredMessages((detail) => {
    if (detail.key === PRIVATE_KEY && user) setMessages(loadStoredMessages(PRIVATE_KEY));
  }), [user]);

  return { messages, loggedIn: !!user };
}
