import NineSlicePanel from './NineSlicePanel';
import { itemIconUrl } from '../chatbox/itemIcons';
import { BLOCKED_ICON, SLOT_PLACEHOLDER_ICON, SLOT_TILE_ASSETS } from './gearpickerAssets';
import { SLOT_SIZE } from './gearGridLayout';
import type { EquipmentItem, EquipmentSlot } from '../../types/gear';
import { EQUIPMENT_SLOT_LABELS } from '../../types/gear';

const tileSizeStyle = { width: SLOT_SIZE, height: SLOT_SIZE };

interface Props {
  slot: EquipmentSlot;
  item?: EquipmentItem;
  /** True when this slot can't be used right now (shield blocked by a two-handed weapon) — shows
   *  the red tile + a blocked badge instead of the normal grey tile + slot outline icon. */
  blocked?: boolean;
  onClick?: () => void;
}

/** One equipment slot tile: the user-provided OSRS-style 9-slice tile background (grey normally,
 *  red when blocked), with either the equipped item's icon, the slot's outline placeholder icon,
 *  or a blocked badge centered on top. */
export default function SlotTile({ slot, item, blocked, onClick }: Props) {
  const assets = blocked ? SLOT_TILE_ASSETS.red : SLOT_TILE_ASSETS.grey;
  const title = item?.name ?? (blocked ? `${EQUIPMENT_SLOT_LABELS[slot]} (blocked by two-handed weapon)` : EQUIPMENT_SLOT_LABELS[slot]);

  const icon = item ? (
    <img src={itemIconUrl(item.id)} alt={item.name} className="slot-tile__icon" />
  ) : blocked ? (
    <img src={BLOCKED_ICON} alt="Blocked" className="slot-tile__icon" />
  ) : (
    <img src={SLOT_PLACEHOLDER_ICON[slot]} alt="" className="slot-tile__icon" />
  );

  const panel = (
    <NineSlicePanel assets={assets} style={tileSizeStyle} bgStyle={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </NineSlicePanel>
  );

  if (!onClick) {
    return <div title={title}>{panel}</div>;
  }

  return (
    <button type="button" className="slot-tile__button" onClick={onClick} disabled={blocked} title={title}>
      {panel}
    </button>
  );
}
