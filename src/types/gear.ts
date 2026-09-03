/** The 11 standard OSRS equipment slots. */
export type EquipmentSlot =
  | 'head'
  | 'cape'
  | 'neck'
  | 'weapon'
  | 'body'
  | 'shield'
  | 'legs'
  | 'hands'
  | 'feet'
  | 'ring'
  | 'ammo';

/** One equipable item from the synced dataset (GET /equipment, see the backend's
 *  scripts/sync-equipment-data.ts). */
export interface EquipmentItem {
  id: number;
  name: string;
  slot: EquipmentSlot;
  /** True for a two-handed weapon — occupies the weapon slot but also blocks the shield slot. */
  isTwoHanded: boolean;
  bonuses: {
    stabAttack: number;
    slashAttack: number;
    crushAttack: number;
    rangeAttack: number;
    magicAttack: number;
    stabDefence: number;
    slashDefence: number;
    crushDefence: number;
    rangeDefence: number;
    magicDefence: number;
    strength: number;
    rangedStrength: number;
    prayer: number;
    /** Percent, e.g. 5 = +5% magic damage. */
    magicDamage: number;
  };
}

export interface EquipmentDataResponse {
  items: EquipmentItem[];
  sourceVersion: string;
}

/** Item id per equipment slot, all optional (an empty slot is simply absent). */
export type GearLoadoutSlots = Partial<Record<EquipmentSlot, number>>;

/** Display order for rendering the 11-slot grid. Layout/icons for this grid are placeholder
 *  pending OSRS-styled assets and instructions to be provided separately. */
export const EQUIPMENT_SLOT_ORDER: EquipmentSlot[] = [
  'head', 'cape', 'neck', 'weapon', 'body', 'shield', 'legs', 'hands', 'feet', 'ring', 'ammo',
];

export const EQUIPMENT_SLOT_LABELS: Record<EquipmentSlot, string> = {
  head: 'Head',
  cape: 'Cape',
  neck: 'Neck',
  weapon: 'Weapon',
  body: 'Body',
  shield: 'Shield',
  legs: 'Legs',
  hands: 'Hands',
  feet: 'Feet',
  ring: 'Ring',
  ammo: 'Ammo',
};

/** A saved or shared gear loadout (splash-helper-backend's GearLoadout model). A loadout with no
 *  `userId` was created anonymously via the share endpoint. */
export interface GearLoadout {
  _id: string;
  slug: string;
  userId?: string;
  username?: string;
  name?: string;
  slots: GearLoadoutSlots;
  createdAt: string;
  updatedAt: string;
}

/** The splash-safety rule already enforced in-game by the RuneLite plugin
 *  (SplashHelperPlugin.hasBadMagicAttackBonus()) and stated in PickpocketGuide.tsx's tooltip:
 *  summed equipment Magic Attack bonus must be this value or lower. Keep in sync with both if
 *  it ever changes. */
export const SPLASH_SAFE_MAGIC_ATTACK_THRESHOLD = -64;
