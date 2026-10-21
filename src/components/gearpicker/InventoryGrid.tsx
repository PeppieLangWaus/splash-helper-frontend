import type { CSSProperties, ReactNode } from 'react';
import { itemIconUrl } from '../chatbox/utils/itemIcons';
import { useHoverTooltip } from './useHoverTooltip';
import { GRID_HEIGHT, GRID_WIDTH } from './gearGridLayout';
import { INVENTORY_COLUMNS, INVENTORY_ROWS } from '../../types/gear';
import type { GearInventory } from '../../types/gear';

const gridTemplateStyle: CSSProperties = {
  gridTemplateColumns: `repeat(${INVENTORY_COLUMNS}, 1fr)`,
  gridTemplateRows: `repeat(${INVENTORY_ROWS}, 1fr)`,
};

function StaticInventorySlot({ itemName, children }: { itemName?: string; children: ReactNode }) {
  const { hoverProps, tooltip } = useHoverTooltip(itemName);
  return (
    <div className="inventory-slot inventory-slot--static" aria-label={itemName} {...hoverProps}>
      {children}
      {tooltip}
    </div>
  );
}

interface Props {
  inventory: GearInventory;
  itemNamesById: Map<number, string>;
  selectedIndices?: ReadonlySet<number>;

  extraHeight?: string;

  onSlotClick?: (index: number, additive: boolean) => void;
}

export default function InventoryGrid({ inventory, itemNamesById, selectedIndices, extraHeight = '0px', onSlotClick }: Props) {
  const wrapStyle: CSSProperties = { aspectRatio: `${GRID_WIDTH} / ${GRID_HEIGHT}`, marginBottom: extraHeight };
  const gridStyle: CSSProperties = { ...gridTemplateStyle, bottom: `calc(-1 * ${extraHeight})` };
  return (
    <div className="inventory-grid-wrap" style={wrapStyle}>
      <div className="inventory-grid" style={gridStyle}>
        {inventory.map((itemId, index) => {
          const itemName = itemId !== null ? itemNamesById.get(itemId) ?? `Item ${itemId}` : undefined;
          const label = `Inventory slot ${index + 1}`;
          const title = itemName ?? label;
          const icon = itemId !== null && <img src={itemIconUrl(itemId)} alt="" className="inventory-slot__icon" />;

          if (!onSlotClick) {
            return <StaticInventorySlot key={index} itemName={itemName}>{icon}</StaticInventorySlot>;
          }

          const selected = selectedIndices?.has(index) ?? false;
          return (
            <button
              key={index}
              type="button"
              className={'inventory-slot' + (selected ? ' inventory-slot--selected' : '')}
              data-inventory-index={index}
              onClick={(event) => onSlotClick(index, event.ctrlKey || event.metaKey)}
              title={title}
              aria-label={itemName ? `${label}: ${itemName}` : label}
              aria-pressed={selected}
            >
              {icon}
            </button>
          );
        })}
      </div>
    </div>
  );
}
