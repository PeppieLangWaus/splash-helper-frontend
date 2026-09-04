import type { EquipmentSlot } from '../types/gear';

/** Shared pixel geometry for the equipment diamond grid — used by both EquipmentDisplay.tsx (the
 *  slot tiles themselves) and EquipmentSlotFrame.tsx (the connecting rack/spine drawn behind
 *  them), kept in one place so the two can't drift out of alignment. */
export const SLOT_SIZE = 36;
export const SLOT_GAP = 3;
export const GRID_COLS = 3;
export const GRID_ROWS = 5;

const PITCH = SLOT_SIZE + SLOT_GAP;

export const GRID_WIDTH = GRID_COLS * SLOT_SIZE + (GRID_COLS - 1) * SLOT_GAP;
export const GRID_HEIGHT = GRID_ROWS * SLOT_SIZE + (GRID_ROWS - 1) * SLOT_GAP;

/** Row/column position (1-indexed) of each slot in the classic 3-wide OSRS equipment-tab
 *  diamond layout:
 *    .    head  .
 *    cape neck  ammo
 *    weapon body shield
 *    .    legs  .
 *    hands feet ring
 */
export const GRID_POSITION: Record<EquipmentSlot, { row: number; col: number }> = {
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

export function colLeft(col: number): number {
  return (col - 1) * PITCH;
}

export function colCenter(col: number): number {
  return colLeft(col) + SLOT_SIZE / 2;
}

export function rowTop(row: number): number {
  return (row - 1) * PITCH;
}

export function rowCenter(row: number): number {
  return rowTop(row) + SLOT_SIZE / 2;
}
