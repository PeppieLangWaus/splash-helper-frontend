import type { ChatChannel, ChatMessage, ChatMessageKind, ChatTabStates, TabState } from '../../types/chatbox';

/** Which bottom-bar tab each message kind belongs to. */
export const KIND_TO_TAB: Record<ChatMessageKind, ChatChannel> = {
  fc: 'channel',
  cc: 'clan',
  info: 'game',
  system: 'game',
  public: 'public',
  private: 'private',
  trade: 'trade',
};

/** Display label for a tab's status line — shared between ChatControls' own status button and
 *  the `::toggle` chat command's confirmation reply (see utils/chatCommands.ts). */
export const TAB_STATE_LABEL: Record<TabState, string> = { on: 'On', filtered: 'Filtered', off: 'Off' };

/** Channel/Clan cycle through all three states; every other tab only ever has On/Off. */
export function tabSupportsFiltered(tab: ChatChannel): boolean {
  return tab === 'channel' || tab === 'clan';
}

/** Advances a tab's status line to its next state on click — on -> filtered -> off -> on for
 *  Channel/Clan, on -> off -> on for the rest (see ChatControls.tsx). */
export function nextTabState(tab: ChatChannel, current: TabState): TabState {
  if (tabSupportsFiltered(tab)) {
    if (current === 'on') return 'filtered';
    if (current === 'filtered') return 'off';
    return 'on';
  }
  return current === 'on' ? 'off' : 'on';
}

export const DEFAULT_TAB_STATES: ChatTabStates = {
  all: 'on', // unused (All has no status line of its own) — kept only so the Record is total
  game: 'on',
  public: 'on',
  private: 'on',
  channel: 'on',
  clan: 'on',
  trade: 'on',
};

/** The viewer's locally-picked Filtered subset, per fc/cc tab — community IDs, not messages. See
 *  the chatbox-multi-link feature notes for how "linked" (every community with a name registered)
 *  differs from "selected" (this — the viewer's own narrowed-down pick). */
export interface ChatSelectedIds {
  channel: Set<string>;
  clan: Set<string>;
}

/**
 * Game/Public/Private/Trade only ever go On/Off, and their own tab always shows their own kind
 * regardless of that state (point 7.3) — Off there only means "excluded from All".
 *
 * Channel/Clan additionally support Filtered: every linked community's Friends/Clan Chat is
 * subscribed to continuously (see useChatFeeds), and the tab's status decides what's visible from
 * that set. On shows every linked chat (in All and in the tab itself), Filtered shows just the
 * viewer's selected ones (in All and in the tab, matched by each message's `communityId`), and
 * Off shows none of them anywhere, including its own tab.
 */
export function visibleMessages(
  messages: ChatMessage[],
  selectedTab: ChatChannel,
  tabStates: ChatTabStates,
  selectedIds: ChatSelectedIds,
): ChatMessage[] {
  function passesFcCc(tab: 'channel' | 'clan', m: ChatMessage): boolean {
    const state = tabStates[tab];
    if (state === 'off') return false;
    if (state === 'on') return true;
    const ids = tab === 'channel' ? selectedIds.channel : selectedIds.clan;
    return !!m.communityId && ids.has(m.communityId);
  }

  if (selectedTab === 'all') {
    return messages.filter((m) => {
      const tab = KIND_TO_TAB[m.kind];
      if (tab === 'channel' || tab === 'clan') return passesFcCc(tab, m);
      return tabStates[tab] === 'on';
    });
  }
  if (selectedTab === 'channel' || selectedTab === 'clan') {
    return messages.filter((m) => KIND_TO_TAB[m.kind] === selectedTab && passesFcCc(selectedTab, m));
  }
  return messages.filter((m) => KIND_TO_TAB[m.kind] === selectedTab);
}
