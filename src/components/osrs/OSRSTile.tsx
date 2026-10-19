import type { CSSProperties, ReactNode } from 'react';
import './OSRSTile.css';

/** A 9-slice tile asset bundle: 4 corners + 4 repeating borders + 1 tiled background. */
export interface RSTileAssets {
  cornerWidth: number;
  cornerHeight: number;
  borderThickness: number;
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
  top: string;
  bottom: string;
  left: string;
  right: string;
  bg: string;
}

export type OSRSTileType = 'gray' | 'red' | 'black';
export type OSRSTileSize = 'square' | 'normal' | 'wide';
export type OSRSTileContentType = 'equipment' | 'text';

const SIZE_PRESETS: Record<OSRSTileSize, { width: number; height: number }> = {
  // Matches EquipmentDisplay's current slot size.
  square: { width: 36, height: 36 },
  // Matches an item icon's own native render size (splash-helper-backend's
  // render-item-icons.ts renders every icon at 36x32).
  normal: { width: 36, height: 32 },
  // Roughly two square tiles' width, e.g. for a paired stat row.
  wide: { width: 78, height: 36 },
};

function toCssSize(value: string | number | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
}

interface Props {
  assets: RSTileAssets;
  content: ReactNode;
  type: OSRSTileType;
  width?: string | number;
  height?: string | number;
  /** Reference size the chrome assets were designed at — used to scale border-thickness and
   *  corner size proportionally to whatever `width`/`height` actually render at (see `cssVars`
   *  below), and as the literal default size when `width`/`height` are omitted. Always pass this
   *  when giving a responsive `width`/`height` (e.g. a percentage) so the chrome scales along with
   *  it instead of staying pinned to the assets' native pixel size. Defaults to "normal". */
  sizeType?: OSRSTileSize;
  /** "equipment" centers `content` (typically an item icon) over the tile background;
   *  "text" renders it in a padded content area instead. */
  contentType: OSRSTileContentType;
}

/**
 * A reusable OSRS-chrome tile — the generic replacement for the gear-picker-only SlotTile, so it
 * can front other tile-shaped OSRS UI later too (e.g. AllSplashersView's per-stat Tile.tsx,
 * currently its own bespoke implementation against public/assets/icons/components/tile/).
 *
 * `type="black"` has no asset set yet (see gearpickerAssets.ts) — pass whatever placeholder
 * `assets` you want until real black-tile art is supplied.
 */
export default function OSRSTile({ assets, content, type, width, height, sizeType, contentType }: Props) {
  const preset = SIZE_PRESETS[sizeType ?? 'normal'];
  const cssWidth = toCssSize(width) ?? `${preset.width}px`;
  const cssHeight = toCssSize(height) ?? `${preset.height}px`;

  // Expressed as percentages of `preset`'s reference dimensions (not cssWidth/cssHeight, which
  // may be an unresolved value like "100%") so borders/corners scale proportionally with however
  // big the tile actually renders, instead of staying pinned to a fixed native-asset pixel size.
  const cssVars = {
    '--rt-border-thickness-x': `${(assets.borderThickness / preset.width) * 100}%`,
    '--rt-border-thickness-y': `${(assets.borderThickness / preset.height) * 100}%`,
    '--rt-corner-width': `${(assets.cornerWidth / preset.width) * 100}%`,
    '--rt-corner-height': `${(assets.cornerHeight / preset.height) * 100}%`,
  } as CSSProperties;

  return (
    <div className={`osrs-tile osrs-tile--${type}`} style={{ ...cssVars, width: cssWidth, height: cssHeight }}>
      <div className="osrs-tile__bg-container">
        <div className="osrs-tile__bg" style={{ backgroundImage: `url(${assets.bg})` }} />
        <div className="osrs-tile__border osrs-tile__border--top" style={{ backgroundImage: `url(${assets.top})` }} />
        <div className="osrs-tile__border osrs-tile__border--bottom" style={{ backgroundImage: `url(${assets.bottom})` }} />
        <div className="osrs-tile__border osrs-tile__border--left" style={{ backgroundImage: `url(${assets.left})` }} />
        <div className="osrs-tile__border osrs-tile__border--right" style={{ backgroundImage: `url(${assets.right})` }} />
        <div className="osrs-tile__corner osrs-tile__corner--tl" style={{ backgroundImage: `url(${assets.topLeft})` }} />
        <div className="osrs-tile__corner osrs-tile__corner--tr" style={{ backgroundImage: `url(${assets.topRight})` }} />
        <div className="osrs-tile__corner osrs-tile__corner--bl" style={{ backgroundImage: `url(${assets.bottomLeft})` }} />
        <div className="osrs-tile__corner osrs-tile__corner--br" style={{ backgroundImage: `url(${assets.bottomRight})` }} />
        {contentType === 'equipment' && <div className="osrs-tile__equipment-icon">{content}</div>}
      </div>
      {contentType === 'text' && <div className="osrs-tile__content">{content}</div>}
    </div>
  );
}
