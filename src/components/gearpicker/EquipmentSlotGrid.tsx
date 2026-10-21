import { useMemo } from 'react';
import EquipmentDisplay from './EquipmentDisplay';
import type { EquipmentItem, EquipmentSlot, GearLoadoutSlots } from '../../types/gear';

interface Props {
  slots: GearLoadoutSlots;
  itemsById: Map<number, EquipmentItem>;
  onSlotClick: (slot: EquipmentSlot, additive: boolean) => void;
}

/** A two-handed weapon and a shield can never actually be worn together in-game, so the shield
 *  slot is disabled while one is equipped — needed for the bonus totals to stay trustworthy. */
export default function EquipmentSlotGrid({ slots, itemsById, onSlotClick }: Props) {
  const equippedWeapon = slots.weapon ? itemsById.get(slots.weapon) : undefined;
  const disabledSlots = useMemo(() => {
    const disabled = new Set<EquipmentSlot>();
    if (equippedWeapon?.isTwoHanded) disabled.add('shield');
    return disabled;
  }, [equippedWeapon]);

  return (
    <EquipmentDisplay
      slots={slots}
      itemsById={itemsById}
      onSlotClick={onSlotClick}
      disabledSlots={disabledSlots}
    />
  );
}
