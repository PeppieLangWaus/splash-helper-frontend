import type { EquipmentSlot } from '../../types/gear';
import type { RSPanelAssets } from '../osrs/OSRSPanel';
import type { RSTileAssets } from '../osrs/OSRSTile';

/** Asset pack for the gear picker's OSRS-styled chrome — see public/assets/gearpicker/.
 *  Provided by the user: a 9-slice panel frame (4 corners + 4 repeating borders + 1 tiled
 *  background), reused at panel scale for OSRSPanel and at tile scale for OSRSTile, plus
 *  placeholder slot-outline icons, a blocked-slot badge, splash-safety icons, and a couple of
 *  button icons. */
const BASE = '/assets/gearpicker';

const PANEL_BORDER = {
  top: `${BASE}/panel/border/top.png`,
  bottom: `${BASE}/panel/border/bottom.png`,
  left: `${BASE}/panel/border/left.png`,
  right: `${BASE}/panel/border/right.png`,
};

/** OSRSPanel's `borderType="stone"` — the plain, small 9x9-corner frame. Side/freeform only. */
export const PANEL_ASSETS_STONE: RSPanelAssets = {
  cornerWidth: 9,
  cornerHeight: 9,
  borderThickness: 7,
  topLeft: `${BASE}/panel/corner/topLeft.png`,
  topRight: `${BASE}/panel/corner/topRight.png`,
  bottomLeft: `${BASE}/panel/corner/bottomLeft.png`,
  bottomRight: `${BASE}/panel/corner/bottomRight.png`,
  ...PANEL_BORDER,
  bg: `${BASE}/panel/bg/2.png`, // side/freeform per the user's spec
};

/** OSRSPanel's `borderType="steel"` — the bolder 32x32-corner frame. Works for side/freeform or
 *  bank. NOTE: this reuses the boldest asset set actually supplied so far (panel/corner/full/*)
 *  as a placeholder for true bank-interface chrome (skull/gargoyle corner ornaments, matching
 *  the reference screenshot), which hasn't been supplied yet — same situation as the tile
 *  `type="black"` variant below. */
export const PANEL_ASSETS_STEEL: RSPanelAssets = {
  cornerWidth: 32,
  cornerHeight: 32,
  borderThickness: 7,
  topLeft: `${BASE}/panel/corner/full/topLeft.png`,
  topRight: `${BASE}/panel/corner/full/topRight.png`,
  bottomLeft: `${BASE}/panel/corner/full/bottomLeft.png`,
  bottomRight: `${BASE}/panel/corner/full/bottomRight.png`,
  ...PANEL_BORDER,
  bg: `${BASE}/panel/bg/2.png`, // side/freeform per the user's spec (a "bank" consumer would
  // want a variant of this with bg/1.png instead — not needed yet, nothing uses type="bank").
};

function slotTileAssets(dirName: 'grey' | 'red'): RSTileAssets {
  const dir = `${BASE}/tile/${dirName}`;
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

/** Keyed by OSRSTile's `type` prop values (gray/red) — the asset folders themselves are named
 *  "grey" (as supplied), only the TS-facing key spelling differs. No "black" entry yet — that
 *  tile art hasn't been supplied. */
export const TILE_ASSETS = {
  gray: slotTileAssets('grey'),
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
 *  square corners, so they're kept as their own flat set rather than forced into RSPanelAssets. */
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
