import type { EquipmentSlot } from '../../types/gear';
import type { RSPanelAssets } from '../osrs/OSRSPanel';
import type { RSTileAssets } from '../osrs/OSRSTile';

/** Asset pack for the gear picker's OSRS-styled chrome. The panel/tile 9-slice chrome itself
 *  lives at the shared public/assets/panel/ and public/assets/tile/ (not gearpicker-specific —
 *  other OSRS-styled surfaces can reuse it); everything else (slot-outline icons, the
 *  blocked-slot badge, splash-safety icons, button icons) stays under public/assets/gearpicker/. */
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

/** OSRSPanel's `borderType="stone"` — 32x32 corners, 7px borders. Side/freeform only. */
export const PANEL_ASSETS_STONE: RSPanelAssets = {
  cornerWidth: 32,
  cornerHeight: 32,
  borderThickness: 7,
  ...panelBorder('stone'),
  bg: `${PANEL_BASE}/bg/2.png`, // side/freeform per the user's spec
};

/** OSRSPanel's `borderType="steel"` — 25x30 corners, 6px borders. Works for side/freeform or
 *  bank; this gear picker only actually uses it for the "bank" bonuses panel. */
export const PANEL_ASSETS_STEEL: RSPanelAssets = {
  cornerWidth: 25,
  cornerHeight: 30,
  borderThickness: 6,
  ...panelBorder('steel'),
  bg: `${PANEL_BASE}/bg/1.png`, // bank per the user's spec
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

/** Keyed by OSRSTile's `type` prop values (gray/red) — the asset folders themselves are named
 *  "grey" (as supplied), only the TS-facing key spelling differs. No "black" entry yet — that
 *  tile art hasn't been supplied. */
export const TILE_ASSETS = {
  gray: slotTileAssets('grey'),
  red: slotTileAssets('red'),
};

/** Outline icon shown in an empty (non-blocked) slot, matching OSRS's own equipment tab. */
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

/** The two plain bar pieces used to draw a connecting rack/spine shape behind the equipment
 *  slot tiles (see EquipmentSlotFrame.tsx) — just a straight horizontal and vertical bar;
 *  corner junctions are formed by simply butting a horizontal and vertical bar up against each
 *  other rather than a dedicated bent-corner image. */
export const CONNECTOR_ASSETS = {
  horizontal: `${PANEL_BASE}/connector/horizontal.png`,
  vertical: `${PANEL_BASE}/connector/vertical.png`,
  barThickness: 6,
};

/** Per-slot uniform scale for SlotTile's icon. Every icon PNG is the same fixed 36x32 canvas
 *  (render-item-icons.ts) regardless of item, so a slot whose icons should read as bigger or
 *  smaller than the others (e.g. weapon vs. ring) needs an explicit multiplier here. */
export const SLOT_ICON_SCALE: Record<EquipmentSlot, number> = {
  head: 1.45,
  cape: 1.45,
  neck: 1.45,
  weapon: 1.45,
  body: 1.45,
  shield: 1.45,
  legs: 1.45,
  hands: 1.45,
  feet: 1.45,
  ring: 1.45,
  ammo: 1.45,
};

export const BLOCKED_ICON = `${ICON_BASE}/blocked.png`;
export const SPLASH_TRUE_ICON = `${ICON_BASE}/splashTrue.png`;
export const SPLASH_FALSE_ICON = `${ICON_BASE}/splashFalse.png`;
export const SEARCH_ICON = `${ICON_BASE}/search.png`;
export const CLEAR_EQUIPMENT_ICON = `${ICON_BASE}/clearEquipment.png`;
export const DELETE_ICON = `${ICON_BASE}/delete.png`;
export const HELP_BUTTON_ICON = `${ICON_BASE}/button/normal/help.png`;
