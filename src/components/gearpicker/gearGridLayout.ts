import type { EquipmentSlot } from '../../types/gear';

export const SLOT_SIZE = 24;

export const SLOT_GAP = 3;
export const GRID_COLS = 3;
export const GRID_ROWS = 5;

export const ROW_HORIZONTAL_GAP: Partial<Record<number, number>> = {
  3: 15,
  5: 15
};

function horizontalGapForRow(row: number): number {
  return ROW_HORIZONTAL_GAP[row] ?? SLOT_GAP;
}

const PITCH = SLOT_SIZE + SLOT_GAP;

const widestHorizontalGap = Math.max(SLOT_GAP, ...Object.values(ROW_HORIZONTAL_GAP).filter((gap): gap is number => gap !== undefined));

export const GRID_WIDTH = GRID_COLS * SLOT_SIZE + (GRID_COLS - 1) * widestHorizontalGap;
export const GRID_HEIGHT = (GRID_ROWS * SLOT_SIZE + (GRID_ROWS - 1) * SLOT_GAP);

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

function designColLeft(row: number, col: number): number {
  const gap = horizontalGapForRow(row);
  const rowWidth = GRID_COLS * SLOT_SIZE + (GRID_COLS - 1) * gap;
  const rowOffset = (GRID_WIDTH - rowWidth) / 2;
  return rowOffset + (col - 1) * (SLOT_SIZE + gap);
}

function designRowTop(row: number): number {
  return (row - 1) * PITCH;
}

export const SLOT_WIDTH_PCT = (SLOT_SIZE / GRID_WIDTH) * 100;
export const SLOT_HEIGHT_PCT = (SLOT_SIZE / GRID_HEIGHT) * 100;

export function colLeft(row: number, col: number): number {
  return (designColLeft(row, col) / GRID_WIDTH) * 100;
}

export function colCenter(row: number, col: number): number {
  return colLeft(row, col) + SLOT_WIDTH_PCT / 2;
}

export function rowTop(row: number): number {
  return (designRowTop(row) / GRID_HEIGHT) * 100;
}

export function rowCenter(row: number): number {
  return rowTop(row) + SLOT_HEIGHT_PCT / 2;
}

export const TOOLBAR_BUTTON_SIZE = 48;

export const EQUIPMENT_COL_GAP = '0.75rem';
export const INVENTORY_EXTRA_HEIGHT = `calc(${EQUIPMENT_COL_GAP} + ${TOOLBAR_BUTTON_SIZE}px)`;
