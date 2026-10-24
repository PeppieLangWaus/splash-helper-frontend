import { useCallback, useEffect, useState } from 'react';
import type { RefObject } from 'react';

const FALLBACK_VIEWPORT_HEIGHT_PX = 400;

export interface VirtualWindow {
  startIndex: number;
  endIndex: number;
  handleScroll: () => void;
}

export function useVirtualWindow(
  viewportRef: RefObject<HTMLDivElement | null>,
  itemCount: number,
  rowHeight: number,
  overscanRows: number,
): VirtualWindow {
  const [firstVisibleIndex, setFirstVisibleIndex] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(FALLBACK_VIEWPORT_HEIGHT_PX);

  const handleScroll = useCallback(() => {
    const viewport = viewportRef.current;
    if (viewport) setFirstVisibleIndex(Math.floor(viewport.scrollTop / rowHeight));
  }, [viewportRef, rowHeight]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(() => setViewportHeight(viewport.clientHeight));
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [viewportRef]);

  useEffect(handleScroll, [itemCount, handleScroll]);

  const visibleRowCount = Math.ceil(viewportHeight / rowHeight) + 1;
  const startIndex = Math.max(0, Math.min(firstVisibleIndex, itemCount) - overscanRows);
  const endIndex = Math.min(itemCount, firstVisibleIndex + visibleRowCount + overscanRows);

  return { startIndex, endIndex, handleScroll };
}
