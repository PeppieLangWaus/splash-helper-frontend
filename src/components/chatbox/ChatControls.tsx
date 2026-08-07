import { useState } from 'react';
import type { ChatChannel } from '../../types/chatbox';

const TABS: { id: ChatChannel; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'game', label: 'Game' },
  { id: 'public', label: 'Public' },
  { id: 'private', label: 'Private' },
  { id: 'channel', label: 'Channel' },
  { id: 'clan', label: 'Clan' },
  { id: 'trade', label: 'Trade' },
];

type TabState = 'on' | 'filtered';

interface Props {
  selected: ChatChannel;
  onSelect: (channel: ChatChannel) => void;
  onReport: () => void;
}

/** The chatbox's bottom bar: 7 channel-filter tabs (only one selected at a time) plus a
 *  report button, on the `controls.png` background. Each tab also has its own "On"/"Filtered"
 *  state, toggled independently of which tab is selected. */
export default function ChatControls({ selected, onSelect, onReport }: Props) {
  const [states, setStates] = useState<Record<ChatChannel, TabState>>(() =>
    Object.fromEntries(TABS.map((tab) => [tab.id, 'on'])) as Record<ChatChannel, TabState>,
  );

  function toggleState(id: ChatChannel) {
    setStates((prev) => ({ ...prev, [id]: prev[id] === 'on' ? 'filtered' : 'on' }));
  }

  return (
    <div className="chat-controls">
      {TABS.map((tab) => (
        <div
          key={tab.id}
          className={`chat-tab-btn ${selected === tab.id ? 'is-selected' : ''}`}
          role="button"
          tabIndex={0}
          onClick={() => onSelect(tab.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onSelect(tab.id);
          }}
        >
          <div className="chat-tab-label">{tab.label}</div>
          <button
            type="button"
            className={`chat-tab-status chat-tab-status-${states[tab.id]}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleState(tab.id);
            }}
          >
            {states[tab.id] === 'on' ? 'On' : 'Filtered'}
          </button>
        </div>
      ))}
      <button type="button" className="chat-report-btn" aria-label="Report player" onClick={onReport} />
    </div>
  );
}
