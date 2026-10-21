import type { CSSProperties } from 'react';
import SlotTile from './SlotTile';
import EquipmentSlotFrame from './EquipmentSlotFrame';
import { GRID_HEIGHT, GRID_POSITION, GRID_WIDTH, SLOT_HEIGHT_PCT, SLOT_WIDTH_PCT, colLeft, rowTop } from './gearGridLayout';
import type { EquipmentItem, EquipmentSlot, GearLoadoutSlots } from '../../types/gear';

// Fills the container's width; height follows from the aspect-ratio so the diamond scales with
// whatever panel it's placed in (see gearGridLayout.ts's top-of-file note).
const wrapStyle: CSSProperties = {
  aspectRatio: `${GRID_WIDTH} / ${GRID_HEIGHT}`,
};

interface Props {
  slots: GearLoadoutSlots;
  itemsById: Map<number, EquipmentItem>;
  /** If provided, each slot becomes a clickable button (the interactive picker case); omit for
   *  a purely read-only display. */
  onSlotClick?: (slot: EquipmentSlot, additive: boolean) => void;
  /** Slots that can't be interacted with right now (e.g. shield while a two-handed weapon is
   *  equipped) — shown with the red tile + blocked badge, not clickable. */
  disabledSlots?: ReadonlySet<EquipmentSlot>;
}

/**
 * Renders the 11-slot equipment grid in OSRS's own diamond arrangement, read-only — the shared
 * visual core for both the plain display mode and (via EquipmentSlotGrid) the interactive picker.
 * EquipmentSlotFrame draws the connecting rack/spine behind the tiles.
 *
 * Tile position/size come from gearGridLayout.ts as percentages, not a CSS `gap`, because each
 * row can use its own horizontal gap (see ROW_HORIZONTAL_GAP) — so the grid scales with its
 * container instead.
 */
export default function EquipmentDisplay({ slots, itemsById, onSlotClick, disabledSlots }: Props) {
  return (
    <div className="equipment-diamond-wrap" style={wrapStyle}>
      <EquipmentSlotFrame />
      {(Object.keys(GRID_POSITION) as EquipmentSlot[]).map((slot) => {
        const { row, col } = GRID_POSITION[slot];
        const itemId = slots[slot];
        const item = itemId ? itemsById.get(itemId) : undefined;
        const blocked = disabledSlots?.has(slot) ?? false;
        const tileStyle: CSSProperties = {
          left: `${colLeft(row, col)}%`,
          top: `${rowTop(row)}%`,
          width: `${SLOT_WIDTH_PCT}%`,
          height: `${SLOT_HEIGHT_PCT}%`,
        };
        return (
          <div key={slot} className="equipment-diamond-tile" style={tileStyle}>
            <SlotTile
              slot={slot}
              item={item}
              blocked={blocked}
              onClick={onSlotClick ? (event) => onSlotClick(slot, event.ctrlKey || event.metaKey) : undefined}
            />
          </div>
        );
      })}
    </div>
  );
}
