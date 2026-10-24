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

function prefixLabel(text: string): string {
  return text.startsWith('[') && text.endsWith(']') ? text.slice(1, -1) : text;
}

const MESSAGE_KIND_CLASS: Partial<Record<ChatMessage['kind'], string>> = {
  fc: 'chat-line-message--fc',
  cc: 'chat-line-message--cc',
  private: 'chat-line-message--private',
};

const COLOR_TAG_KINDS = new Set<ChatMessage['kind']>(['fc', 'cc']);

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
      {}
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
        {}
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

function ChatEmptyState() {
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
      {}
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
