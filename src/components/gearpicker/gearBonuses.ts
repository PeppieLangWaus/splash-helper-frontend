import type { EquipmentItem, GearLoadoutSlots } from '../../types/gear';

export type TotalBonuses = EquipmentItem['bonuses'];

const ZERO_BONUSES: TotalBonuses = {
  stabAttack: 0,
  slashAttack: 0,
  crushAttack: 0,
  rangeAttack: 0,
  magicAttack: 0,
  stabDefence: 0,
  slashDefence: 0,
  crushDefence: 0,
  rangeDefence: 0,
  magicDefence: 0,
  strength: 0,
  rangedStrength: 0,
  prayer: 0,
  magicDamage: 0,
};

/** Sums combat bonuses across every filled slot in a loadout. */
export function computeTotalBonuses(slots: GearLoadoutSlots, itemsById: Map<number, EquipmentItem>): TotalBonuses {
  const total = { ...ZERO_BONUSES };
  for (const itemId of Object.values(slots)) {
    if (itemId === undefined) continue;
    const item = itemsById.get(itemId);
    if (!item) continue;
    for (const key of Object.keys(total) as (keyof TotalBonuses)[]) {
      total[key] += item.bonuses[key];
    }
  }
  return total;
}
