import type { CSSProperties, ReactNode } from 'react';
import type { NineSliceAssets } from '../utils/gearpickerAssets';

const borderBase: CSSProperties = {
  position: 'absolute',
  imageRendering: 'pixelated',
};

const cornerBase: CSSProperties = {
  position: 'absolute',
  imageRendering: 'pixelated',
  backgroundRepeat: 'no-repeat',
};

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
 */
export default function NineSlicePanel({ assets, style, bgStyle, children }: Props) {
  const { borderThickness, cornerWidth, cornerHeight } = assets;
  return (
    <div style={{ position: 'relative', ...style }}>
      <div
        style={{
          position: 'absolute',
          inset: borderThickness,
          backgroundImage: `url(${assets.bg})`,
          backgroundRepeat: 'repeat',
          imageRendering: 'pixelated',
        }}
      />

      <div
        style={{
          ...borderBase,
          top: 0,
          left: 0,
          right: 0,
          height: borderThickness,
          backgroundImage: `url(${assets.top})`,
          backgroundRepeat: 'repeat-x',
        }}
      />
      <div
        style={{
          ...borderBase,
          bottom: 0,
          left: 0,
          right: 0,
          height: borderThickness,
          backgroundImage: `url(${assets.bottom})`,
          backgroundRepeat: 'repeat-x',
        }}
      />
      <div
        style={{
          ...borderBase,
          left: 0,
          top: 0,
          bottom: 0,
          width: borderThickness,
          backgroundImage: `url(${assets.left})`,
          backgroundRepeat: 'repeat-y',
        }}
      />
      <div
        style={{
          ...borderBase,
          right: 0,
          top: 0,
          bottom: 0,
          width: borderThickness,
          backgroundImage: `url(${assets.right})`,
          backgroundRepeat: 'repeat-y',
        }}
      />

      <div
        style={{
          ...cornerBase,
          top: 0,
          left: 0,
          width: cornerWidth,
          height: cornerHeight,
          margin: '1px 0 0 1px',
          backgroundImage: `url(${assets.topLeft})`,
        }}
      />
      <div
        style={{
          ...cornerBase,
          top: 0,
          right: 0,
          width: cornerWidth,
          height: cornerHeight,
          margin: '1px 1px 0 0',
          backgroundImage: `url(${assets.topRight})`,
        }}
      />
      <div
        style={{
          ...cornerBase,
          bottom: 0,
          left: 0,
          width: cornerWidth,
          height: cornerHeight,
          margin: '0 0 1px 1px',
          backgroundImage: `url(${assets.bottomLeft})`,
        }}
      />
      <div
        style={{
          ...cornerBase,
          bottom: 0,
          right: 0,
          width: cornerWidth,
          height: cornerHeight,
          margin: '0 1px 1px 0',
          backgroundImage: `url(${assets.bottomRight})`,
        }}
      />

      <div
        style={{
          position: 'relative',
          boxSizing: 'border-box',
          width: '100%',
          height: '100%',
          padding: borderThickness,
          ...bgStyle,
        }}
      >
        {children}
      </div>
    </div>
  );
}
