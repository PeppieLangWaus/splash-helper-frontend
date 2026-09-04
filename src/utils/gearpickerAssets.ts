import type { EquipmentSlot } from '../types/gear';

/** Asset pack for the gear picker's OSRS-styled chrome — see public/assets/gearpicker/.
 *  Provided by the user: a 9-slice panel frame (4 corners + 4 repeating borders + 1 tiled
 *  background) reused at two scales — the outer panel frame, and each individual equipment
 *  slot tile — plus placeholder slot-outline icons, a blocked-slot badge, splash-safety icons,
 *  and a couple of button icons. */
const BASE = '/assets/gearpicker';

export interface NineSliceAssets {
  /** Corner assets' native width/height in px — rendered at native size, never stretched. */
  cornerWidth: number;
  cornerHeight: number;
  /** Native thickness of the border strips: height for top/bottom, width for left/right. */
  borderThickness: number;
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
  /** Repeats horizontally (background-repeat: repeat-x), spanning the full outer edge — corners
   *  are layered on top of it, not carved out of it. */
  top: string;
  bottom: string;
  /** Repeats vertically (background-repeat: repeat-y), spanning the full outer edge. */
  left: string;
  right: string;
  /** Tiles both directions to fill the interior. */
  bg: string;
}

export const PANEL_ASSETS: NineSliceAssets = {
  cornerWidth: 9,
  cornerHeight: 9,
  borderThickness: 7,
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

/** The bigger, bolder frame-bracket pieces used to draw a connecting rack/spine shape behind
 *  the equipment slot tiles (see EquipmentSlotFrame.tsx) — corners here are asymmetric L-brackets
 *  (25x30: a 25px-wide horizontal arm + a 30px-tall vertical arm meeting at the bend), not simple
 *  square corners, so they're kept as their own flat set rather than forced into NineSliceAssets. */
export const CONNECTOR_ASSETS = {
  top: `${BASE}/panel/connector/top.png`,
  bottom: `${BASE}/panel/connector/bottom.png`,
  left: `${BASE}/panel/connector/left.png`,
  right: `${BASE}/panel/connector/right.png`,
  topLeft: `${BASE}/panel/connector/topLeft.png`,
  topRight: `${BASE}/panel/connector/topRight.png`,
  bottomLeft: `${BASE}/panel/connector/bottomLeft.png`,
  bottomRight: `${BASE}/panel/connector/bottomRight.png`,
  cornerArmWidth: 25,
  cornerArmHeight: 30,
  barThickness: 6,
};

export const BLOCKED_ICON = `${BASE}/blocked.png`;
export const SPLASH_TRUE_ICON = `${BASE}/splashTrue.png`;
export const SPLASH_FALSE_ICON = `${BASE}/splashFalse.png`;
export const SEARCH_ICON = `${BASE}/search.png`;
export const CLEAR_EQUIPMENT_ICON = `${BASE}/clearEquipment.png`;
export const DELETE_ICON = `${BASE}/delete.png`;
export const HELP_BUTTON_ICON = `${BASE}/button/normal/help.png`;
