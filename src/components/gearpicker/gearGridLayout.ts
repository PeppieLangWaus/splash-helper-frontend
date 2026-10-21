import type { EquipmentSlot } from '../../types/gear';

/** Shared geometry for the equipment diamond grid — used by both EquipmentDisplay.tsx (the slot
 *  tiles) and EquipmentSlotFrame.tsx (the rack/spine behind them), kept in one place so the two
 *  can't drift apart. SLOT_SIZE/GRID_WIDTH/GRID_HEIGHT are a fixed-px *design* reference only;
 *  everything consumed outside this file is expressed as a percentage of that design size, since
 *  the grid itself renders responsively. */
export const SLOT_SIZE = 24;
/** Default gap (px) used for row pitch (uniform — there's no vertical ROW_HORIZONTAL_GAP
 *  equivalent) and as the horizontal gap for any row not listed in ROW_HORIZONTAL_GAP. */
export const SLOT_GAP = 3;
export const GRID_COLS = 3;
export const GRID_ROWS = 5;

/** Per-row override of the horizontal gap between slot tiles, keyed by grid row (1-indexed, see
 *  GRID_POSITION); falls back to SLOT_GAP otherwise. Rows stay centered within GRID_WIDTH so the
 *  center column never moves. Keep rows 3 and 5 in sync — EquipmentSlotFrame.tsx's connector legs
 *  run straight between them and would misalign if their gaps differ. */
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

/** Left edge, in design px, of the tile at `col` within `row`, honoring that row's own horizontal
 *  gap (ROW_HORIZONTAL_GAP) while keeping the row's tiles centered within GRID_WIDTH — so col 2
 *  lands in the same place no matter what gap a row uses. Internal — everything outside this file
 *  consumes the %-based colLeft/rowTop below instead (see the note there for why). */
function designColLeft(row: number, col: number): number {
  const gap = horizontalGapForRow(row);
  const rowWidth = GRID_COLS * SLOT_SIZE + (GRID_COLS - 1) * gap;
  const rowOffset = (GRID_WIDTH - rowWidth) / 2;
  return rowOffset + (col - 1) * (SLOT_SIZE + gap);
}

function designRowTop(row: number): number {
  return (row - 1) * PITCH;
}

/** A tile's width/height as a percentage of GRID_WIDTH/GRID_HEIGHT. The two percentages differ
 *  (GRID_WIDTH != GRID_HEIGHT even though a tile is square) by design: against a container locked
 *  to `aspect-ratio: GRID_WIDTH / GRID_HEIGHT`, percentages derived from the same px size resolve
 *  back to the same physical pixels, keeping the tile square at any container size. */
export const SLOT_WIDTH_PCT = (SLOT_SIZE / GRID_WIDTH) * 100;
export const SLOT_HEIGHT_PCT = (SLOT_SIZE / GRID_HEIGHT) * 100;

/** Left edge of the tile at `col` within `row`, as a percentage of the grid's design width — since
 *  the grid renders at `width: 100%` with a locked aspect-ratio rather than fixed pixels, a
 *  percentage here always lands at the same proportional spot regardless of rendered size. */
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

/** Outer size (px) of each square toolbar button under the equipment grid. */
export const TOOLBAR_BUTTON_SIZE = 48;
/** Gap between the equipment grid and the toolbar under it; the inventory grid claims that space
 *  too (see INVENTORY_EXTRA_HEIGHT), so it keeps its proportions with the toolbar gone. */
export const EQUIPMENT_COL_GAP = '0.75rem';
export const INVENTORY_EXTRA_HEIGHT = `calc(${EQUIPMENT_COL_GAP} + ${TOOLBAR_BUTTON_SIZE}px)`;
