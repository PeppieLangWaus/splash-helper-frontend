import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, MouseEvent as ReactMouseEvent, RefObject } from 'react';

export const SCROLLBAR_MIN_THUMB_HEIGHT = 12;
export const SCROLLBAR_STEP_PX = 24;

export interface ScrollbarThumbState {
  top: number;
  height: number;
  visible: boolean;
}

/** Drives a custom OSRS-sprite scrollbar (see ScrollbarSprite.tsx) for an arbitrary scrollable
 *  `viewportRef`. A caller whose content can resize without the viewport element itself resizing
 *  (e.g. a filtered list) should call the returned `updateThumb` from its own effect. */
export function useScrollbarThumb(viewportRef: RefObject<HTMLDivElement | null>) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<ScrollbarThumbState>({ top: 0, height: SCROLLBAR_MIN_THUMB_HEIGHT, visible: false });
  const dragState = useRef<{ startY: number; startScrollTop: number } | null>(null);

  const updateThumb = useCallback(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const { scrollHeight, clientHeight, scrollTop } = viewport;
    const trackHeight = track.clientHeight;

    if (scrollHeight <= clientHeight + 1) {
      // Nothing to scroll — fill the whole track with the thumb instead of hiding it.
      setThumb({ top: 0, height: trackHeight, visible: true });
      return;
    }

    const height = Math.max(SCROLLBAR_MIN_THUMB_HEIGHT, (clientHeight / scrollHeight) * trackHeight);
    const maxScrollTop = scrollHeight - clientHeight;
    const maxThumbTop = trackHeight - height;
    const top = maxScrollTop > 0 ? (scrollTop / maxScrollTop) * maxThumbTop : 0;

    setThumb({ top, height, visible: true });
  }, [viewportRef]);

  useEffect(() => {
    updateThumb();
    window.addEventListener('resize', updateThumb);
    return () => window.removeEventListener('resize', updateThumb);
  }, [updateThumb]);

  function handleViewportScroll() {
    updateThumb();
  }

  function scrollBy(delta: number) {
    viewportRef.current?.scrollBy({ top: delta });
  }

  function handleThumbPointerDown(e: ReactPointerEvent) {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = { startY: e.clientY, startScrollTop: viewportRef.current?.scrollTop ?? 0 };
  }

  function handleThumbPointerMove(e: ReactPointerEvent) {
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

  function handleThumbPointerUp(e: ReactPointerEvent) {
    dragState.current = null;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }

  function handleTrackClick(e: ReactMouseEvent) {
    if (e.target !== trackRef.current) return; // ignore clicks on the thumb itself
    const viewport = viewportRef.current;
    if (!viewport) return;
    const rect = trackRef.current!.getBoundingClientRect();
    const clickedBelowThumb = e.clientY - rect.top > thumb.top + thumb.height / 2;
    scrollBy(clickedBelowThumb ? viewport.clientHeight : -viewport.clientHeight);
  }

  return {
    trackRef,
    thumb,
    updateThumb,
    handleViewportScroll,
    scrollBy,
    handleThumbPointerDown,
    handleThumbPointerMove,
    handleThumbPointerUp,
    handleTrackClick,
  };
}
