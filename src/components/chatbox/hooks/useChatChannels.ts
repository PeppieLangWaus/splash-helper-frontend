import { useEffect, useState } from 'react';
import { getPublicChatChannels } from '../../../api';
import type { ChatChannelListing } from '../../../types/chatbox';

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
