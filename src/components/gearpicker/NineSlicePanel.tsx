import type { CSSProperties, ReactNode } from 'react';
import type { NineSliceAssets } from './gearpickerAssets';

interface Props {
  assets: NineSliceAssets;
  style?: CSSProperties;
  bgStyle?: CSSProperties;
  children?: ReactNode;
}

/**
 * A 9-slice image-bordered panel. Border strips render at native size and span the full outer
 * edge (not carved short to make room for corners); the 4 corner images are layered on top of
 * them afterward, each inset 1px along the two edges it touches (e.g. the top-left corner gets
 * margin-top/margin-left: 1px) so the corner art sits flush against the border beneath it rather
 * than exactly overlapping its outer pixel row/column. Nothing here is stretched — every piece
 * renders at its own native resolution.
 *
 * Sizing: the "content" layer (padded by borderThickness, border-box) is the only normal-flow
 * element, so it drives the panel's overall size the same way any ordinary box would — shrinking
 * to fit its children when no explicit size is given (as used for the outer panel frame in
 * GearPickerView), or filling an explicit size passed via `style` (as SlotTile does, fixing
 * every slot to the same 36x36 regardless of content). The background/border/corner layers are
 * absolutely positioned to match whatever size that resolves to.
 *
 * Layout/positioning lives in gearpicker.css (.nine-slice*); only the per-instance asset URLs and
 * numeric dimensions (which vary between the outer panel and a slot tile) are set inline, the
 * latter via CSS custom properties the stylesheet reads with var().
 */
export default function NineSlicePanel({ assets, style, bgStyle, children }: Props) {
  const { borderThickness, cornerWidth, cornerHeight } = assets;
  const cssVars = {
    '--ns-border-thickness': `${borderThickness}px`,
    '--ns-corner-width': `${cornerWidth}px`,
    '--ns-corner-height': `${cornerHeight}px`,
  } as CSSProperties;

  return (
    <div className="nine-slice" style={{ ...cssVars, ...style }}>
      <div className="nine-slice__bg" style={{ backgroundImage: `url(${assets.bg})` }} />

      <div className="nine-slice__border nine-slice__border--top" style={{ backgroundImage: `url(${assets.top})` }} />
      <div className="nine-slice__border nine-slice__border--bottom" style={{ backgroundImage: `url(${assets.bottom})` }} />
      <div className="nine-slice__border nine-slice__border--left" style={{ backgroundImage: `url(${assets.left})` }} />
      <div className="nine-slice__border nine-slice__border--right" style={{ backgroundImage: `url(${assets.right})` }} />

      <div className="nine-slice__corner nine-slice__corner--tl" style={{ backgroundImage: `url(${assets.topLeft})` }} />
      <div className="nine-slice__corner nine-slice__corner--tr" style={{ backgroundImage: `url(${assets.topRight})` }} />
      <div className="nine-slice__corner nine-slice__corner--bl" style={{ backgroundImage: `url(${assets.bottomLeft})` }} />
      <div className="nine-slice__corner nine-slice__corner--br" style={{ backgroundImage: `url(${assets.bottomRight})` }} />

      <div className="nine-slice__content" style={bgStyle}>
        {children}
      </div>
    </div>
  );
}
