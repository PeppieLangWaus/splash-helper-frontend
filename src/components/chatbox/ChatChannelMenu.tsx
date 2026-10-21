import { useLayoutEffect, useRef, useState } from 'react';
import type { ChatChannelListing, LiveChatChannelType } from '../../types/chatbox';
import './ChatChannelMenu.css';

interface Props {

  channelType: LiveChatChannelType;

  channels: ChatChannelListing[];

  selected: Set<string>;
  onToggle: (communityId: string) => void;
}

const TYPE_LABEL: Record<LiveChatChannelType, string> = {
  fc: 'Friends Chat',
  cc: 'Clan Chat',
};

interface Placement {
  vertical: 'down' | 'up';
  horizontal: 'left' | 'right';
}

export default function ChatChannelMenu({ channelType, channels, selected, onToggle }: Props) {
  const label = TYPE_LABEL[channelType];
  const options = channels.filter((c) => (channelType === 'fc' ? c.friendsChatName : c.clanChatName));

  const menuRef = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState<Placement>({ vertical: 'down', horizontal: 'left' });

  useLayoutEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();

    setPlacement({
      vertical: rect.bottom > window.innerHeight ? 'up' : 'down',
      horizontal: rect.right > window.innerWidth ? 'right' : 'left',
    });
  }, [options.length]);

  return (
    <div
      ref={menuRef}
      className={`chat-channel-menu chat-channel-menu--${placement.vertical} chat-channel-menu--${placement.horizontal}`}
      role="menu"

      onContextMenu={(e) => e.preventDefault()}

      onClick={(e) => e.stopPropagation()}
    >
      <div className="chat-channel-menu-title">{label}</div>
      <div className="chat-channel-menu-subtitle">Pick which show when Filtered</div>

      {options.length === 0 && (
        <div className="chat-channel-menu-empty">No live {label.toLowerCase()}s registered yet</div>
      )}

      {options.map((c) => {
        const name = channelType === 'fc' ? c.friendsChatName : c.clanChatName;
        const isSelected = selected.has(c.communityId);
        return (
          <button
            key={c.communityId}
            type="button"
            role="menuitemcheckbox"
            aria-checked={isSelected}
            className={`chat-channel-menu-item ${isSelected ? 'is-selected' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(c.communityId);
            }}
          >
            {isSelected ? '☑' : '☐'} {c.communityName} — {name}
          </button>
        );
      })}
    </div>
  );
}
