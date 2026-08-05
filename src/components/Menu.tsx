import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { colors, fontSerif } from '../theme';

export interface MenuItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  /** Tooltip shown on hover — handy for explaining why a disabled item is disabled. */
  title?: string;
}

const listBox: CSSProperties = {
  background: colors.panel,
  border: `1px solid ${colors.border}`,
  borderRadius: 6,
  boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
  minWidth: 170,
  zIndex: 50,
  overflow: 'hidden',
  padding: '0.25rem 0',
};

function itemStyle(danger?: boolean, disabled?: boolean): CSSProperties {
  return {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    background: 'none',
    border: 'none',
    padding: '0.5rem 0.85rem',
    fontSize: '0.85rem',
    fontFamily: fontSerif,
    color: disabled ? colors.textDisabled : danger ? colors.dangerText : colors.textMuted,
    cursor: disabled ? 'not-allowed' : 'pointer',
  };
}

/** The rendered list of items — shared by the button-anchored `Menu` and the
 *  cursor-anchored context menu (`useContextMenu`). Positioning is left to the caller. */
export function MenuList({
  items,
  onRequestClose,
  style,
}: {
  items: MenuItem[];
  onRequestClose: () => void;
  style?: CSSProperties;
}) {
  return (
    <div style={{ ...listBox, ...style }} role="menu">
      {items.map((item, i) => (
        <button
          key={i}
          type="button"
          role="menuitem"
          style={itemStyle(item.danger, item.disabled)}
          disabled={item.disabled}
          title={item.title}
          onClick={(e) => {
            e.stopPropagation();
            if (item.disabled) return;
            item.onClick();
            onRequestClose();
          }}
          onMouseEnter={(e) => {
            if (!item.disabled) e.currentTarget.style.background = colors.panelHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

const s = {
  wrap: { position: 'relative' as const, display: 'inline-block' },
  trigger: {
    background: 'none',
    border: `1px solid ${colors.borderStrong}`,
    borderRadius: 6,
    color: colors.textMuted,
    cursor: 'pointer',
    fontSize: '1rem',
    lineHeight: 1,
    padding: '0.3rem 0.55rem',
  },
} as const;

/** A small kebab-button that opens a floating dropdown of actions. Closes on outside
 *  click or Escape. */
export default function Menu({ items, label = '⋮' }: { items: MenuItem[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div style={s.wrap} ref={ref}>
      <button
        type="button"
        style={s.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {label}
      </button>
      {open && (
        <MenuList
          items={items}
          onRequestClose={() => setOpen(false)}
          style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.25rem' }}
        />
      )}
    </div>
  );
}
