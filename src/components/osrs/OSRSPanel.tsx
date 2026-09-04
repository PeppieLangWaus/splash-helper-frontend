import type { CSSProperties, ReactNode } from 'react';
import './OSRSPanel.css';

/** A 9-slice panel asset bundle: 4 corners + 4 repeating borders + 1 tiled background. */
export interface RSPanelAssets {
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

export type OSRSPanelType = 'side' | 'bank' | 'freeform';
export type OSRSPanelBorderType = 'stone' | 'steel';

/** Width:height ratio of the Active Splashers session panel
 *  (SessionPanel.css's `aspect-ratio: 407 / 549`) — `type="side"` locks to this ratio so a side
 *  panel reads as the same shape as that panel, for whenever it's converted to use OSRSPanel
 *  too. */
const SIDE_PANEL_RATIO = 407 / 549; // width / height

function toCssSize(value: string | number | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
}

interface Props {
  assets: RSPanelAssets;
  /** Required — pass a literal CSS value like `"fit-content"` for shrink-to-content sizing (used
   *  by `type="freeform"` with no explicit width in mind). */
  width: string | number;
  /** Omit to derive it: ratio-locked for `type="side"`, shrink-to-content otherwise. */
  height?: string | number;
  content: ReactNode;
  /** `header` is only rendered for `type="bank"`. */
  header?: ReactNode;
  borderType: OSRSPanelBorderType;
  type: OSRSPanelType;
}

/**
 * A reusable OSRS-chrome panel built from a 9-slice asset set — the generic replacement for the
 * gear-picker-only NineSlicePanel, so it can front other OSRS-styled surfaces later too (e.g.
 * the Active Splashers session panel — see SessionPanel.tsx/.css — which is currently its own
 * bespoke `border-image` implementation, not built on this component yet).
 *
 * - `type="side"` locks to the session panel's own aspect ratio (407:549) when `height` is
 *   omitted and `width` is a plain number — give just a width and the height follows.
 * - `type="freeform"` is shaped like `"side"` (no header) but never ratio-constrained: give both
 *   dimensions, or pass `width="fit-content"` with `height` omitted to shrink-wrap the content
 *   (`width` itself is always required, but accepts any CSS value, not just a pixel size).
 * - `type="bank"` is the larger bank-interface style with a header row (`header` prop). Must use
 *   `borderType="steel"` — `"stone"` is side/freeform-only.
 */
export default function OSRSPanel({ assets, width, height, content, header, borderType, type }: Props) {
  if (import.meta.env.DEV && borderType === 'stone' && type === 'bank') {
    console.warn('OSRSPanel: borderType="stone" is side/freeform-only — bank panels require "steel".');
  }

  const sizeStyle: CSSProperties = { width: toCssSize(width) };
  if (type === 'side' && height === undefined) {
    if (typeof width === 'number') {
      sizeStyle.height = `${width / SIDE_PANEL_RATIO}px`;
    } else {
      // A non-numeric width (e.g. a percentage) can't be ratio-derived in JS — fall back to the
      // CSS aspect-ratio property, which works for any resolved width.
      sizeStyle.aspectRatio = `${SIDE_PANEL_RATIO}`;
    }
  } else if (height !== undefined) {
    sizeStyle.height = toCssSize(height);
  }

  const cssVars = {
    '--rp-border-thickness': `${assets.borderThickness}px`,
    '--rp-corner-width': `${assets.cornerWidth}px`,
    '--rp-corner-height': `${assets.cornerHeight}px`,
  } as CSSProperties;

  return (
    <div className={`osrs-panel osrs-panel--${type}`} style={{ ...cssVars, ...sizeStyle }}>
      <div className="osrs-panel__bg-container">
        <div className="osrs-panel__bg" style={{ backgroundImage: `url(${assets.bg})` }} />
        <div className="osrs-panel__border osrs-panel__border--top" style={{ backgroundImage: `url(${assets.top})` }} />
        <div className="osrs-panel__border osrs-panel__border--bottom" style={{ backgroundImage: `url(${assets.bottom})` }} />
        <div className="osrs-panel__border osrs-panel__border--left" style={{ backgroundImage: `url(${assets.left})` }} />
        <div className="osrs-panel__border osrs-panel__border--right" style={{ backgroundImage: `url(${assets.right})` }} />
        <div className="osrs-panel__corner osrs-panel__corner--tl" style={{ backgroundImage: `url(${assets.topLeft})` }} />
        <div className="osrs-panel__corner osrs-panel__corner--tr" style={{ backgroundImage: `url(${assets.topRight})` }} />
        <div className="osrs-panel__corner osrs-panel__corner--bl" style={{ backgroundImage: `url(${assets.bottomLeft})` }} />
        <div className="osrs-panel__corner osrs-panel__corner--br" style={{ backgroundImage: `url(${assets.bottomRight})` }} />
      </div>
      <div className="osrs-panel__inner">
        {type === 'bank' && header !== undefined && <div className="osrs-panel__header">{header}</div>}
        <div className="osrs-panel__content">{content}</div>
      </div>
    </div>
  );
}
