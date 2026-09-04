import type { CSSProperties } from 'react';
import { CONNECTOR_ASSETS } from '../utils/gearpickerAssets';
import { GRID_HEIGHT, GRID_WIDTH, colCenter, rowCenter } from '../utils/gearGridLayout';

const { barThickness, cornerArmWidth, cornerArmHeight, top, left, right, topLeft, topRight } = CONNECTOR_ASSETS;

const base: CSSProperties = {
  position: 'absolute',
  imageRendering: 'pixelated',
};

function hBar(y: number, x1: number, x2: number, src: string): CSSProperties {
  return { ...base, top: y - barThickness / 2, left: x1, width: x2 - x1, height: barThickness, backgroundImage: `url(${src})`, backgroundRepeat: 'repeat-x' };
}

function vBar(x: number, y1: number, y2: number, src: string): CSSProperties {
  return { ...base, left: x - barThickness / 2, top: y1, width: barThickness, height: y2 - y1, backgroundImage: `url(${src})`, backgroundRepeat: 'repeat-y' };
}

/** Positions an L-corner so its vertical arm (drawn at the image's own left edge for topLeft,
 *  right edge for topRight) lines up with the given column center, and its horizontal arm's top
 *  edge lines up with the given row center. */
function leftCorner(colX: number, rowY: number, src: string): CSSProperties {
  return { ...base, left: colX - barThickness / 2, top: rowY - barThickness / 2, width: cornerArmWidth, height: cornerArmHeight, backgroundImage: `url(${src})`, backgroundRepeat: 'no-repeat' };
}

function rightCorner(colX: number, rowY: number, src: string): CSSProperties {
  return { ...base, left: colX + barThickness / 2 - cornerArmWidth, top: rowY - barThickness / 2, width: cornerArmWidth, height: cornerArmHeight, backgroundImage: `url(${src})`, backgroundRepeat: 'no-repeat' };
}

/**
 * The connecting rack/spine drawn behind the equipment slot tiles, using the user-supplied
 * connector asset pack (panel/connector/*) — a bolder, second frame-bracket set distinct from
 * the outer panel's own corner/border assets. Read from a reference sketch: a short vertical
 * spine through head/neck meeting a crossbar at the cape-neck-ammo row, and a wider bracket at
 * the weapon-body-shield row whose ends bend downward (via the connector's L-shaped corners)
 * into three legs running down through legs/hands-feet-ring. Geometry is derived from the same
 * gearGridLayout.ts constants EquipmentDisplay.tsx positions the actual slot tiles with, so the
 * two can't drift apart.
 */
export default function EquipmentSlotFrame() {
  const col1 = colCenter(1);
  const col2 = colCenter(2);
  const col3 = colCenter(3);
  const row2 = rowCenter(2);
  const row3 = rowCenter(3);

  // The corner pieces' vertical arm starts at the crossbar and runs cornerArmHeight down from
  // there — the plain leg strips below pick up exactly where that arm ends.
  const legContinuesFrom = row3 - barThickness / 2 + cornerArmHeight;

  return (
    <div style={{ position: 'absolute', inset: 0, width: GRID_WIDTH, height: GRID_HEIGHT, zIndex: 0 }}>
      {/* Center spine: runs the full height, unbroken, through head/neck/legs/feet. */}
      <div style={vBar(col2, 0, GRID_HEIGHT, left)} />

      {/* Crossbar at the cape/neck/ammo row — a simple straight crossing, no bend. */}
      <div style={hBar(row2, 0, GRID_WIDTH, top)} />

      {/* Bracket at the weapon/body/shield row: ends bend down into the left/right legs via the
          connector's own L-corners; the straight middle segment fills between them, crossing
          over the center spine. */}
      <div style={leftCorner(col1, row3, topLeft)} />
      <div style={rightCorner(col3, row3, topRight)} />
      <div style={hBar(row3, col1 + cornerArmWidth - barThickness / 2, col3 - cornerArmWidth + barThickness / 2, top)} />

      {/* Left/right legs continuing down from the corner pieces' own vertical arm to the bottom
          of the grid (hands/ring row). */}
      <div style={vBar(col1, legContinuesFrom, GRID_HEIGHT, left)} />
      <div style={vBar(col3, legContinuesFrom, GRID_HEIGHT, right)} />
    </div>
  );
}
