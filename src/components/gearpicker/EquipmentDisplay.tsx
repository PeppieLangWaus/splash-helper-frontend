import type { CSSProperties } from 'react';
import SlotTile from './SlotTile';
import EquipmentSlotFrame from './EquipmentSlotFrame';
import { GRID_HEIGHT, GRID_POSITION, GRID_WIDTH, SLOT_HEIGHT_PCT, SLOT_WIDTH_PCT, colLeft, rowTop } from './gearGridLayout';
import type { EquipmentItem, EquipmentSlot, GearLoadoutSlots } from '../../types/gear';

const wrapStyle: CSSProperties = {
  aspectRatio: `${GRID_WIDTH} / ${GRID_HEIGHT}`,
};

interface Props {
  slots: GearLoadoutSlots;
  itemsById: Map<number, EquipmentItem>;

  onSlotClick?: (slot: EquipmentSlot, additive: boolean) => void;

  disabledSlots?: ReadonlySet<EquipmentSlot>;
}

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
