import type { ChatChannel, ChatMessage, ChatMessageKind, ChatTabStates, TabState } from '../../../types/chatbox';

export const KIND_TO_TAB: Record<ChatMessageKind, ChatChannel> = {
  fc: 'channel',
  cc: 'clan',
  info: 'game',
  system: 'game',
  public: 'public',
  private: 'private',
  trade: 'trade',
};

export const TAB_STATE_LABEL: Record<TabState, string> = { on: 'On', filtered: 'Filtered', off: 'Off' };

export function tabSupportsFiltered(tab: ChatChannel): boolean {
  return tab === 'channel' || tab === 'clan';
}

export function nextTabState(tab: ChatChannel, current: TabState): TabState {
  if (tabSupportsFiltered(tab)) {
    if (current === 'on') return 'filtered';
    if (current === 'filtered') return 'off';
    return 'on';
  }
  return current === 'on' ? 'off' : 'on';
}

export const DEFAULT_TAB_STATES: ChatTabStates = {
  all: 'on',
  game: 'on',
  public: 'on',
  private: 'on',
  channel: 'on',
  clan: 'on',
  trade: 'on',
};

export interface ChatSelectedIds {
  channel: Set<string>;
  clan: Set<string>;
}

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
