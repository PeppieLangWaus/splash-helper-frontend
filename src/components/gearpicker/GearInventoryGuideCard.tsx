import { useMemo } from 'react';
import OSRSPanel from '../osrs/OSRSPanel';
import InventoryGrid from './InventoryGrid';
import PixelText from '../PixelText';
import { EQUIPMENT_COL_GAP, INVENTORY_EXTRA_HEIGHT } from './gearGridLayout';
import { PANEL_ASSETS_STONE } from './gearpickerAssets';
import { colors } from '../../theme';
import { INVENTORY_SLOT_COUNT, emptyInventory } from '../../types/gear';
import './Gearpicker.css';

export interface GuideInventoryItem {
  id: number;
  /** Shown as the slot's hover title — the inventory dataset isn't fetched here, so the name
   *  can't be looked up from the id. */
  name: string;
}

interface Props {
  /** Inventory contents in slot order (left to right, then top to bottom). Use `null` to leave a
   *  slot empty in the middle of the list; anything past the last item is empty too. */
  items: ReadonlyArray<GuideInventoryItem | null>;
  /** Heading above the grid, e.g. "Trap setup inventory". */
  title?: string;
}

/**
 * A read-only "here's the inventory" card for embedding a specific inventory layout in written
 * guide content — the same 4x7 grid as the gear picker's inventory mode, with no hover or
 * selection behavior. Counterpart to GearLoadoutGuideCard (equipment).
 * Unlike that card, the contents are passed in directly instead of loaded by slug, because saved
 * gear loadouts only store equipment — there's no inventory on the backend to fetch.
 * Stack quantities aren't shown; the grid only models which item is in which slot.
 */
export default function GearInventoryGuideCard({ items, title }: Props) {
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

  const body = (
    <div className="gear-inventory-card" style={{ gap: EQUIPMENT_COL_GAP }}>
      {title && <PixelText text={title} fontSize={20} color={colors.accentText} bold />}
      <InventoryGrid inventory={inventory} itemNamesById={itemNamesById} extraHeight={title ? '0px' : INVENTORY_EXTRA_HEIGHT} />
    </div>
  );

  return <OSRSPanel assets={PANEL_ASSETS_STONE} borderType="stone" type="side" width={200} content={body} />;
}
