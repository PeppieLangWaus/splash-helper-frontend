import type { CSSProperties } from 'react';
import { CONNECTOR_ASSETS } from './gearpickerAssets';
import { GRID_HEIGHT, GRID_WIDTH, colCenter, rowCenter } from './gearGridLayout';

const { horizontal, vertical, barThickness } = CONNECTOR_ASSETS;

// Every piece here is computed from grid geometry at render time, so position/size stay inline;
// only the repeat mode is static enough to live in gearpicker.css (.equipment-slot-frame__bar).
// There's no dedicated bent-corner asset anymore — a horizontal and vertical bar simply meet at
// the junction point instead.
function hBar(y: number, x1: number, x2: number): CSSProperties {
  return { top: y - barThickness / 2, left: x1, width: x2 - x1, height: barThickness, backgroundImage: `url(${horizontal})`, backgroundRepeat: 'repeat-x' };
}

function vBar(x: number, y1: number, y2: number): CSSProperties {
  return { left: x - barThickness / 2, top: y1, width: barThickness, height: y2 - y1, backgroundImage: `url(${vertical})`, backgroundRepeat: 'repeat-y' };
}

/**
 * The connecting rack/spine drawn behind the equipment slot tiles, using the two plain connector
 * bars (panel/connector/{horizontal,vertical}.png) — a continuous vertical spine through
 * head/neck/legs/feet, a crossbar at the cape/neck/ammo row, and a second crossbar at the
 * weapon/body/shield row with two legs dropping straight down to hands/feet/ring (the bars
 * simply overlap at each junction; there's no separate bent-corner piece to align). Geometry is
 * derived from the same gearGridLayout.ts constants EquipmentDisplay.tsx positions the actual
 * slot tiles with, so the two can't drift apart.
 */
export default function EquipmentSlotFrame() {
  const col1 = colCenter(1);
  const col2 = colCenter(2);
  const col3 = colCenter(3);
  const row2 = rowCenter(2);
  const row3 = rowCenter(3);

  return (
    <div className="equipment-slot-frame" style={{ width: GRID_WIDTH, height: GRID_HEIGHT }}>
      {/* Center spine: runs the full height, unbroken, through head/neck/legs/feet. */}
      <div className="equipment-slot-frame__bar" style={vBar(col2, 0, GRID_HEIGHT)} />

      {/* Crossbar at the cape/neck/ammo row. */}
      <div className="equipment-slot-frame__bar" style={hBar(row2, 0, GRID_WIDTH)} />

      {/* Crossbar at the weapon/body/shield row, with legs dropping to the bottom of the grid
          (hands/ring row) at the left/right columns. */}
      <div className="equipment-slot-frame__bar" style={hBar(row3, 0, GRID_WIDTH)} />
      <div className="equipment-slot-frame__bar" style={vBar(col1, row3, GRID_HEIGHT)} />
      <div className="equipment-slot-frame__bar" style={vBar(col3, row3, GRID_HEIGHT)} />
    </div>
  );
}
