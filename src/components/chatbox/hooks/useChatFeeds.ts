import { useMemo } from 'react';
import type { ChatChannelListing, ChatMessage, LiveChatChannelType } from '../../../types/chatbox';
import { useChatFeed } from './useChatFeed';

export const MAX_LINKED_CHATS = 5;

function labelFor(channel: ChatChannelListing, channelType: LiveChatChannelType): string | null {
  return channelType === 'fc' ? (channel.friendsChatDisplayName ?? channel.friendsChatName) : channel.clanChatName;
}

export function useChatFeeds(channels: ChatChannelListing[], channelType: LiveChatChannelType) {
  const linked = useMemo(
    () => channels.filter((c) => labelFor(c, channelType) !== null).slice(0, MAX_LINKED_CHATS),
    [channels, channelType],
  );
  const ids = [0, 1, 2, 3, 4].map((i) => linked[i]?.communityId ?? null);

  const feed0 = useChatFeed(ids[0], ids[0] ? channelType : null);
  const feed1 = useChatFeed(ids[1], ids[1] ? channelType : null);
  const feed2 = useChatFeed(ids[2], ids[2] ? channelType : null);
  const feed3 = useChatFeed(ids[3], ids[3] ? channelType : null);
  const feed4 = useChatFeed(ids[4], ids[4] ? channelType : null);
  const feeds = [feed0, feed1, feed2, feed3, feed4];

  const messages = useMemo(() => {
    const tagged: ChatMessage[] = [];
    linked.forEach((channel, i) => {
      const label = labelFor(channel, channelType);
      for (const m of feeds[i].messages) {
        tagged.push({
          ...m,
          communityId: channel.communityId,
          prefix: label ? { text: label } : m.prefix,
        });
      }
    });
    return tagged;
  }, [linked, channelType, feed0.messages, feed1.messages, feed2.messages, feed3.messages, feed4.messages]);

  const connected = useMemo(() => {
    const map: Record<string, boolean> = {};
    linked.forEach((channel, i) => {
      map[channel.communityId] = feeds[i].connected;
    });
    return map;
  }, [linked, feed0.connected, feed1.connected, feed2.connected, feed3.connected, feed4.connected]);

  return { messages, connected, linked };
}
