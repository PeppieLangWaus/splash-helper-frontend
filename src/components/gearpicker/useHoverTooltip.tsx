import { useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import PixelText from '../PixelText';
import { colors } from '../../theme';

const CURSOR_OFFSET = 14;

const FLIP_MARGIN = 220;

interface HoverTooltip {
  hoverProps: {
    onMouseEnter: (event: MouseEvent) => void;
    onMouseMove: (event: MouseEvent) => void;
    onMouseLeave: () => void;
  };
  tooltip: ReactNode;
}

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
