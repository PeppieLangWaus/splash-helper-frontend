import { useEffect, useRef, useState } from 'react';
import type { ChatChannel, ChatChannelListing, ChatTabStates, LiveChatChannelType, TabState } from '../../types/chatbox';
import PixelText from './PixelText';
import ChatChannelMenu from './ChatChannelMenu';
import { TAB_STATE_COLORS } from './chatColors';

const TABS: { id: ChatChannel; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'game', label: 'Game' },
  { id: 'public', label: 'Public' },
  { id: 'private', label: 'Private' },
  { id: 'channel', label: 'Channel' },
  { id: 'clan', label: 'Clan' },
  { id: 'trade', label: 'Trade' },
];

// Which live chat type each OSRS tab picks, when right-clicked. Every other tab is purely
// decorative and ignores right-click.
const LIVE_CHANNEL_TYPE_BY_TAB: Partial<Record<ChatChannel, LiveChatChannelType>> = {
  channel: 'fc',
  clan: 'cc',
};

const STATE_LABEL: Record<TabState, string> = { on: 'On', filtered: 'Filtered', off: 'Off' };

export interface ChatSelection {
  communityId: string;
  channelType: LiveChatChannelType;
}

interface Props {
  selected: ChatChannel;
  onSelect: (channel: ChatChannel) => void;
  onReport: () => void;
  tabStates: ChatTabStates;
  onToggleTabState: (tab: ChatChannel) => void;
  /** Communities available to watch, and the current pick per type — right-clicking "Channel"/
   *  "Clan" opens a menu built from these (see useChatChannels / Chatbox). */
  chatChannels: ChatChannelListing[];
  chatSelections: { fc: ChatSelection | null; cc: ChatSelection | null };
  onSelectChatChannel: (channelType: LiveChatChannelType, selection: ChatSelection | null) => void;
}

/** The chatbox's bottom bar: 7 channel-filter tabs (only one selected at a time) plus a
 *  report button, on the `controls.png` background. Each tab (besides All) also has its own
 *  status line — Game/Public/Private/Trade cycle On/Off, Channel/Clan cycle On/Filtered/Off —
 *  toggled independently of which tab is selected; see chatbox/chatFilter.ts for what each state
 *  actually does to the message list. Right-clicking "Channel" or "Clan" additionally opens a
 *  menu of live Friends/Clan Chats to watch. */
export default function ChatControls({
  selected,
  onSelect,
  onReport,
  tabStates,
  onToggleTabState,
  chatChannels,
  chatSelections,
  onSelectChatChannel,
}: Props) {
  const [menuFor, setMenuFor] = useState<LiveChatChannelType | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close the open menu on a click outside it, or Escape.
  useEffect(() => {
    if (!menuFor) return;
    function handlePointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setMenuFor(null);
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuFor(null);
    }
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuFor]);

  function handleContextMenu(e: React.MouseEvent, tab: ChatChannel) {
    const channelType = LIVE_CHANNEL_TYPE_BY_TAB[tab];
    if (!channelType) return; // not "Channel"/"Clan" — let the real browser menu through
    e.preventDefault();
    setMenuFor((current) => (current === channelType ? null : channelType));
  }

  return (
    <div className="chat-controls" ref={containerRef}>
      {TABS.map((tab) => {
        const channelType = LIVE_CHANNEL_TYPE_BY_TAB[tab.id];
        const state = tabStates[tab.id];
        return (
          <div
            key={tab.id}
            className={`chat-tab-btn ${selected === tab.id ? 'is-selected' : ''} ${tab.id === 'all' ? 'chat-tab-btn--no-status' : ''}`}
            role="button"
            tabIndex={0}
            aria-label={tab.label}
            onClick={() => onSelect(tab.id)}
            onContextMenu={(e) => handleContextMenu(e, tab.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onSelect(tab.id);
            }}
          >
            <div className="chat-tab-label">
              <PixelText text={tab.label} fontSize={12} color="#ffffff" />
            </div>
            {/* "All" isn't a filterable channel — it has no On/Filtered/Off state, unlike the
                rest, so its label centers vertically (see .chat-tab-btn--no-status) instead of
                sitting at the fixed top offset the other tabs use to line up with their status
                line. */}
            {tab.id !== 'all' && (
              <button
                type="button"
                className="chat-tab-status"
                aria-label={`${tab.label}: ${STATE_LABEL[state]}, click to toggle`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleTabState(tab.id);
                }}
              >
                <PixelText text={STATE_LABEL[state]} fontSize={12} color={TAB_STATE_COLORS[state]} />
              </button>
            )}

            {channelType && menuFor === channelType && (
              <ChatChannelMenu
                channelType={channelType}
                channels={chatChannels}
                selected={chatSelections[channelType]}
                onSelect={(sel) => {
                  onSelectChatChannel(channelType, sel);
                  setMenuFor(null);
                }}
                onClear={() => {
                  onSelectChatChannel(channelType, null);
                  setMenuFor(null);
                }}
              />
            )}
          </div>
        );
      })}
      <button type="button" className="chat-report-btn" aria-label="Report player" onClick={onReport}>
        <PixelText text="Report" fontSize={12} color="#ffffff" />
      </button>
    </div>
  );
}
