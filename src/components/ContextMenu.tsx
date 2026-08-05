import { useCallback, useEffect, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { MenuList, type MenuItem } from './Menu';

interface ContextMenuState {
  x: number;
  y: number;
  items: MenuItem[];
}

/** Tracks a cursor-anchored menu opened via right-click. Spread `menu` into your JSX where
 *  the menu should render (it's positioned `fixed`, so anywhere in the tree works), and call
 *  `open(e, items)` from an `onContextMenu` handler. */
export function useContextMenu() {
  const [state, setState] = useState<ContextMenuState | null>(null);

  const open = useCallback((e: ReactMouseEvent, items: MenuItem[]) => {
    e.preventDefault();
    setState({ x: e.clientX, y: e.clientY, items });
  }, []);

  const close = useCallback(() => setState(null), []);

  useEffect(() => {
    if (!state) return;
    function handleDismiss() {
      setState(null);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setState(null);
    }
    document.addEventListener('mousedown', handleDismiss);
    document.addEventListener('keydown', handleKey);
    document.addEventListener('scroll', handleDismiss, true);
    return () => {
      document.removeEventListener('mousedown', handleDismiss);
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('scroll', handleDismiss, true);
    };
  }, [state]);

  const menu = state ? (
    <div style={{ position: 'fixed', top: state.y, left: state.x, zIndex: 1000 }}>
      <MenuList items={state.items} onRequestClose={close} />
    </div>
  ) : null;

  return { open, close, menu };
}
