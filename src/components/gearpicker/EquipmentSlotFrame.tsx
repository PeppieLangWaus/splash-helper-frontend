import type { CSSProperties } from 'react';
import { CONNECTOR_ASSETS } from './gearpickerAssets';
import { GRID_HEIGHT, GRID_WIDTH, SLOT_WIDTH_PCT, colCenter, colLeft, rowCenter } from './gearGridLayout';

const { horizontal, vertical, barThickness } = CONNECTOR_ASSETS;

const barThicknessPctX = (barThickness / GRID_WIDTH) * 100;
const barThicknessPctY = (barThickness / GRID_HEIGHT) * 100;

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

function rowSpan(row: number): [left: number, right: number] {
  return [colLeft(row, 1), colLeft(row, 3) + SLOT_WIDTH_PCT];
}

export default function EquipmentSlotFrame() {
  const col1 = colCenter(3, 1);
  const col2 = colCenter(3, 2);
  const col3 = colCenter(3, 3);
  const row2 = rowCenter(2);
  const row3 = rowCenter(3);
  const [row2Left, row2Right] = rowSpan(2);
  const [row3Left, row3Right] = rowSpan(3);

  return (
    <div className="equipment-slot-frame">
      {}
      <div className="equipment-slot-frame__bar" style={vBar(col2, 0, 100)} />

      {}
      <div className="equipment-slot-frame__bar" style={hBar(row2, row2Left, row2Right)} />

      {}
      <div className="equipment-slot-frame__bar" style={hBar(row3, row3Left, row3Right)} />
      <div className="equipment-slot-frame__bar" style={vBar(col1, row3, 100)} />
      <div className="equipment-slot-frame__bar" style={vBar(col3, row3, 100)} />
    </div>
  );
}
