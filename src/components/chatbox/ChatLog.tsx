import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChatItemRef, ChatMessage } from '../../types/chatbox';
import { formatClockTime } from '../../utils/formatTime';
import { IRONMAN_STATUS_ICONS, MOD_STATUS_ICONS } from './chatIcons';
import { itemIconUrl, stripMessageIconTags } from './itemIcons';
import { splitColorTagRuns } from './chatColorTags';
import chatEmptyTips from '../../data/chatEmptyTips';

const MIN_THUMB_HEIGHT = 12;
const STEP_PX = 24;
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
  const tips = useMemo(() => {
    const shuffled = [...chatEmptyTips].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(EMPTY_TIP_COUNT, shuffled.length));
  }, []);

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

/** The chat log's message list plus a custom scrollbar built from the `chatbox/scroll` sprites
 *  (native `overflow` scrollbars are hidden — see `.chat-log-viewport` in Chatbox.css).
 *  `showTimestamps` is the `::settings timestamp on|off` chat command's own setting (see
 *  hooks/useChatSettings.ts) — defaults on, matching the chatbox's original behavior. */
export default function ChatLog({ messages, showTimestamps = true }: { messages: ChatMessage[]; showTimestamps?: boolean }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState({ top: 0, height: MIN_THUMB_HEIGHT, visible: false });
  const dragState = useRef<{ startY: number; startScrollTop: number } | null>(null);
  const stickToBottom = useRef(true);

  const updateThumb = useCallback(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const { scrollHeight, clientHeight, scrollTop } = viewport;
    const trackHeight = track.clientHeight;

    if (scrollHeight <= clientHeight + 1) {
      // Nothing to scroll — fill the whole track with the thumb instead of hiding it (point 2).
      setThumb({ top: 0, height: trackHeight, visible: true });
      return;
    }

    const height = Math.max(MIN_THUMB_HEIGHT, (clientHeight / scrollHeight) * trackHeight);
    const maxScrollTop = scrollHeight - clientHeight;
    const maxThumbTop = trackHeight - height;
    const top = maxScrollTop > 0 ? (scrollTop / maxScrollTop) * maxThumbTop : 0;

    setThumb({ top, height, visible: true });
  }, []);

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

  useEffect(() => {
    updateThumb();
    window.addEventListener('resize', updateThumb);
    return () => window.removeEventListener('resize', updateThumb);
  }, [updateThumb]);

  function handleViewportScroll() {
    const viewport = viewportRef.current;
    if (viewport) {
      stickToBottom.current = viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop < 16;
    }
    updateThumb();
  }

  function scrollBy(delta: number) {
    viewportRef.current?.scrollBy({ top: delta });
  }

  function handleThumbPointerDown(e: React.PointerEvent) {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = { startY: e.clientY, startScrollTop: viewportRef.current?.scrollTop ?? 0 };
  }

  function handleThumbPointerMove(e: React.PointerEvent) {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!dragState.current || !viewport || !track) return;

    const trackHeight = track.clientHeight;
    const maxThumbTop = trackHeight - thumb.height;
    const maxScrollTop = viewport.scrollHeight - viewport.clientHeight;
    if (maxThumbTop <= 0 || maxScrollTop <= 0) return;

    const deltaY = e.clientY - dragState.current.startY;
    const deltaScroll = (deltaY / maxThumbTop) * maxScrollTop;
    viewport.scrollTop = dragState.current.startScrollTop + deltaScroll;
  }

  function handleThumbPointerUp(e: React.PointerEvent) {
    dragState.current = null;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }

  function handleTrackClick(e: React.MouseEvent) {
    if (e.target !== trackRef.current) return; // ignore clicks on the thumb itself
    const viewport = viewportRef.current;
    if (!viewport) return;
    const rect = trackRef.current!.getBoundingClientRect();
    const clickedBelowThumb = e.clientY - rect.top > thumb.top + thumb.height / 2;
    scrollBy(clickedBelowThumb ? viewport.clientHeight : -viewport.clientHeight);
  }

  return (
    <>
      {/* Sits on the left, per the reference chat window — see .chat-window-body. */}
      <div className="chat-scrollbar">
        <button
          type="button"
          className="chat-scrollbar-btn chat-scrollbar-btn-up"
          aria-label="Scroll up"
          onClick={() => scrollBy(-STEP_PX)}
        />
        <div className="chat-scrollbar-track" ref={trackRef} onClick={handleTrackClick}>
          {thumb.visible && (
            <div
              className="chat-scrollbar-thumb"
              style={{ top: thumb.top, height: thumb.height }}
              onPointerDown={handleThumbPointerDown}
              onPointerMove={handleThumbPointerMove}
              onPointerUp={handleThumbPointerUp}
            >
              <div className="chat-scrollbar-thumb-top" />
              <div className="chat-scrollbar-thumb-middle" />
              <div className="chat-scrollbar-thumb-bottom" />
            </div>
          )}
        </div>
        <button
          type="button"
          className="chat-scrollbar-btn chat-scrollbar-btn-down"
          aria-label="Scroll down"
          onClick={() => scrollBy(STEP_PX)}
        />
      </div>

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
