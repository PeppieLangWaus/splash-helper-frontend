import { useState } from 'react';
import Modal from './Modal';
import { itemIconUrl } from './chatbox/itemIcons';
import { colors } from '../theme';
import type { EquipmentItem, EquipmentSlot } from '../types/gear';
import { EQUIPMENT_SLOT_LABELS } from '../types/gear';

const s = {
  input: {
    width: '100%',
    boxSizing: 'border-box' as const,
    padding: '0.5rem 0.7rem',
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: 6,
    fontSize: '0.85rem',
    outline: 'none',
    background: colors.inputBg,
    color: colors.text,
    marginBottom: '0.6rem',
  },
  list: { maxHeight: '18rem', overflowY: 'auto' as const, display: 'flex', flexDirection: 'column' as const, gap: '0.15rem' },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.4rem 0.5rem',
    background: 'none',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left' as const,
    color: colors.text,
    font: 'inherit',
  },
  itemImg: { width: 24, height: 24, objectFit: 'contain' as const, imageRendering: 'pixelated' as const },
  empty: { color: colors.textFaint, fontSize: '0.85rem', padding: '0.5rem 0' },
  clearBtn: {
    marginTop: '0.6rem',
    padding: '0.4rem 0.8rem',
    background: colors.dangerSoft,
    border: `1px solid ${colors.danger}`,
    borderRadius: 6,
    color: colors.dangerText,
    cursor: 'pointer',
    fontSize: '0.82rem',
    fontWeight: 600,
  },
} as const;

interface Props {
  slot: EquipmentSlot;
  items: EquipmentItem[];
  hasCurrentItem: boolean;
  onSelect: (item: EquipmentItem) => void;
  onClear: () => void;
  onClose: () => void;
}

/** A search-and-select popover for one equipment slot, adapted from AdminView's
 *  UsernameAutocomplete: a text input that client-side filters an already-fetched list, shown
 *  as a floating suggestion list — here rendered inside Modal instead of inline, since it's
 *  triggered by clicking a slot rather than typing into a persistent field. */
export default function ItemSearchPicker({ slot, items, hasCurrentItem, onSelect, onClear, onClose }: Props) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const results = q ? items.filter((i) => i.name.toLowerCase().includes(q)).slice(0, 30) : items.slice(0, 30);

  return (
    <Modal title={`Choose ${EQUIPMENT_SLOT_LABELS[slot]}`} onClose={onClose}>
      <input
        style={s.input}
        type="text"
        autoFocus
        placeholder="Search item name…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div style={s.list}>
        {results.length === 0 && <div style={s.empty}>No items found.</div>}
        {results.map((item) => (
          <button
            key={item.id}
            type="button"
            style={s.item}
            onClick={() => onSelect(item)}
            onMouseEnter={(e) => { e.currentTarget.style.background = colors.panelHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
          >
            <img src={itemIconUrl(item.id)} alt="" style={s.itemImg} />
            <span>{item.name}</span>
          </button>
        ))}
      </div>
      {hasCurrentItem && (
        <button type="button" style={s.clearBtn} onClick={onClear}>
          Remove from slot
        </button>
      )}
    </Modal>
  );
}
