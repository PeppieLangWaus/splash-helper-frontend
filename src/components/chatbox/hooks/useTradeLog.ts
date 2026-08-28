import { useEffect, useState } from 'react';
import type { ChatMessage } from '../../../types/chatbox';
import { useAuth } from '../../../context/AuthContext';
import { TRADE_KEY, loadStoredMessages, subscribeToStoredMessages } from '../../../utils/chatStorage';

/** Owns the Trade tab's local income/payout/balance log (point 7.7). Entries are appended
 *  elsewhere via utils/tradeLog.ts's logTradeEvent — this hook only reads/subscribes. Returns an
 *  empty array while logged out; callers should show the "log in to use this feature" prompt
 *  instead of an empty-log state in that case (see Chatbox.tsx). */
export function useTradeLog() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>(() => (user ? loadStoredMessages(TRADE_KEY) : []));

  // Reload when `user` actually changes (login/logout) — a plain "adjust state when a prop
  // changes" case, so it's handled directly during render (comparing against the last-seen user)
  // rather than in an effect; `user`'s identity is stable across re-renders that don't change it
  // (see AuthContext), so this only fires on a real change, not every render.
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
