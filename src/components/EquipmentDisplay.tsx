import SlotTile from './SlotTile';
import EquipmentSlotFrame from './EquipmentSlotFrame';
import { GRID_COLS, GRID_HEIGHT, GRID_POSITION, GRID_ROWS, GRID_WIDTH, SLOT_GAP, SLOT_SIZE } from '../utils/gearGridLayout';
import type { EquipmentItem, EquipmentSlot, GearLoadoutSlots } from '../types/gear';

const wrapStyle = {
  position: 'relative',
  width: GRID_WIDTH,
  height: GRID_HEIGHT,
  margin: '0 auto',
} as const;

const gridStyle = {
  position: 'relative',
  display: 'grid',
  gridTemplateColumns: `repeat(${GRID_COLS}, ${SLOT_SIZE}px)`,
  gridTemplateRows: `repeat(${GRID_ROWS}, ${SLOT_SIZE}px)`,
  gap: SLOT_GAP,
} as const;

interface Props {
  slots: GearLoadoutSlots;
  itemsById: Map<number, EquipmentItem>;
  /** If provided, each slot becomes a clickable button (the interactive picker case); omit for
   *  a purely read-only display. */
  onSlotClick?: (slot: EquipmentSlot) => void;
  /** Slots that can't be interacted with right now (e.g. shield while a two-handed weapon is
   *  equipped) — shown with the red tile + blocked badge, not clickable. */
  disabledSlots?: ReadonlySet<EquipmentSlot>;
}

/**
 * Renders the 11-slot equipment grid in OSRS's own diamond arrangement, read-only. This is the
 * shared visual core used both for the "just show the gear" display mode and (via
 * EquipmentSlotGrid, which adds click handling and the two-handed-weapon shield rule) the
 * interactive picker. EquipmentSlotFrame draws the connecting rack/spine behind the tiles.
 */
export default function EquipmentDisplay({ slots, itemsById, onSlotClick, disabledSlots }: Props) {
  return (
    <div style={wrapStyle}>
      <EquipmentSlotFrame />
      <div style={gridStyle}>
        {(Object.keys(GRID_POSITION) as EquipmentSlot[]).map((slot) => {
          const { row, col } = GRID_POSITION[slot];
          const itemId = slots[slot];
          const item = itemId ? itemsById.get(itemId) : undefined;
          const blocked = disabledSlots?.has(slot) ?? false;
          return (
            <div key={slot} style={{ gridRow: row, gridColumn: col }}>
              <SlotTile
                slot={slot}
                item={item}
                blocked={blocked}
                onClick={onSlotClick ? () => onSlotClick(slot) : undefined}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
