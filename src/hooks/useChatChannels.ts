import { useEffect, useState } from 'react';
import { getPublicChatChannels } from '../api';
import type { ChatChannelListing } from '../types/chatbox';

/** Fetches the public list of communities with a registered live chat feed (GET /chat-channels)
 *  once on mount, for the chatbox's community picker. Requires no login. */
export function useChatChannels() {
  const [channels, setChannels] = useState<ChatChannelListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getPublicChatChannels()
      .then((list) => {
        if (!cancelled) setChannels(list);
      })
      .catch(() => {
        // Leave the list empty — the picker just has nothing to offer yet.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { channels, loading };
}
