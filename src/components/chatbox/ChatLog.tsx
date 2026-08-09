import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChatMessage } from '../../types/chatbox';
import { formatClockTime } from '../../utils/formatTime';
import { IRONMAN_STATUS_ICONS, MOD_STATUS_ICONS } from './chatIcons';
import chatEmptyTips from '../../data/chatEmptyTips';

const MIN_THUMB_HEIGHT = 12;
const STEP_PX = 24;
const EMPTY_TIP_COUNT = 3;

function ChatLine({ msg }: { msg: ChatMessage }) {
  return (
    <div className="chat-line">
      <span className="chat-line-time">[{formatClockTime(new Date(msg.timestamp))}]</span>{' '}
      {msg.icon && <img className="chat-icon" src={msg.icon} alt="" />}
      {msg.modStatus && (
        <img className="chat-icon" src={MOD_STATUS_ICONS[msg.modStatus]} alt={msg.modStatus} />
      )}
      {msg.ironmanStatus && (
        <img className="chat-icon" src={IRONMAN_STATUS_ICONS[msg.ironmanStatus]} alt={msg.ironmanStatus} />
      )}
      {msg.rankIcon && <img className="chat-icon chat-icon-rank" src={msg.rankIcon} alt="rank" />}
      {msg.prefix && (
        <span className="chat-line-prefix" style={{ color: msg.prefix.color }}>
          {msg.prefix.text}{' '}
        </span>
      )}
      {msg.username && <span className="chat-line-username">{msg.username}:</span>}{msg.username && ' '}
      {msg.segments ? (
        msg.segments.map((seg, i) => (
          <span key={i} className="chat-line-message" style={seg.color ? { color: seg.color } : undefined}>
            {seg.text}
          </span>
        ))
      ) : (
        <span className="chat-line-message">{msg.message}</span>
      )}
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
          <span className="chat-line-message">{tip}</span>
        </div>
      ))}
    </div>
  );
}

/** The chat log's message list plus a custom scrollbar built from the `chatbox/scroll` sprites
 *  (native `overflow` scrollbars are hidden — see `.chat-log-viewport` in Chatbox.css). */
export default function ChatLog({ messages }: { messages: ChatMessage[] }) {
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
              <ChatLine key={msg.id} msg={msg} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
