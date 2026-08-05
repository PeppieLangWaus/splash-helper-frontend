import { useEffect, type ReactNode } from 'react';
import { colors, fontSerif } from '../theme';

const s = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    padding: '1rem',
  },
  panel: {
    background: colors.panel,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    padding: '1.5rem',
    minWidth: 320,
    maxWidth: '90vw',
    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
  },
  title: { fontFamily: fontSerif, fontSize: '1.1rem', fontWeight: 700, color: colors.text, marginBottom: '0.9rem' },
} as const;

interface Props {
  title?: string;
  onClose: () => void;
  children: ReactNode;
}

/** A simple centered overlay dialog. Closes on backdrop click or Escape. */
export default function Modal({ title, onClose, children }: Props) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.panel} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        {title && <div style={s.title}>{title}</div>}
        {children}
      </div>
    </div>
  );
}
