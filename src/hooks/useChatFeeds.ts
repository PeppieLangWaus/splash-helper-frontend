import { useMemo } from 'react';
import type { ChatChannelListing, ChatMessage, LiveChatChannelType } from '../types/chatbox';
import { useChatFeed } from './useChatFeed';

/** How many communities' live feeds one viewer subscribes to at once, per channel type. Only two
 *  real communities exist today (maybe a third later) — 5 gives comfortable headroom without
 *  letting an unbounded number of registrations open unbounded sockets from one tab. */
export const MAX_LINKED_CHATS = 5;

function labelFor(channel: ChatChannelListing, channelType: LiveChatChannelType): string | null {
  return channelType === 'fc' ? (channel.friendsChatDisplayName ?? channel.friendsChatName) : channel.clanChatName;
}

/**
 * Subscribes to every *linked* community's Friends/Clan Chat at once (up to MAX_LINKED_CHATS) —
 * "linked" meaning the community has set that name in its settings (see `useChatChannels`), not
 * anything the viewer picks. Tags each message with the community it came from (`communityId`)
 * plus its `[name]` prefix, so chatFilter.ts's Filtered state can narrow down to the viewer's own
 * selection within this set. See the chatbox-multi-link feature notes.
 *
 * Runs unconditionally regardless of the Channel/Clan tab's own On/Filtered/Off state or which
 * tab is selected — same pattern as every other local feed in Chatbox.tsx; only display
 * filtering (chatFilter.ts) is state-aware.
 *
 * React's rules of hooks forbid a dynamic number of hook calls, so this unrolls to a fixed
 * MAX_LINKED_CHATS slots and feeds unused ones `null` (a no-op for useChatFeed).
 */
export function useChatFeeds(channels: ChatChannelListing[], channelType: LiveChatChannelType) {
  const linked = useMemo(
    () => channels.filter((c) => labelFor(c, channelType) !== null).slice(0, MAX_LINKED_CHATS),
    [channels, channelType],
  );
  const ids = [0, 1, 2, 3, 4].map((i) => linked[i]?.communityId ?? null);

  // Fixed MAX_LINKED_CHATS slots, unrolled on purpose — always called, never conditionally, so
  // this stays within the rules of hooks even though which slots are "in use" changes over time.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fixed-length feedN.messages deps below
  }, [linked, channelType, feed0.messages, feed1.messages, feed2.messages, feed3.messages, feed4.messages]);

  const connected = useMemo(() => {
    const map: Record<string, boolean> = {};
    linked.forEach((channel, i) => {
      map[channel.communityId] = feeds[i].connected;
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fixed-length feedN.connected deps below
  }, [linked, feed0.connected, feed1.connected, feed2.connected, feed3.connected, feed4.connected]);

  return { messages, connected, linked };
}
