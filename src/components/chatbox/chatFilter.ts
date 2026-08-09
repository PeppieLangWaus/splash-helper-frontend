import type { ChatChannel, ChatMessage, ChatMessageKind, ChatTabStates, TabState } from '../../types/chatbox';

/** Which bottom-bar tab each message kind belongs to. */
export const KIND_TO_TAB: Record<ChatMessageKind, ChatChannel> = {
  fc: 'channel',
  cc: 'clan',
  info: 'game',
  public: 'public',
  private: 'private',
  trade: 'trade',
};

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

/**
 * The All tab shows every message whose own tab is currently On — Filtered and Off both exclude
 * it from All (point 7.2's "if fc/cc button have the filtered state it should only show the
 * selected chat's messages" — under this app's one-community-per-type live feed, that reduces to
 * "not shown in All"). Any other selected tab shows only its own kind, ignoring its own state —
 * point 7.3's explicit rule for Game, generalized to every tab by 7.2's "same goes for buttons
 * with On or Off states".
 */
export function visibleMessages(
  messages: ChatMessage[],
  selectedTab: ChatChannel,
  tabStates: ChatTabStates,
): ChatMessage[] {
  if (selectedTab === 'all') {
    return messages.filter((m) => tabStates[KIND_TO_TAB[m.kind]] === 'on');
  }
  return messages.filter((m) => KIND_TO_TAB[m.kind] === selectedTab);
}
