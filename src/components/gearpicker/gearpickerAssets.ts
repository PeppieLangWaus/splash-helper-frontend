import type { EquipmentSlot } from '../../types/gear';
import type { RSPanelAssets } from '../osrs/OSRSPanel';
import type { RSTileAssets } from '../osrs/OSRSTile';

const ICON_BASE = '/assets/gearpicker';
const PANEL_BASE = '/assets/panel';
const TILE_BASE = '/assets/tile';

function panelBorder(style: 'stone' | 'steel') {
  const dir = `${PANEL_BASE}/border/${style}`;
  return {
    topLeft: `${dir}/topLeft.png`,
    topRight: `${dir}/topRight.png`,
    bottomLeft: `${dir}/bottomLeft.png`,
    bottomRight: `${dir}/bottomRight.png`,
    top: `${dir}/top.png`,
    bottom: `${dir}/bottom.png`,
    left: `${dir}/left.png`,
    right: `${dir}/right.png`,
  };
}

export const PANEL_ASSETS_STONE: RSPanelAssets = {
  cornerWidth: 32,
  cornerHeight: 32,
  borderThickness: 7,
  ...panelBorder('stone'),
  bg: `${PANEL_BASE}/bg/2.png`,
};

export const PANEL_ASSETS_STEEL: RSPanelAssets = {
  cornerWidth: 25,
  cornerHeight: 30,
  borderThickness: 6,
  ...panelBorder('steel'),
  bg: `${PANEL_BASE}/bg/1.png`,
};

function slotTileAssets(dirName: 'grey' | 'red'): RSTileAssets {
  const dir = `${TILE_BASE}/${dirName}`;
  return {
    cornerWidth: 6,
    cornerHeight: 6,
    borderThickness: 6,
    topLeft: `${dir}/topLeft.png`,
    topRight: `${dir}/topRight.png`,
    bottomLeft: `${dir}/bottomLeft.png`,
    bottomRight: `${dir}/bottomRight.png`,
    top: `${dir}/top.png`,
    bottom: `${dir}/bottom.png`,
    left: `${dir}/left.png`,
    right: `${dir}/right.png`,
    bg: `${dir}/bg.png`,
  };
}

export const TILE_ASSETS = {
  gray: slotTileAssets('grey'),
  red: slotTileAssets('red'),
};

export const SLOT_PLACEHOLDER_ICON: Record<EquipmentSlot, string> = {
  head: `${TILE_BASE}/icon/head.png`,
  cape: `${TILE_BASE}/icon/cape.png`,
  neck: `${TILE_BASE}/icon/necklace.png`,
  weapon: `${TILE_BASE}/icon/weapon.png`,
  body: `${TILE_BASE}/icon/chest.png`,
  shield: `${TILE_BASE}/icon/shield.png`,
  legs: `${TILE_BASE}/icon/legs.png`,
  hands: `${TILE_BASE}/icon/hands.png`,
  feet: `${TILE_BASE}/icon/feet.png`,
  ring: `${TILE_BASE}/icon/ring.png`,
  ammo: `${TILE_BASE}/icon/ammo.png`,
};

export const CONNECTOR_ASSETS = {
  horizontal: `${PANEL_BASE}/connector/horizontal.png`,
  vertical: `${PANEL_BASE}/connector/vertical.png`,
  barThickness: 4,
};

export const SLOT_ICON_SCALE: Record<EquipmentSlot, number> = {
  head: 1.3,
  cape: 1.3,
  neck: 1.3,
  weapon: 1.3,
  body: 1.3,
  shield: 1.3,
  legs: 1.3,
  hands: 1.3,
  feet: 1.3,
  ring: 1.3,
  ammo: 1.3,
};

export const BLOCKED_ICON = `${ICON_BASE}/blocked.png`;
export const SPLASH_TRUE_ICON = `${ICON_BASE}/splashTrue.png`;
export const SPLASH_FALSE_ICON = `${ICON_BASE}/splashFalse.png`;
export const SEARCH_ICON = `${ICON_BASE}/search.png`;
export const STATS_ICON = `${ICON_BASE}/stats.png`;
export const VALUE_ICON = `${ICON_BASE}/value.png`;
export const CLEAR_EQUIPMENT_ICON = `${ICON_BASE}/clearEquipment.png`;
export const INVENTORY_ICON = `${ICON_BASE}/inventory.png`;
export const EQUIPMENT_ICON = `${ICON_BASE}/equipment.png`;
export const REMOVE_BUTTON_ICON = {
  normal: '/assets/icons/components/buttons/remove/normal.png',
  pressed: '/assets/icons/components/buttons/remove/pressed.png',
};
export const DELETE_ICON = `${ICON_BASE}/delete.png`;
export const HELP_BUTTON_ICON = `${ICON_BASE}/button/normal/help.png`;
