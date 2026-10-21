import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import type { ChatItemRef, ChatMessage } from '../../types/chatbox';
import { formatClockTime } from '../../utils/formatTime';
import { IRONMAN_STATUS_ICONS, MOD_STATUS_ICONS } from './utils/chatIcons';
import { itemIconUrl, stripMessageIconTags } from './utils/itemIcons';
import { splitColorTagRuns } from './utils/chatColorTags';
import chatEmptyTips from './data/chatEmptyTips';
import ScrollbarSprite from '../ScrollbarSprite';
import { SCROLLBAR_STEP_PX, useScrollbarThumb } from '../useScrollbarThumb';

const EMPTY_TIP_COUNT = 3;

/** Strips a legacy `[...]`-wrapped prefix down to its bare label. Chat history persists
 *  indefinitely in localStorage (see utils/chatStorage.ts), and `prefix.text` used to include
 *  its own brackets before ChatLine started wrapping labels in brackets itself — without this,
 *  any message stored under the old format renders doubled, e.g. "[[System]]". */
function prefixLabel(text: string): string {
  return text.startsWith('[') && text.endsWith(']') ? text.slice(1, -1) : text;
}

/** Per-kind message-body color, for kinds that never set `segments` (fc/cc/private — trade falls
 *  back to the base .chat-line-message color, unset here). info/public always set `segments`
 *  instead, coloring themselves per-segment — see useInfoMessages.ts/usePublicSessionEvents.ts. */
const MESSAGE_KIND_CLASS: Partial<Record<ChatMessage['kind'], string>> = {
  fc: 'chat-line-message--fc',
  cc: 'chat-line-message--cc',
  private: 'chat-line-message--private',
};

/** fc/cc are the only kinds that ever carry raw, unprocessed RuneLite chat text — see
 *  chatColorTags.ts — so they're the only ones worth running the (harmless but pointless
 *  elsewhere) tag split on. */
const COLOR_TAG_KINDS = new Set<ChatMessage['kind']>(['fc', 'cc']);

/** Renders a message body's text (with any third-party plugin's own `<img=N>` tags stripped —
 *  see itemIcons.ts for why those are never treated as item ids — and, for fc/cc lines, any
 *  `<colHIGHLIGHT>`/`<colNORMAL>` run switched to its resolved color — see chatColorTags.ts) plus,
 *  when present, the real items splash-helper-backend resolved for a `!log <page>`/`!pets` line,
 *  as a trailing row of `<icon>`/`<icon> x<amount>` pairs — one per item, in the order the backend
 *  sent them. An item with quantity 0 (an unobtained collection-log item, or an unowned pet) is
 *  skipped entirely — no icon. A quantity of exactly 1 renders as a bare icon. Anything higher
 *  renders `<icon> x<amount>`, but only when `showQuantities` is true — a resolved pets line has
 *  `showQuantities: false` since pet ownership isn't a "count" worth showing even if the backend
 *  ever sent one >1. */
function MessageBody({
  text,
  items,
  showQuantities,
  kind,
}: {
  text: string;
  items?: ChatItemRef[];
  showQuantities?: boolean;
  kind?: ChatMessage['kind'];
}) {
  const runs = useMemo(() => {
    const cleaned = stripMessageIconTags(text);
    return kind && COLOR_TAG_KINDS.has(kind) ? splitColorTagRuns(cleaned) : [{ text: cleaned }];
  }, [text, kind]);

  return (
    <>
      {runs.map((run, i) => {
        // NORMAL reuses the channel's own message color (see MESSAGE_KIND_CLASS/
        // .chat-line-message--fc/--cc) — that's already the color fc/cc text normally renders in.
        if (run.tag === 'NORMAL') return <span key={i} className={kind ? MESSAGE_KIND_CLASS[kind] : undefined}>{run.text}</span>;
        if (run.tag === 'HIGHLIGHT') return <span key={i} className="chat-line-message--tag-black">{run.text}</span>;
        return <Fragment key={i}>{run.text}</Fragment>;
      })}
      {items?.filter((item) => item.quantity !== 0).map((item) => (
        <span key={item.id} className="chat-item">
          <img className="chat-icon chat-item-icon" src={itemIconUrl(item.id)} alt="" />
          {showQuantities && item.quantity > 1 && <span className="chat-item-quantity">x{item.quantity}</span>}
        </span>
      ))}
    </>
  );
}

function ChatLine({ msg, showTimestamps }: { msg: ChatMessage; showTimestamps: boolean }) {
  return (
    <div className="chat-line">
      {/* Everything up to the message body itself is grouped into one non-wrapping header item —
          see .chat-line-header/.chat-line-body in Chatbox.css. Splitting the line into these two
          flex items (rather than one long run of inline content) is what makes a wrapped message
          continue at the same horizontal position its first line started at, instead of back at
          the far left of the whole chat log. */}
      <span className="chat-line-header">
        {showTimestamps && (
          <>
            <span className="chat-line-time">[{formatClockTime(new Date(msg.timestamp))}]</span>{' '}
          </>
        )}
        {msg.icon && <img className="chat-icon" src={msg.icon} alt="" />}
        {msg.prefix && (
          <span className="chat-line-prefix">
            <span className="chat-line-prefix-bracket">[</span>
            <span className="chat-line-prefix-text">{prefixLabel(msg.prefix.text)}</span>
            <span className="chat-line-prefix-bracket">]</span>{' '}
          </span>
        )}
        {/* Sender-status icons (mod/ironman/rank) sit right before the username they describe,
            after the channel prefix — not before it. */}
        {msg.modStatus && (
          <img className="chat-icon" src={MOD_STATUS_ICONS[msg.modStatus]} alt={msg.modStatus} />
        )}
        {msg.ironmanStatus && (
          <img className="chat-icon" src={IRONMAN_STATUS_ICONS[msg.ironmanStatus]} alt={msg.ironmanStatus} />
        )}
        {msg.rankIcon && <img className="chat-icon chat-icon-rank" src={msg.rankIcon} alt="rank" />}
        {msg.username && <span className="chat-line-username">{msg.username}:</span>}{msg.username && ' '}
      </span>
      <span className="chat-line-body">
        {msg.segments ? (
          msg.segments.map((seg, i) => (
            <span key={i} className="chat-line-message" style={seg.color ? { color: seg.color } : undefined}>
              <MessageBody text={seg.text} />
            </span>
          ))
        ) : (
          <span className={`chat-line-message ${MESSAGE_KIND_CLASS[msg.kind] ?? ''}`}>
            <MessageBody text={msg.message} items={msg.items} showQuantities={msg.showQuantities} kind={msg.kind} />
          </span>
        )}
      </span>
    </div>
  );
}

/** Shown in place of the log when the currently-filtered view has no messages yet (point 9) —
 *  a few random feature tips, styled like chat lines but never persisted or limit-counted. */
function ChatEmptyState() {
  // Picked once per mount, not recomputed on every re-render — a lazy useState initializer
  // (guaranteed to run exactly once) rather than useMemo, which is for memoizing a pure function
  // of its deps and isn't meant to wrap a one-off random pick like this.
  const [tips] = useState(() => {
    const shuffled = [...chatEmptyTips].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(EMPTY_TIP_COUNT, shuffled.length));
  });

  return (
    <div className="chat-log-empty">
      {tips.map((tip, i) => (
        <div className="chat-line chat-line-tip" key={i}>
          <span className="chat-line-body">
            <span className="chat-line-message">{tip}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

/** The chat log's message list plus a ScrollbarSprite (native `overflow` scrollbars are hidden —
 *  see `.chat-log-viewport` in Chatbox.css). `showTimestamps` is the `::settings timestamp on|off`
 *  chat command's own setting (see hooks/useChatSettings.ts) — defaults on, matching the
 *  chatbox's original behavior. */
export default function ChatLog({ messages, showTimestamps = true }: { messages: ChatMessage[]; showTimestamps?: boolean }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const {
    trackRef,
    thumb,
    updateThumb,
    handleViewportScroll: updateThumbOnScroll,
    scrollBy,
    handleThumbPointerDown,
    handleThumbPointerMove,
    handleThumbPointerUp,
    handleTrackClick,
  } = useScrollbarThumb(viewportRef);

  // Keep the log pinned to the newest message when the user is already at (or near) the
  // bottom; leave their scroll position alone if they've scrolled up to read history.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    if (stickToBottom.current) {
      viewport.scrollTop = viewport.scrollHeight;
    }
    updateThumb();
  }, [messages, updateThumb]);

  function handleViewportScroll() {
    const viewport = viewportRef.current;
    if (viewport) {
      stickToBottom.current = viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop < 16;
    }
    updateThumbOnScroll();
  }

  return (
    <>
      {/* Sits on the left, per the reference chat window — see .chat-window-body. */}
      <ScrollbarSprite
        trackRef={trackRef}
        thumb={thumb}
        onScrollUp={() => scrollBy(-SCROLLBAR_STEP_PX)}
        onScrollDown={() => scrollBy(SCROLLBAR_STEP_PX)}
        onTrackClick={handleTrackClick}
        onThumbPointerDown={handleThumbPointerDown}
        onThumbPointerMove={handleThumbPointerMove}
        onThumbPointerUp={handleThumbPointerUp}
      />

      <div className="chat-log-viewport" ref={viewportRef} onScroll={handleViewportScroll}>
        {messages.length === 0 ? (
          <ChatEmptyState />
        ) : (
          <div className="chat-log">
            {messages.map((msg) => (
              <ChatLine key={msg.id} msg={msg} showTimestamps={showTimestamps} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
