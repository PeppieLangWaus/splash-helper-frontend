import { useEffect, useRef, useState } from 'react';
import { itemIconUrl } from '../chatbox/itemIcons';
import { REMOVE_BUTTON_ICON, SEARCH_ICON } from './gearpickerAssets';
import ScrollbarSprite from '../ScrollbarSprite';
import PixelText from '../PixelText';
import { SCROLLBAR_STEP_PX, useScrollbarThumb } from '../useScrollbarThumb';
import { colors } from '../../theme';
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
  const viewportRef = useRef<HTMLDivElement>(null);
  const {
    trackRef,
    thumb,
    updateThumb,
    handleViewportScroll,
    scrollBy,
    handleThumbPointerDown,
    handleThumbPointerMove,
    handleThumbPointerUp,
    handleTrackClick,
  } = useScrollbarThumb(viewportRef);

  const q = query.trim().toLowerCase();
  const results = q ? items.filter((i) => i.name.toLowerCase().includes(q)).slice(0, 30) : items.slice(0, 30);

  // The viewport element itself doesn't resize as the filtered list gets longer/shorter, so the
  // thumb needs an explicit nudge whenever the result count changes.
  useEffect(() => updateThumb(), [results.length, updateThumb]);


  if (!selectedSlot) {
    return (
      <p className="item-picker__hint">
        <PixelText text="Click an equipment slot to choose an item for it." fontSize={13.6} color={colors.textFaint} />
      </p>
    );
  }

  return (
    <div className="item-picker">
      <div className="item-picker__list-row">
        <div className="item-search__list" ref={viewportRef} onScroll={handleViewportScroll}>
          {results.length === 0 && (
            <div className="item-search__empty">
              <PixelText text="No items found." fontSize={13.6} color={colors.textFaint} />
            </div>
          )}
          {results.map((item) => (
            <button key={item.id} type="button" className="item-search__item" onClick={() => onSelect(item)}>
              <img src={itemIconUrl(item.id)} alt="" className="item-search__item-img" />
              <PixelText text={item.name} fontSize={16} color={colors.textMuted} />
            </button>
          ))}
        </div>
        <ScrollbarSprite
          trackRef={trackRef}
          thumb={thumb}
          onScrollUp={() => scrollBy(-SCROLLBAR_STEP_PX)}
          onScrollDown={() => scrollBy(SCROLLBAR_STEP_PX)}
          onTrackClick={handleTrackClick}
          onThumbPointerDown={handleThumbPointerDown}
          onThumbPointerMove={handleThumbPointerMove}
          onThumbPointerUp={handleThumbPointerUp}
        />
      </div>

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
        <button
          type="button"
          className="item-search__remove-btn"
          title="Remove equipped item"
          aria-label="Remove equipped item"
          disabled={!hasCurrentItem}
          onClick={onClear}
        >
          <img src={REMOVE_BUTTON_ICON.normal} alt="" className="item-search__remove-img item-search__remove-img--normal" />
          <img src={REMOVE_BUTTON_ICON.pressed} alt="" className="item-search__remove-img item-search__remove-img--pressed" />
        </button>
      </div>
    </div>
  );
}
