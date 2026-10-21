import type { CSSProperties, MouseEvent } from 'react';
import OSRSTile from '../osrs/OSRSTile';
import { itemIconUrl } from '../chatbox/itemIcons';
import { BLOCKED_ICON, SLOT_ICON_SCALE, SLOT_PLACEHOLDER_ICON, TILE_ASSETS } from './gearpickerAssets';
import type { EquipmentItem, EquipmentSlot } from '../../types/gear';
import { EQUIPMENT_SLOT_LABELS } from '../../types/gear';

interface Props {
  slot: EquipmentSlot;
  item?: EquipmentItem;
  /** True when this slot can't be used right now (shield blocked by a two-handed weapon) — shows
   *  the red tile + a blocked badge instead of the normal grey tile + slot outline icon. */
  blocked?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

/** One equipment slot tile: an OSRSTile (gray normally, red when blocked) showing the equipped
 *  item's icon, the slot's outline placeholder, or a blocked badge. Thin gear-picker-specific
 *  wrapper — OSRSTile itself knows nothing about equipment slots or "blocked" states.
 *
 *  Sized at 100%/100%; the wrapping `.equipment-diamond-tile` div (see EquipmentDisplay.tsx) sets
 *  the real size. `sizeType="square"` only tells OSRSTile what reference size its chrome was
 *  designed at, so borders/corners scale proportionally instead of staying pixel-fixed. */
export default function SlotTile({ slot, item, blocked, onClick }: Props) {
  const title = item?.name ?? (blocked ? `${EQUIPMENT_SLOT_LABELS[slot]} (blocked by two-handed weapon)` : EQUIPMENT_SLOT_LABELS[slot]);

  const iconStyle = { '--icon-scale': SLOT_ICON_SCALE[slot] } as CSSProperties;

  const icon = item ? (
    <img src={itemIconUrl(item.id)} alt={item.name} className="slot-tile__icon slot-tile__icon--item" style={iconStyle} />
  ) : blocked ? (
    <img src={BLOCKED_ICON} alt="Blocked" className="slot-tile__icon" style={iconStyle} />
  ) : (
    <img src={SLOT_PLACEHOLDER_ICON[slot]} alt="" className="slot-tile__icon" style={iconStyle} />
  );

  const tile = (
    <OSRSTile
      assets={blocked ? TILE_ASSETS.red : TILE_ASSETS.gray}
      type={blocked ? 'red' : 'gray'}
      sizeType="square"
      width="100%"
      height="100%"
      contentType="equipment"
      content={icon}
    />
  );

  if (!onClick) {
    return <div className="slot-tile__frame" title={title}>{tile}</div>;
  }

  return (
    <button
      type="button"
      className="slot-tile__frame slot-tile__button"
      data-equipment-slot={slot}
      onClick={onClick}
      disabled={blocked}
      title={title}
    >
      {tile}
    </button>
  );
}
