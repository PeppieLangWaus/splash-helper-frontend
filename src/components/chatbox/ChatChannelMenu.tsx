import { useLayoutEffect, useRef, useState } from 'react';
import type { ChatChannelListing, LiveChatChannelType } from '../../types/chatbox';
import type { ChatSelection } from './ChatControls';
import './ChatChannelMenu.css';

interface Props {
  /** Which side this menu lists — 'fc' for the "Channel" tab, 'cc' for the "Clan" tab. */
  channelType: LiveChatChannelType;
  channels: ChatChannelListing[];
  selected: ChatSelection | null;
  onSelect: (selection: ChatSelection) => void;
  onClear: () => void;
}

const TYPE_LABEL: Record<LiveChatChannelType, string> = {
  fc: 'Friends Chat',
  cc: 'Clan Chat',
};

interface Placement {
  vertical: 'down' | 'up';
  horizontal: 'left' | 'right';
}

/** Right-click popup on the "Channel"/"Clan" tab (see ChatControls) listing every community
 *  that's registered a live Friends/Clan Chat, sourced from GET /chat-channels.
 *
 *  The chatbox usually sits near the bottom of the page, so this can't just always drop down
 *  from the button — it renders once at its default (down/left) position, measures itself
 *  against the viewport, and flips up and/or right if it would otherwise run off-screen. */
export default function ChatChannelMenu({ channelType, channels, selected, onSelect, onClear }: Props) {
  const label = TYPE_LABEL[channelType];
  const options = channels.filter((c) => (channelType === 'fc' ? c.friendsChatName : c.clanChatName));

  const menuRef = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState<Placement>({ vertical: 'down', horizontal: 'left' });

  // Runs synchronously before paint, so the flip (when needed) happens before the user ever
  // sees the unflipped position — no visible jump. Re-measures if the option count changes,
  // since that changes the menu's height.
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
      // Left-click just picks an item; a second right-click on the already-open menu shouldn't
      // spawn the browser's own context menu on top of it.
      onContextMenu={(e) => e.preventDefault()}
      // Belt-and-suspenders alongside each item's own stopPropagation below: a click anywhere in
      // the menu (including its background/title) shouldn't bubble up into the parent tab's own
      // onClick and toggle the chat window closed.
      onClick={(e) => e.stopPropagation()}
    >
      <div className="chat-channel-menu-title">{label}</div>

      {options.length === 0 && (
        <div className="chat-channel-menu-empty">No live {label.toLowerCase()}s registered yet</div>
      )}

      {options.map((c) => {
        const name = channelType === 'fc' ? c.friendsChatName : c.clanChatName;
        const isSelected = selected?.communityId === c.communityId && selected.channelType === channelType;
        return (
          <button
            key={c.communityId}
            type="button"
            role="menuitemradio"
            aria-checked={isSelected}
            className={`chat-channel-menu-item ${isSelected ? 'is-selected' : ''}`}
            onClick={(e) => {
              // This menu is nested inside the tab's own clickable div (see ChatControls) — left
              // clicking here would otherwise bubble up into that tab's onClick, which (when the
              // tab is already selected) toggles the whole chat window closed instead of just
              // picking a chat (see point 3 of the chatbox feature notes).
              e.stopPropagation();
              onSelect({ communityId: c.communityId, channelType });
            }}
          >
            {c.communityName} — {name}
          </button>
        );
      })}

      {selected?.channelType === channelType && (
        <button
          type="button"
          className="chat-channel-menu-item chat-channel-menu-clear"
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
        >
          Stop watching
        </button>
      )}
    </div>
  );
}
