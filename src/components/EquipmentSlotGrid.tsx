import { useMemo, useState } from 'react';
import EquipmentDisplay from './EquipmentDisplay';
import ItemSearchPicker from './ItemSearchPicker';
import type { EquipmentItem, EquipmentSlot, GearLoadoutSlots } from '../types/gear';

interface Props {
  slots: GearLoadoutSlots;
  itemsById: Map<number, EquipmentItem>;
  itemsBySlot: Map<EquipmentSlot, EquipmentItem[]>;
  onChange: (slots: GearLoadoutSlots) => void;
}

/**
 * The interactive wrapper around EquipmentDisplay: makes each slot clickable to open
 * ItemSearchPicker for it. Also enforces the real OSRS rule that equipping a two-handed weapon
 * blocks the shield slot — needed for the bonus totals to be trustworthy, since a two-handed
 * weapon and a shield can never actually be worn together in-game.
 */
export default function EquipmentSlotGrid({ slots, itemsById, itemsBySlot, onChange }: Props) {
  const [openSlot, setOpenSlot] = useState<EquipmentSlot | null>(null);

  const equippedWeapon = slots.weapon ? itemsById.get(slots.weapon) : undefined;
  const disabledSlots = useMemo(() => {
    const disabled = new Set<EquipmentSlot>();
    if (equippedWeapon?.isTwoHanded) disabled.add('shield');
    return disabled;
  }, [equippedWeapon]);

  function handleSelect(item: EquipmentItem) {
    if (!openSlot) return;
    const next: GearLoadoutSlots = { ...slots, [openSlot]: item.id };
    // Equipping a two-handed weapon can't coexist with a shield — clear it rather than leaving
    // an impossible combination in state.
    if (openSlot === 'weapon' && item.isTwoHanded) delete next.shield;
    onChange(next);
    setOpenSlot(null);
  }

  function handleClear() {
    if (!openSlot) return;
    const next: GearLoadoutSlots = { ...slots };
    delete next[openSlot];
    onChange(next);
    setOpenSlot(null);
  }

  return (
    <>
      <EquipmentDisplay
        slots={slots}
        itemsById={itemsById}
        onSlotClick={setOpenSlot}
        disabledSlots={disabledSlots}
      />
      {openSlot && (
        <ItemSearchPicker
          slot={openSlot}
          items={itemsBySlot.get(openSlot) ?? []}
          hasCurrentItem={slots[openSlot] !== undefined}
          onSelect={handleSelect}
          onClear={handleClear}
          onClose={() => setOpenSlot(null)}
        />
      )}
    </>
  );
}
