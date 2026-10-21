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

export interface EquipmentItem {
  id: number;
  name: string;
  slot: EquipmentSlot;
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
    magicDamage: number;
  };
}

export interface EquipmentDataResponse {
  items: EquipmentItem[];
  sourceVersion: string;
}

export interface ListedItem {
  id: number;
  name: string;
}

export interface ItemListResponse {
  items: ListedItem[];
  sourceVersion: string;
}

export const INVENTORY_COLUMNS = 4;
export const INVENTORY_ROWS = 7;
export const INVENTORY_SLOT_COUNT = INVENTORY_COLUMNS * INVENTORY_ROWS;

export type GearInventory = (number | null)[];

export function emptyInventory(): GearInventory {
  return Array.from({ length: INVENTORY_SLOT_COUNT }, () => null);
}

export type GearLoadoutSlots = Partial<Record<EquipmentSlot, number>>;

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

export const SPLASH_SAFE_MAGIC_ATTACK_THRESHOLD = -64;
