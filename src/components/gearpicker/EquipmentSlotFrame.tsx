import type { CSSProperties } from 'react';
import { CONNECTOR_ASSETS } from './gearpickerAssets';
import { GRID_HEIGHT, GRID_WIDTH, SLOT_WIDTH_PCT, colCenter, colLeft, rowCenter } from './gearGridLayout';

const { horizontal, vertical, barThickness } = CONNECTOR_ASSETS;

// barThickness is the connector art's native px thickness — converted here to a percentage of
// the grid's own design width/height (same trick as gearGridLayout.ts's SLOT_WIDTH_PCT/
// SLOT_HEIGHT_PCT) so bars scale along with the grid instead of staying a fixed pixel thickness.
const barThicknessPctX = (barThickness / GRID_WIDTH) * 100;
const barThicknessPctY = (barThickness / GRID_HEIGHT) * 100;

// Position/size are computed here as percentages of the grid's box (gearGridLayout.ts) and kept
// inline; background-size is explicit so the bar art scales with the box instead of tiling at its
// native pixel size. Bars simply overlap at each junction — there's no separate corner asset.
function hBar(yPct: number, x1Pct: number, x2Pct: number): CSSProperties {
  return {
    top: `${yPct - barThicknessPctY / 2}%`,
    left: `${x1Pct}%`,
    width: `${x2Pct - x1Pct}%`,
    height: `${barThicknessPctY}%`,
    backgroundImage: `url(${horizontal})`,
    backgroundRepeat: 'repeat-x',
    backgroundSize: 'auto 100%',
  };
}

function vBar(xPct: number, y1Pct: number, y2Pct: number): CSSProperties {
  return {
    left: `${xPct - barThicknessPctX / 2}%`,
    top: `${y1Pct}%`,
    width: `${barThicknessPctX}%`,
    height: `${y2Pct - y1Pct}%`,
    backgroundImage: `url(${vertical})`,
    backgroundRepeat: 'repeat-y',
    backgroundSize: '100% auto',
  };
}

/** Left/right edge of `row`'s own tiles (col 1's left edge to col 3's right edge), as percentages
 *  — a crossbar spanning a row must use these instead of 0/100, since the grid's overall width is
 *  sized to the *widest* row (see ROW_HORIZONTAL_GAP in gearGridLayout.ts) and would overhang any
 *  narrower row's tiles otherwise. */
function rowSpan(row: number): [left: number, right: number] {
  return [colLeft(row, 1), colLeft(row, 3) + SLOT_WIDTH_PCT];
}

/**
 * The connecting rack/spine drawn behind the equipment slot tiles: a vertical spine through
 * head/neck/legs/feet, a crossbar at cape/neck/ammo, and a second crossbar at weapon/body/shield
 * with legs dropping to hands/feet/ring. Uses the same gearGridLayout.ts geometry EquipmentDisplay
 * positions the actual tiles with, so the two can't drift apart.
 */
export default function EquipmentSlotFrame() {
  // Column 2 lands at the same x for every row regardless of gap (see colLeft), so any row works
  // here — row 3 is used because its left/right columns match the weapon/body/shield crossbar's legs.
  const col1 = colCenter(3, 1);
  const col2 = colCenter(3, 2);
  const col3 = colCenter(3, 3);
  const row2 = rowCenter(2);
  const row3 = rowCenter(3);
  const [row2Left, row2Right] = rowSpan(2);
  const [row3Left, row3Right] = rowSpan(3);

  return (
    <div className="equipment-slot-frame">
      {/* Center spine: runs the full height, unbroken, through head/neck/legs/feet. */}
      <div className="equipment-slot-frame__bar" style={vBar(col2, 0, 100)} />

      {/* Crossbar at the cape/neck/ammo row. */}
      <div className="equipment-slot-frame__bar" style={hBar(row2, row2Left, row2Right)} />

      {/* Crossbar at the weapon/body/shield row, with legs dropping to the bottom of the grid
          (hands/ring row) at the left/right columns. */}
      <div className="equipment-slot-frame__bar" style={hBar(row3, row3Left, row3Right)} />
      <div className="equipment-slot-frame__bar" style={vBar(col1, row3, 100)} />
      <div className="equipment-slot-frame__bar" style={vBar(col3, row3, 100)} />
    </div>
  );
}
