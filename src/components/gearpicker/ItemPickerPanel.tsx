import { useState } from 'react';
import { itemIconUrl } from '../chatbox/itemIcons';
import { SEARCH_ICON } from './gearpickerAssets';
import type { EquipmentItem, EquipmentSlot } from '../../types/gear';

interface Props {
  selectedSlot: EquipmentSlot | null;
  items: EquipmentItem[];
  hasCurrentItem: boolean;
  onSelect: (item: EquipmentItem) => void;
  onClear: () => void;
}

/** The parent remounts this (via a `key` on selectedSlot) whenever the selected slot changes, so
 *  the query resets and autoFocus re-fires for each newly opened slot. */
export default function ItemPickerPanel({ selectedSlot, items, hasCurrentItem, onSelect, onClear }: Props) {
  const [query, setQuery] = useState('');

  if (!selectedSlot) {
    return <p className="item-picker__hint">Click an equipment slot to choose an item for it.</p>;
  }

  const q = query.trim().toLowerCase();
  const results = q ? items.filter((i) => i.name.toLowerCase().includes(q)).slice(0, 30) : items.slice(0, 30);

  return (
    <div className="item-picker">
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
    </div>
  );
}
