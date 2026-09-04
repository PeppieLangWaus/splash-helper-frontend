import SlotTile from './SlotTile';
import type { EquipmentItem, EquipmentSlot, GearLoadoutSlots } from '../types/gear';

const SLOT_SIZE = 36;
const GAP = 3;

/** Row/column position of each slot in the classic 3-wide OSRS equipment-tab diamond layout:
 *    .    head  .
 *    cape neck  ammo
 *    weapon body shield
 *    .    legs  .
 *    hands feet ring
 */
const GRID_POSITION: Record<EquipmentSlot, { row: number; col: number }> = {
  head: { row: 1, col: 2 },
  cape: { row: 2, col: 1 },
  neck: { row: 2, col: 2 },
  ammo: { row: 2, col: 3 },
  weapon: { row: 3, col: 1 },
  body: { row: 3, col: 2 },
  shield: { row: 3, col: 3 },
  legs: { row: 4, col: 2 },
  hands: { row: 5, col: 1 },
  feet: { row: 5, col: 2 },
  ring: { row: 5, col: 3 },
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: `repeat(3, ${SLOT_SIZE}px)`,
  gridTemplateRows: `repeat(5, ${SLOT_SIZE}px)`,
  gap: GAP,
  justifyContent: 'center',
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
 * interactive picker.
 */
export default function EquipmentDisplay({ slots, itemsById, onSlotClick, disabledSlots }: Props) {
  return (
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
  );
}
