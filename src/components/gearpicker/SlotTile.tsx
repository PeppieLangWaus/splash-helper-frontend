import type { CSSProperties, MouseEvent } from 'react';
import OSRSTile from '../osrs/OSRSTile';
import { useHoverTooltip } from './useHoverTooltip';
import { itemIconUrl } from '../chatbox/utils/itemIcons';
import { BLOCKED_ICON, SLOT_ICON_SCALE, SLOT_PLACEHOLDER_ICON, TILE_ASSETS } from './gearpickerAssets';
import type { EquipmentItem, EquipmentSlot } from '../../types/gear';
import { EQUIPMENT_SLOT_LABELS } from '../../types/gear';

interface Props {
  slot: EquipmentSlot;
  item?: EquipmentItem;

  blocked?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

export default function SlotTile({ slot, item, blocked, onClick }: Props) {
  const title = item?.name ?? (blocked ? `${EQUIPMENT_SLOT_LABELS[slot]} (blocked by two-handed weapon)` : EQUIPMENT_SLOT_LABELS[slot]);

  const { hoverProps, tooltip } = useHoverTooltip(item?.name);

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
    return (
      <div className="slot-tile__frame" title={item ? undefined : title} {...hoverProps}>
        {tile}
        {tooltip}
      </div>
    );
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
