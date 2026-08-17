import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChatChannel, ChatMessage, ChatTabStates, LiveChatChannelType } from '../../types/chatbox';
import { useAuth } from '../../context/AuthContext';
import { useChatChannels } from '../../hooks/useChatChannels';
import { useChatFeeds } from '../../hooks/useChatFeeds';
import { useInfoMessages } from '../../hooks/useInfoMessages';
import { useCommandLog } from '../../hooks/useCommandLog';
import { usePublicSessionEvents } from '../../hooks/usePublicSessionEvents';
import { usePrivateLog } from '../../hooks/usePrivateLog';
import { useTradeLog } from '../../hooks/useTradeLog';
import { useAccountActivityEvents } from '../../hooks/useAccountActivityEvents';
import { useChatSettings } from '../../hooks/useChatSettings';
import { useEmailReminder } from '../../hooks/useEmailReminder';
import ChatLog from './ChatLog';
import ChatControls from './ChatControls';
import ReportModal from './ReportModal';
import { DEFAULT_TAB_STATES, nextTabState, visibleMessages } from './chatFilter';
import { runChatCommand } from './chatCommands';
import { CC_SELECTED_KEY, FC_SELECTED_KEY, loadSelectedIds, saveSelectedIds } from '../../utils/chatStorage';
import './Chatbox.css';

interface ChatInputRowProps {
  tabStates: ChatTabStates;
  onToggleTabState: (tab: ChatChannel) => void;
  /** Owned by Chatbox (not this component) so a click anywhere in `.chat-window` — not just on
   *  the input itself — can focus it; see Chatbox's own onClick below. */
  inputRef: React.RefObject<HTMLInputElement | null>;
}

/** The chat-input row pinned under the divider — a `::command` console (see chatCommands.ts),
 *  not a real chat: nothing typed here is ever broadcast. Enter parses and runs the line, always
 *  replying on the Game tab, then clears the field. The `*` next to it is a static cursor marker
 *  (not the real caret, which is hidden via `caret-color` in Chatbox.css) — it doesn't blink and
 *  is always shown, matching the box's original decorative look but without the distracting
 *  blinking native caret once there's actually something to type into. */
function ChatInputRow({ tabStates, onToggleTabState, inputRef }: ChatInputRowProps) {
  const { user } = useAuth();
  const name = user?.username ?? 'Ardy Hosts';
  const [value, setValue] = useState('');

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case 'Enter':
        const text = value
        setValue('');
        runChatCommand(text, { tabStates, toggleTabState: onToggleTabState });        
        break;
      case 'Backspace':
        setValue(value.slice(0, value.length - 1));
        break;
      default:
        return;
    }
  }

  return (
    <div className="chat-input-row">
      <label htmlFor='chat-input' className="chat-input-text">{name}: </label>
      <input
        ref={inputRef}
        id='chat-input'
        className="chat-input-field"
        type="text"
        value={value + "*"}
        onChange={(e) => setValue(e.target.value.replace("*", ""))}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        spellCheck={false}
        aria-label="Chat command input"
      />
    </div>
  );
}

interface Props {
  /** Explicit static messages, mainly for local/demo use. Omit this to let Chatbox manage its
   *  own community picker and live feeds off the backend's chat relay plus the local Game/
   *  Public/Private/Trade logs (the normal case). Bypasses tab filtering entirely — it's just
   *  rendered as-is. */
  messages?: ChatMessage[];
  className?: string;
}

/** One `Channel — N linked ● live` (or `Clan — …`) summary line for the header — omitted
 *  entirely by the caller when nothing of that type is linked. */
function LiveStatusLine({ label, connected }: { label: string; connected: Record<string, boolean> }) {
  const total = Object.keys(connected).length;
  const up = Object.values(connected).filter(Boolean).length;
  const allConnected = up === total;
  return (
    <span>
      {label} — {total} linked
      <span className={allConnected ? 'is-connected' : 'is-disconnected'}>
        {allConnected ? ' ● live' : ` ○ ${up}/${total} live`}
      </span>
    </span>
  );
}

export default function Chatbox({ messages: messagesOverride, className }: Props) {
  const [channel, setChannel] = useState<ChatChannel>('all');
  const [windowOpen, setWindowOpen] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [fcSelected, setFcSelected] = useState<Set<string>>(() => loadSelectedIds(FC_SELECTED_KEY));
  const [ccSelected, setCcSelected] = useState<Set<string>>(() => loadSelectedIds(CC_SELECTED_KEY));
  const [tabStates, setTabStates] = useState(DEFAULT_TAB_STATES);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Only needed in live mode — an explicit `messages` override skips the picker and every local
  // feed entirely, so all of this stays idle when unused.
  const live = messagesOverride === undefined;
  const { channels } = useChatChannels();
  // Every *linked* community's fc/cc feed is watched continuously, regardless of the Channel/Clan
  // tab's own state — see useChatFeeds. Only display filtering (chatFilter.ts) is state-aware.
  const { messages: fcMessages, connected: fcConnected } = useChatFeeds(live ? channels : [], 'fc');
  const { messages: ccMessages, connected: ccConnected } = useChatFeeds(live ? channels : [], 'cc');
  const infoMessages = useInfoMessages();
  const commandMessages = useCommandLog();
  const publicMessages = usePublicSessionEvents();
  const { messages: privateMessages, loggedIn: privateLoggedIn } = usePrivateLog();
  const { messages: tradeMessages, loggedIn: tradeLoggedIn } = useTradeLog();
  // Generates the real archived-session/payout entries the two hooks above read back — see its
  // doc comment for why this has to poll rather than push.
  useAccountActivityEvents();
  const { timestamps: showTimestamps } = useChatSettings();

  const emailReminder = useEmailReminder();
  const [spotlightMessageId, setSpotlightMessageId] = useState<string | null>(null);
  const [alertFlash, setAlertFlash] = useState(false);

  // A missing/unverified email fires this once per visit — jump to Private, show only the
  // reminder (not the whole log), and briefly flash the window to draw the eye. Picking any tab
  // manually (handleSelect) clears the spotlight, so All -> Private afterward shows everything.
  useEffect(() => {
    if (!emailReminder) return;
    setChannel('private');
    setWindowOpen(true);
    setSpotlightMessageId(emailReminder.id);
    setAlertFlash(true);
    const timeout = setTimeout(() => setAlertFlash(false), 1500);
    return () => clearTimeout(timeout);
  }, [emailReminder]);

  const mergedMessages = useMemo(
    () =>
      [
        ...fcMessages,
        ...ccMessages,
        ...infoMessages,
        ...commandMessages,
        ...publicMessages,
        ...(privateLoggedIn ? privateMessages : []),
        ...(tradeLoggedIn ? tradeMessages : []),
      ].sort((a, b) => a.timestamp - b.timestamp),
    [
      fcMessages,
      ccMessages,
      infoMessages,
      commandMessages,
      publicMessages,
      privateMessages,
      privateLoggedIn,
      tradeMessages,
      tradeLoggedIn,
    ],
  );

  const messages =
    messagesOverride ??
    (spotlightMessageId && channel === 'private'
      ? mergedMessages.filter((m) => m.id === spotlightMessageId)
      : visibleMessages(mergedMessages, channel, tabStates, { channel: fcSelected, clan: ccSelected }));

  // Picking a new tab switches channel and (re)opens the window; clicking the tab that's
  // already selected toggles the window closed/open instead, matching OSRS's own chatbox.
  function handleSelect(tab: ChatChannel) {
    setSpotlightMessageId(null);
    if (tab === channel) {
      setWindowOpen((open) => !open);
    } else {
      setChannel(tab);
      setWindowOpen(true);
    }
  }

  function handleToggleTabState(tab: ChatChannel) {
    setTabStates((prev) => ({ ...prev, [tab]: nextTabState(tab, prev[tab]) }));
  }

  // Checking/unchecking a community in the right-click menu only edits the viewer's own local
  // Filtered selection — every linked community is already being watched regardless (see
  // useChatFeeds), and this doesn't touch the tab's own On/Filtered/Off status, which stays a
  // separate, independently-toggled concern (the tab's status line).
  function handleToggleChatSelection(channelType: LiveChatChannelType, communityId: string) {
    const [selected, setSelected, key] =
      channelType === 'fc' ? ([fcSelected, setFcSelected, FC_SELECTED_KEY] as const) : ([ccSelected, setCcSelected, CC_SELECTED_KEY] as const);
    const next = new Set(selected);
    if (next.has(communityId)) next.delete(communityId);
    else next.add(communityId);
    setSelected(next);
    saveSelectedIds(key, next);
  }

  const needsLogin =
    live && ((channel === 'private' && !privateLoggedIn) || (channel === 'trade' && !tradeLoggedIn));

  const hasFcLinks = live && Object.keys(fcConnected).length > 0;
  const hasCcLinks = live && Object.keys(ccConnected).length > 0;

  return (
    <div className={`chatbox ${alertFlash ? 'chatbox--alert' : ''} ${className ?? ''}`}>
      {(hasFcLinks || hasCcLinks) && (
        <div className="chat-live-status">
          {hasFcLinks && <LiveStatusLine label="Channel" connected={fcConnected} />}
          {hasFcLinks && hasCcLinks && ' · '}
          {hasCcLinks && <LiveStatusLine label="Clan" connected={ccConnected} />}
        </div>
      )}

      {windowOpen && (
        // Clicking anywhere in the window — the log, its scrollbar, the input row itself —
        // focuses the command input, same as clicking directly into it.
        <div className="chat-window" onClick={() => chatInputRef.current?.focus()}>
          <div className="chat-window-body">
            {needsLogin ? (
              <div className="chat-empty-hint">Log in to use this feature.</div>
            ) : (
              <ChatLog messages={messages} showTimestamps={showTimestamps} />
            )}
          </div>
          <ChatInputRow tabStates={tabStates} onToggleTabState={handleToggleTabState} inputRef={chatInputRef} />
        </div>
      )}
      <ChatControls
        selected={channel}
        onSelect={handleSelect}
        onReport={() => setReportOpen(true)}
        tabStates={tabStates}
        onToggleTabState={handleToggleTabState}
        chatChannels={channels}
        chatSelected={{ fc: fcSelected, cc: ccSelected }}
        onToggleChatSelection={handleToggleChatSelection}
      />

      {reportOpen && (
        <ReportModal
          onClose={() => setReportOpen(false)}
          onSubmit={(report) => console.log('Report submitted', report)}
        />
      )}
    </div>
  );
}
