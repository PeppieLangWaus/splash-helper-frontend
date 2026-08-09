import { useMemo, useState } from 'react';
import type { ChatChannel, ChatMessage, LiveChatChannelType } from '../../types/chatbox';
import { useAuth } from '../../context/AuthContext';
import { useChatChannels } from '../../hooks/useChatChannels';
import { useChatFeed } from '../../hooks/useChatFeed';
import { useInfoMessages } from '../../hooks/useInfoMessages';
import { usePublicSessionEvents } from '../../hooks/usePublicSessionEvents';
import { usePrivateLog } from '../../hooks/usePrivateLog';
import { useTradeLog } from '../../hooks/useTradeLog';
import { useAccountActivityEvents } from '../../hooks/useAccountActivityEvents';
import ChatLog from './ChatLog';
import ChatControls, { type ChatSelection } from './ChatControls';
import ReportModal from './ReportModal';
import { CHAT_BLUE } from './chatColors';
import { DEFAULT_TAB_STATES, nextTabState, visibleMessages } from './chatFilter';
import './Chatbox.css';

/** The chat-input look-alike pinned under the divider — purely decorative for now, no typing. */
function ChatInputRow() {
  const { user } = useAuth();
  const name = user?.username ?? 'ardy hosts';

  return (
    <div className="chat-input-row">
      <span className="chat-input-text">
        {name}: <span className="chat-input-cursor">*</span>
      </span>
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

export default function Chatbox({ messages: messagesOverride, className }: Props) {
  const [channel, setChannel] = useState<ChatChannel>('all');
  const [windowOpen, setWindowOpen] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [fcSelection, setFcSelection] = useState<ChatSelection | null>(null);
  const [ccSelection, setCcSelection] = useState<ChatSelection | null>(null);
  const [tabStates, setTabStates] = useState(DEFAULT_TAB_STATES);

  // Only needed in live mode — an explicit `messages` override skips the picker and every local
  // feed entirely, so all of this stays idle when unused.
  const live = messagesOverride === undefined;
  const { channels } = useChatChannels();
  const { messages: fcMessagesRaw, connected: fcConnected } = useChatFeed(
    live ? (fcSelection?.communityId ?? null) : null,
    live ? 'fc' : null,
  );
  const { messages: ccMessagesRaw, connected: ccConnected } = useChatFeed(
    live ? (ccSelection?.communityId ?? null) : null,
    live ? 'cc' : null,
  );
  const infoMessages = useInfoMessages();
  const publicMessages = usePublicSessionEvents();
  const { messages: privateMessages, loggedIn: privateLoggedIn } = usePrivateLog();
  const { messages: tradeMessages, loggedIn: tradeLoggedIn } = useTradeLog();
  // Generates the real archived-session/payout entries the two hooks above read back — see its
  // doc comment for why this has to poll rather than push.
  useAccountActivityEvents();

  const fcListing = fcSelection ? channels.find((c) => c.communityId === fcSelection.communityId) : undefined;
  const ccListing = ccSelection ? channels.find((c) => c.communityId === ccSelection.communityId) : undefined;
  const fcLabel = fcListing ? (fcListing.friendsChatDisplayName ?? fcListing.friendsChatName) : null;
  const ccLabel = ccListing ? ccListing.clanChatName : null;

  // Re-stamped from the *current* channel listing on every merge (not baked in when a message
  // first arrives) so renaming a Friends Chat display name relabels its whole history live.
  const mergedMessages = useMemo(() => {
    const fcTagged = fcLabel
      ? fcMessagesRaw.map((m) => ({ ...m, prefix: { text: `[${fcLabel}]`, color: CHAT_BLUE } }))
      : fcMessagesRaw;
    const ccTagged = ccLabel
      ? ccMessagesRaw.map((m) => ({ ...m, prefix: { text: `[${ccLabel}]`, color: CHAT_BLUE } }))
      : ccMessagesRaw;
    return [
      ...fcTagged,
      ...ccTagged,
      ...infoMessages,
      ...publicMessages,
      ...(privateLoggedIn ? privateMessages : []),
      ...(tradeLoggedIn ? tradeMessages : []),
    ].sort((a, b) => a.timestamp - b.timestamp);
  }, [fcMessagesRaw, ccMessagesRaw, fcLabel, ccLabel, infoMessages, publicMessages, privateMessages, privateLoggedIn, tradeMessages, tradeLoggedIn]);

  const messages = messagesOverride ?? visibleMessages(mergedMessages, channel, tabStates);

  // Picking a new tab switches channel and (re)opens the window; clicking the tab that's
  // already selected toggles the window closed/open instead, matching OSRS's own chatbox.
  function handleSelect(tab: ChatChannel) {
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

  // Picking a chat from the right-click menu also flips that tab to Filtered ("enable the
  // filter state" — point 3); clearing it resets back to On since there's no longer a specific
  // chat to filter down to.
  function handleSelectChatChannel(channelType: LiveChatChannelType, selection: ChatSelection | null) {
    const tab: ChatChannel = channelType === 'fc' ? 'channel' : 'clan';
    if (channelType === 'fc') setFcSelection(selection);
    else setCcSelection(selection);
    setTabStates((prev) => ({ ...prev, [tab]: selection ? 'filtered' : 'on' }));
  }

  const needsLogin =
    live && ((channel === 'private' && !privateLoggedIn) || (channel === 'trade' && !tradeLoggedIn));
  const needsChatPick = !live
    ? null
    : channel === 'channel' && !fcSelection
      ? 'Friends Chat'
      : channel === 'clan' && !ccSelection
        ? 'Clan Chat'
        : null;

  return (
    <div className={`chatbox ${className ?? ''}`}>
      {live && (fcSelection || ccSelection) && (
        <div className="chat-live-status">
          {fcSelection && (
            <span>
              Channel — {fcListing?.communityName ?? '…'}
              {fcLabel ? ` — ${fcLabel}` : ''}
              <span className={fcConnected ? 'is-connected' : 'is-disconnected'}>
                {fcConnected ? ' ● live' : ' ○ reconnecting…'}
              </span>
            </span>
          )}
          {fcSelection && ccSelection && ' · '}
          {ccSelection && (
            <span>
              Clan — {ccListing?.communityName ?? '…'}
              {ccLabel ? ` — ${ccLabel}` : ''}
              <span className={ccConnected ? 'is-connected' : 'is-disconnected'}>
                {ccConnected ? ' ● live' : ' ○ reconnecting…'}
              </span>
            </span>
          )}
        </div>
      )}

      {windowOpen && (
        <div className="chat-window">
          <div className="chat-window-body">
            {needsLogin ? (
              <div className="chat-empty-hint">Log in to use this feature.</div>
            ) : needsChatPick ? (
              <div className="chat-empty-hint">Right-click "{channel === 'channel' ? 'Channel' : 'Clan'}" below to watch a community's live {needsChatPick}.</div>
            ) : (
              <ChatLog messages={messages} />
            )}
          </div>
          <ChatInputRow />
        </div>
      )}
      <ChatControls
        selected={channel}
        onSelect={handleSelect}
        onReport={() => setReportOpen(true)}
        tabStates={tabStates}
        onToggleTabState={handleToggleTabState}
        chatChannels={channels}
        chatSelections={{ fc: fcSelection, cc: ccSelection }}
        onSelectChatChannel={handleSelectChatChannel}
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
