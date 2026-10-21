import { useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import PixelText from '../PixelText';
import { colors } from '../../theme';

const CURSOR_OFFSET = 14;
/** Rough width reserved for the tooltip when deciding whether it fits right of the cursor. */
const FLIP_MARGIN = 220;

interface HoverTooltip {
  hoverProps: {
    onMouseEnter: (event: MouseEvent) => void;
    onMouseMove: (event: MouseEvent) => void;
    onMouseLeave: () => void;
  };
  tooltip: ReactNode;
}

/**
 * A tooltip that follows the cursor while it's over the element `hoverProps` is spread onto — used
 * for read-only slots, where the native `title` tooltip is slow to appear and unstyled. Renders
 * nothing when `text` is empty, so empty slots can share the same code path. The tooltip is
 * portaled to the body so a panel's overflow or stacking never clips it.
 */
export function useHoverTooltip(text: string | undefined): HoverTooltip {
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  const trackCursor = (event: MouseEvent) => setCursor({ x: event.clientX, y: event.clientY });

  const hoverProps = {
    onMouseEnter: trackCursor,
    onMouseMove: trackCursor,
    onMouseLeave: () => setCursor(null),
  };

  const flipLeft = cursor !== null && cursor.x > window.innerWidth - FLIP_MARGIN;
  const tooltip =
    text && cursor
      ? createPortal(
          <div
            className="hover-tooltip"
            role="tooltip"
            style={{
              top: cursor.y + CURSOR_OFFSET,
              ...(flipLeft ? { right: window.innerWidth - cursor.x + CURSOR_OFFSET } : { left: cursor.x + CURSOR_OFFSET }),
            }}
          >
            <PixelText text={text} fontSize={16} color={colors.text} />
          </div>,
          document.body,
        )
      : null;

  return { hoverProps, tooltip };
}
