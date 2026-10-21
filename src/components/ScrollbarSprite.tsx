import type { RefObject, MouseEvent, PointerEvent } from 'react';
import type { ScrollbarThumbState } from './useScrollbarThumb';
import './ScrollbarSprite.css';

interface Props {
  trackRef: RefObject<HTMLDivElement | null>;
  thumb: ScrollbarThumbState;
  onScrollUp: () => void;
  onScrollDown: () => void;
  onTrackClick: (e: MouseEvent) => void;
  onThumbPointerDown: (e: PointerEvent) => void;
  onThumbPointerMove: (e: PointerEvent) => void;
  onThumbPointerUp: (e: PointerEvent) => void;
}

export default function ScrollbarSprite({
  trackRef,
  thumb,
  onScrollUp,
  onScrollDown,
  onTrackClick,
  onThumbPointerDown,
  onThumbPointerMove,
  onThumbPointerUp,
}: Props) {
  return (
    <div className="osrs-scrollbar">
      <button type="button" className="osrs-scrollbar-btn osrs-scrollbar-btn-up" aria-label="Scroll up" onClick={onScrollUp} />
      <div className="osrs-scrollbar-track" ref={trackRef} onClick={onTrackClick}>
        {thumb.visible && (
          <div
            className="osrs-scrollbar-thumb"
            style={{ top: thumb.top, height: thumb.height }}
            onPointerDown={onThumbPointerDown}
            onPointerMove={onThumbPointerMove}
            onPointerUp={onThumbPointerUp}
          >
            <div className="osrs-scrollbar-thumb-top" />
            <div className="osrs-scrollbar-thumb-middle" />
            <div className="osrs-scrollbar-thumb-bottom" />
          </div>
        )}
      </div>
      <button type="button" className="osrs-scrollbar-btn osrs-scrollbar-btn-down" aria-label="Scroll down" onClick={onScrollDown} />
    </div>
  );
}
