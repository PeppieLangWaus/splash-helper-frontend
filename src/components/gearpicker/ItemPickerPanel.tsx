import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import { itemIconUrl } from '../chatbox/utils/itemIcons';
import { REMOVE_BUTTON_ICON, SEARCH_ICON } from './gearpickerAssets';
import ScrollbarSprite from '../ScrollbarSprite';
import PixelText from '../PixelText';
import { SCROLLBAR_STEP_PX, useScrollbarThumb } from '../useScrollbarThumb';
import { useVirtualWindow } from '../useVirtualWindow';
import { colors } from '../../theme';

const ITEM_ROW_HEIGHT_PX = 40;
const OVERSCAN_ROWS = 6;

export interface PickerItem {
  id: number;
  name: string;
}

interface Props<T extends PickerItem> {
  /** False until the user has chosen something to pick an item for; `hintText` is shown instead of the list. */
  hasTarget: boolean;
  hintText: string;
  removeLabel: string;
  items: T[];
  /** When set, items found in it get 1 to 3 green "+" (positive level) or red "-" (negative level) signs after their name. */
  statChangeLevelById?: Map<number, number>;
  hasCurrentItem: boolean;
  onSelect: (item: T) => void;
  onHoverItem: (item: T | null) => void;
  query: string;
  onQueryChange: (query: string) => void;
  onClear: () => void;
}

/** The parent remounts this (via a `key` on whatever it is picking for) whenever that changes, so
 *  the list scroll resets and the search input is re-focused, with its text selected, for each
 *  newly opened slot. The query itself lives in the parent so it survives that remount. */
export default function ItemPickerPanel<T extends PickerItem>({ hasTarget, hintText, removeLabel, items, statChangeLevelById, hasCurrentItem, onSelect, onHoverItem, query, onQueryChange, onClear }: Props<T>) {
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

  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const activeIndex = Math.min(highlightedIndex, results.length - 1);

  // Previews the highlighted item, including the one highlighted by default when the list first appears.
  useEffect(() => onHoverItem(results[activeIndex] ?? null), [results, activeIndex, onHoverItem]);

  function handleQueryChange(nextQuery: string) {
    if (viewportRef.current) viewportRef.current.scrollTop = 0;
    setHighlightedIndex(0);
    onQueryChange(nextQuery);
  }

  function scrollRowIntoView(index: number) {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const rowTop = index * ITEM_ROW_HEIGHT_PX;
    const rowBottom = rowTop + ITEM_ROW_HEIGHT_PX;
    if (rowTop < viewport.scrollTop) viewport.scrollTop = rowTop;
    else if (rowBottom > viewport.scrollTop + viewport.clientHeight) viewport.scrollTop = rowBottom - viewport.clientHeight;
  }

  function moveHighlight(step: 1 | -1) {
    if (results.length === 0) return;
    const nextIndex = Math.max(0, Math.min(results.length - 1, activeIndex + step));
    setHighlightedIndex(nextIndex);
    scrollRowIntoView(nextIndex);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      moveHighlight(event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Enter' && event.target === searchInputRef.current && results[activeIndex]) {
      event.preventDefault();
      onSelect(results[activeIndex]);
    }
  }

  function handleViewportScroll() {
    handleThumbScroll();
    handleWindowScroll();
  }

  // Rows unmount without a mouseleave when the list is filtered or the panel is remounted for
  // another slot, which would otherwise leave a stale preview showing.
  useEffect(() => () => onHoverItem(null), [onHoverItem]);

  if (!hasTarget) {
    return (
      <p className="item-picker__hint">
        <PixelText text={hintText} fontSize={13.6} color={colors.textFaint} />
      </p>
    );
  }

  return (
    <div className="item-picker" onKeyDown={handleKeyDown}>
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
          {results.slice(startIndex, endIndex).map((item, offset) => {
            const index = startIndex + offset;
            const statChangeLevel = statChangeLevelById?.get(item.id) ?? 0;
            return (
              <button
                key={item.id}
                type="button"
                className={'item-search__item' + (index === activeIndex ? ' item-search__item--highlighted' : '')}
                onClick={() => onSelect(item)}
                onMouseEnter={() => {
                  setHighlightedIndex(index);
                  onHoverItem(item);
                }}
                onMouseLeave={() => onHoverItem(null)}
                onFocus={() => onHoverItem(item)}
                onBlur={() => onHoverItem(null)}
              >
                <img src={itemIconUrl(item.id)} alt="" className="item-search__item-img" />
                <PixelText text={item.name} fontSize={16} color={colors.textMuted} />
                {statChangeLevel !== 0 && (
                  <PixelText
                    text={(statChangeLevel > 0 ? '+' : '-').repeat(Math.abs(statChangeLevel))}
                    fontSize={16}
                    color={statChangeLevel > 0 ? colors.successText : colors.dangerText}
                  />
                )}
              </button>
            );
          })}
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
          title={removeLabel}
          aria-label={removeLabel}
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
