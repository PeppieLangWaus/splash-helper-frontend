import type { CSSProperties } from 'react';
import { itemIconUrl } from '../chatbox/itemIcons';
import { GRID_HEIGHT, GRID_WIDTH } from './gearGridLayout';
import { INVENTORY_COLUMNS, INVENTORY_ROWS } from '../../types/gear';
import type { GearInventory } from '../../types/gear';

// Same box as EquipmentDisplay's diamond, so switching the middle panel between the two modes
// never resizes it.
const gridTemplateStyle: CSSProperties = {
  gridTemplateColumns: `repeat(${INVENTORY_COLUMNS}, 1fr)`,
  gridTemplateRows: `repeat(${INVENTORY_ROWS}, 1fr)`,
};

interface Props {
  inventory: GearInventory;
  itemNamesById: Map<number, string>;
  selectedIndices: ReadonlySet<number>;
  /** CSS length added below the equipment-sized box, for the space the equipment mode's toolbar
   *  takes up, so the panel keeps its size with the toolbar gone. */
  extraHeight: string;
  onSlotClick: (index: number, additive: boolean) => void;
}

/**
 * The 4x7 inventory layout. Visually empty until a slot is hovered, focused or selected, at which
 * point a translucent box appears over it; a slot holding an item always shows the item's icon.
 */
export default function InventoryGrid({ inventory, itemNamesById, selectedIndices, extraHeight, onSlotClick }: Props) {
  const wrapStyle: CSSProperties = { aspectRatio: `${GRID_WIDTH} / ${GRID_HEIGHT}`, marginBottom: extraHeight };
  const gridStyle: CSSProperties = { ...gridTemplateStyle, bottom: `calc(-1 * ${extraHeight})` };
  return (
    <div className="inventory-grid-wrap" style={wrapStyle}>
      <div className="inventory-grid" style={gridStyle}>
        {inventory.map((itemId, index) => {
          const itemName = itemId !== null ? itemNamesById.get(itemId) ?? `Item ${itemId}` : undefined;
          const label = `Inventory slot ${index + 1}`;
          return (
            <button
              key={index}
              type="button"
              className={'inventory-slot' + (selectedIndices.has(index) ? ' inventory-slot--selected' : '')}
              data-inventory-index={index}
              onClick={(event) => onSlotClick(index, event.ctrlKey || event.metaKey)}
              title={itemName ?? label}
              aria-label={itemName ? `${label}: ${itemName}` : label}
              aria-pressed={selectedIndices.has(index)}
            >
              {itemId !== null && <img src={itemIconUrl(itemId)} alt="" className="inventory-slot__icon" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
