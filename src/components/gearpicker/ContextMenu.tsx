import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PixelText from '../PixelText';
import { colors } from '../../theme';

export interface ContextMenuOption {
  label: string;
  onSelect: () => void;
  disabled?: boolean;
}

interface Props {

  x: number;
  y: number;
  options: ContextMenuOption[];
  onClose: () => void;
}

export default function ContextMenu({ x, y, options, onClose }: Props) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: x, top: y });

  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    const { width, height } = menu.getBoundingClientRect();
    setPosition({
      left: Math.max(0, Math.min(x, window.innerWidth - width)),
      top: Math.max(0, Math.min(y, window.innerHeight - height)),
    });
  }, [x, y]);

  useEffect(() => {
    function closeOnOutsidePress(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) onClose();
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', closeOnOutsidePress);
    document.addEventListener('keydown', closeOnEscape);
    window.addEventListener('resize', onClose);
    window.addEventListener('scroll', onClose, true);
    window.addEventListener('blur', onClose);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsidePress);
      document.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('resize', onClose);
      window.removeEventListener('scroll', onClose, true);
      window.removeEventListener('blur', onClose);
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={menuRef}
      className="context-menu"
      role="menu"
      style={position}
      onContextMenu={(event) => event.preventDefault()}
    >
      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          role="menuitem"
          className="context-menu__option"
          disabled={option.disabled}
          onClick={() => {
            onClose();
            option.onSelect();
          }}
        >
          <PixelText
            text={option.label}
            fontSize={16}
            color={option.disabled ? colors.textDisabled : colors.textMuted}
          />
        </button>
      ))}
    </div>,
    document.body,
  );
}
