import type { EquipmentSlot } from '../types/gear';

/** Asset pack for the gear picker's OSRS-styled chrome — see public/assets/gearpicker/.
 *  Provided by the user: a 9-slice panel frame (4 corners + 4 repeating borders + 1 tiled
 *  background) reused at two scales — the outer panel frame, and each individual equipment
 *  slot tile — plus placeholder slot-outline icons, a blocked-slot badge, splash-safety icons,
 *  and a couple of button icons. */
const BASE = '/assets/gearpicker';

export interface NineSliceAssets {
  /** Corner assets are square; this is both their width and height in px. */
  cornerSize: number;
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
  /** Repeats horizontally (background-repeat: repeat-x). */
  top: string;
  bottom: string;
  /** Repeats vertically (background-repeat: repeat-y). */
  left: string;
  right: string;
  /** Tiles both directions to fill the interior. */
  bg: string;
}

export const PANEL_ASSETS: NineSliceAssets = {
  cornerSize: 9,
  topLeft: `${BASE}/panel/corner/topLeft.png`,
  topRight: `${BASE}/panel/corner/topRight.png`,
  bottomLeft: `${BASE}/panel/corner/bottomLeft.png`,
  bottomRight: `${BASE}/panel/corner/bottomRight.png`,
  top: `${BASE}/panel/border/top.png`,
  bottom: `${BASE}/panel/border/bottom.png`,
  left: `${BASE}/panel/border/left.png`,
  right: `${BASE}/panel/border/right.png`,
  bg: `${BASE}/panel/bg/1.png`,
};

function slotTileAssets(color: 'grey' | 'red'): NineSliceAssets {
  const dir = `${BASE}/tile/${color}`;
  return {
    cornerSize: 6,
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

export const SLOT_TILE_ASSETS = {
  grey: slotTileAssets('grey'),
  red: slotTileAssets('red'),
};

/** Outline icon shown in an empty (non-blocked) slot, matching OSRS's own equipment tab. */
export const SLOT_PLACEHOLDER_ICON: Record<EquipmentSlot, string> = {
  head: `${BASE}/tile/icon/head.png`,
  cape: `${BASE}/tile/icon/cape.png`,
  neck: `${BASE}/tile/icon/necklace.png`,
  weapon: `${BASE}/tile/icon/weapon.png`,
  body: `${BASE}/tile/icon/chest.png`,
  shield: `${BASE}/tile/icon/shield.png`,
  legs: `${BASE}/tile/icon/legs.png`,
  hands: `${BASE}/tile/icon/hands.png`,
  feet: `${BASE}/tile/icon/feet.png`,
  ring: `${BASE}/tile/icon/ring.png`,
  ammo: `${BASE}/tile/icon/ammo.png`,
};

export const BLOCKED_ICON = `${BASE}/blocked.png`;
export const SPLASH_TRUE_ICON = `${BASE}/splashTrue.png`;
export const SPLASH_FALSE_ICON = `${BASE}/splashFalse.png`;
export const SEARCH_ICON = `${BASE}/search.png`;
export const CLEAR_EQUIPMENT_ICON = `${BASE}/clearEquipment.png`;
export const DELETE_ICON = `${BASE}/delete.png`;
export const HELP_BUTTON_ICON = `${BASE}/button/normal/help.png`;
