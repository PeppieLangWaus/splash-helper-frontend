import { useMemo } from 'react';
import OSRSPanel from '../osrs/OSRSPanel';
import InventoryGrid from './InventoryGrid';
import { PANEL_ASSETS_STONE } from './gearpickerAssets';
import { INVENTORY_SLOT_COUNT, emptyInventory } from '../../types/gear';
import './Gearpicker.css';

export interface GuideInventoryItem {
  id: number;

  name: string;
}

interface Props {

  items: ReadonlyArray<GuideInventoryItem | null>;
}

export default function GearInventoryGuideCard({ items }: Props) {
  const { inventory, itemNamesById } = useMemo(() => {
    const layout = emptyInventory();
    const names = new Map<number, string>();
    items.slice(0, INVENTORY_SLOT_COUNT).forEach((item, index) => {
      if (!item) return;
      layout[index] = item.id;
      names.set(item.id, item.name);
    });
    return { inventory: layout, itemNamesById: names };
  }, [items]);

  const body = <InventoryGrid inventory={inventory} itemNamesById={itemNamesById} />;

  return <OSRSPanel assets={PANEL_ASSETS_STONE} borderType="stone" type="side" width={240} content={body} />;
}
