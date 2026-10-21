import { useEffect, useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';
import { itemIconUrl } from '../chatbox/itemIcons';
import { REMOVE_BUTTON_ICON, SEARCH_ICON } from './gearpickerAssets';
import ScrollbarSprite from '../ScrollbarSprite';
import PixelText from '../PixelText';
import { SCROLLBAR_STEP_PX, useScrollbarThumb } from '../useScrollbarThumb';
import { useVirtualWindow } from '../useVirtualWindow';
import { colors } from '../../theme';
import type { EquipmentItem, EquipmentSlot } from '../../types/gear';

const ITEM_ROW_HEIGHT_PX = 40;
const OVERSCAN_ROWS = 6;

interface Props {
  selectedSlot: EquipmentSlot | null;
  /** Lists items for every slot rather than just `selectedSlot`; selecting one equips it in its own slot. */
  searchAllSlots: boolean;
  items: EquipmentItem[];
  hasCurrentItem: boolean;
  onSelect: (item: EquipmentItem) => void;
  onHoverItem: (item: EquipmentItem | null) => void;
  query: string;
  onQueryChange: (query: string) => void;
  onClear: () => void;
}

/** The parent remounts this (via a `key` on selectedSlot or the all-slots mode) whenever either changes, so
 *  the list scroll resets and the search input is re-focused, with its text selected, for each
 *  newly opened slot. The query itself lives in the parent so it survives that remount. */
export default function ItemPickerPanel({ selectedSlot, searchAllSlots, items, hasCurrentItem, onSelect, onHoverItem, query, onQueryChange, onClear }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const {
    trackRef,
    thumb,
    updateThumb,
    handleViewportScroll: handleThumbScroll,
    scrollBy,
    handleThumbPointerDown,
    handleThumbPointerMove,
    handleThumbPointerUp,
    handleTrackClick,
  } = useScrollbarThumb(viewportRef);

  useEffect(() => {
    searchInputRef.current?.focus();
    searchInputRef.current?.select();
  }, []);

  const q = query.trim().toLowerCase();
  const results = useMemo(() => (q ? items.filter((i) => i.name.toLowerCase().includes(q)) : items), [items, q]);
  const { startIndex, endIndex, handleScroll: handleWindowScroll } = useVirtualWindow(
    viewportRef,
    results.length,
    ITEM_ROW_HEIGHT_PX,
    OVERSCAN_ROWS,
  );

  // The viewport element itself doesn't resize as the filtered list gets longer/shorter, so the
  // thumb needs an explicit nudge whenever the result count changes.
  useEffect(() => updateThumb(), [results.length, updateThumb]);

  function handleQueryChange(nextQuery: string) {
    if (viewportRef.current) viewportRef.current.scrollTop = 0;
    onQueryChange(nextQuery);
  }

  function handleViewportScroll() {
    handleThumbScroll();
    handleWindowScroll();
  }

  // Rows unmount without a mouseleave when the list is filtered or the panel is remounted for
  // another slot, which would otherwise leave a stale preview showing.
  useEffect(() => () => onHoverItem(null), [onHoverItem]);

  if (!selectedSlot && !searchAllSlots) {
    return (
      <p className="item-picker__hint">
        <PixelText text="Click an equipment slot to choose an item for it." fontSize={13.6} color={colors.textFaint} />
      </p>
    );
  }

  return (
    <div className="item-picker">
      <div className="item-picker__list-row">
        <div
          className="item-search__list"
          ref={viewportRef}
          onScroll={handleViewportScroll}
          style={{ '--item-row-height': `${ITEM_ROW_HEIGHT_PX}px` } as CSSProperties}
        >
          {results.length === 0 && (
            <div className="item-search__empty">
              <PixelText text="No items found." fontSize={13.6} color={colors.textFaint} />
            </div>
          )}
          <div className="item-search__spacer" style={{ height: startIndex * ITEM_ROW_HEIGHT_PX }} />
          {results.slice(startIndex, endIndex).map((item) => (
            <button
              key={item.id}
              type="button"
              className="item-search__item"
              onClick={() => onSelect(item)}
              onMouseEnter={() => onHoverItem(item)}
              onMouseLeave={() => onHoverItem(null)}
              onFocus={() => onHoverItem(item)}
              onBlur={() => onHoverItem(null)}
            >
              <img src={itemIconUrl(item.id)} alt="" className="item-search__item-img" />
              <PixelText text={item.name} fontSize={16} color={colors.textMuted} />
            </button>
          ))}
          <div className="item-search__spacer" style={{ height: (results.length - endIndex) * ITEM_ROW_HEIGHT_PX }} />
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
          ref={searchInputRef}
          placeholder="Search item name…"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
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
