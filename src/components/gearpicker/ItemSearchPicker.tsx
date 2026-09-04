import { useState } from 'react';
import Modal from '../Modal';
import { itemIconUrl } from '../chatbox/itemIcons';
import { SEARCH_ICON } from './gearpickerAssets';
import type { EquipmentItem, EquipmentSlot } from '../../types/gear';
import { EQUIPMENT_SLOT_LABELS } from '../../types/gear';

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
      <div className="item-search__input-wrap">
        <img src={SEARCH_ICON} alt="" className="item-search__input-icon" />
        <input
          className="item-search__input"
          type="text"
          autoFocus
          placeholder="Search item name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="item-search__list">
        {results.length === 0 && <div className="item-search__empty">No items found.</div>}
        {results.map((item) => (
          <button key={item.id} type="button" className="item-search__item" onClick={() => onSelect(item)}>
            <img src={itemIconUrl(item.id)} alt="" className="item-search__item-img" />
            <span>{item.name}</span>
          </button>
        ))}
      </div>
      {hasCurrentItem && (
        <button type="button" className="item-search__clear-btn" onClick={onClear}>
          Remove from slot
        </button>
      )}
    </Modal>
  );
}
