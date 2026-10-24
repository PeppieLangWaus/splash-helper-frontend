import { useEffect, useRef, useState } from 'react';
import type { ChatChannel, ChatChannelListing, ChatTabStates, LiveChatChannelType } from '../../types/chatbox';
import PixelText from '../PixelText';
import ChatChannelMenu from './ChatChannelMenu';
import { TAB_STATE_COLORS } from './utils/chatColors';
import { TAB_STATE_LABEL } from './utils/chatFilter';

const TABS: { id: ChatChannel; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'game', label: 'Game' },
  { id: 'public', label: 'Public' },
  { id: 'private', label: 'Private' },
  { id: 'channel', label: 'Channel' },
  { id: 'clan', label: 'Clan' },
  { id: 'trade', label: 'Trade' },
];

const LIVE_CHANNEL_TYPE_BY_TAB: Partial<Record<ChatChannel, LiveChatChannelType>> = {
  channel: 'fc',
  clan: 'cc',
};

interface Props {
  selected: ChatChannel;
  onSelect: (channel: ChatChannel) => void;
  onReport: () => void;
  tabStates: ChatTabStates;
  onToggleTabState: (tab: ChatChannel) => void;

  chatChannels: ChatChannelListing[];

  chatSelected: { fc: Set<string>; cc: Set<string> };
  onToggleChatSelection: (channelType: LiveChatChannelType, communityId: string) => void;
}

export default function ChatControls({
  selected,
  onSelect,
  onReport,
  tabStates,
  onToggleTabState,
  chatChannels,
  chatSelected,
  onToggleChatSelection,
}: Props) {
  const [menuFor, setMenuFor] = useState<LiveChatChannelType | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
    if (!channelType) return;
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
            {}
            {tab.id !== 'all' && (
              <button
                type="button"
                className="chat-tab-status"
                aria-label={`${tab.label}: ${TAB_STATE_LABEL[state]}, click to toggle`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleTabState(tab.id);
                }}
              >
                <PixelText text={TAB_STATE_LABEL[state]} fontSize={12} color={TAB_STATE_COLORS[state]} />
              </button>
            )}

            {channelType && menuFor === channelType && (
              <ChatChannelMenu
                channelType={channelType}
                channels={chatChannels}
                selected={chatSelected[channelType]}
                onToggle={(communityId) => onToggleChatSelection(channelType, communityId)}
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
