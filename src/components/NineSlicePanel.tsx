import type { CSSProperties, ReactNode } from 'react';
import type { NineSliceAssets } from '../utils/gearpickerAssets';

const wrap = (cornerSize: number): CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: `${cornerSize}px 1fr ${cornerSize}px`,
  gridTemplateRows: `${cornerSize}px 1fr ${cornerSize}px`,
  gridTemplateAreas: '"tl top tr" "left bg right" "bl bottom br"',
});

const corner: CSSProperties = {
  backgroundRepeat: 'no-repeat',
  backgroundSize: '100% 100%',
  imageRendering: 'pixelated',
};

const borderX: CSSProperties = {
  backgroundRepeat: 'repeat-x',
  backgroundSize: 'auto 100%',
  imageRendering: 'pixelated',
};

const borderY: CSSProperties = {
  backgroundRepeat: 'repeat-y',
  backgroundSize: '100% auto',
  imageRendering: 'pixelated',
};

const bg: CSSProperties = {
  gridArea: 'bg',
  backgroundRepeat: 'repeat',
  imageRendering: 'pixelated',
  minWidth: 0,
  minHeight: 0,
};

interface Props {
  assets: NineSliceAssets;
  style?: CSSProperties;
  bgStyle?: CSSProperties;
  children?: ReactNode;
}

/**
 * A 9-slice image-bordered panel: 4 fixed corner images, 4 border images that repeat along one
 * axis (top/bottom horizontally, left/right vertically), and a background image tiled to fill
 * the interior. Used at two scales in the gear picker — the outer panel frame
 * (utils/gearpickerAssets.ts's PANEL_ASSETS) and each individual equipment slot tile
 * (SLOT_TILE_ASSETS.grey/red) — same structure, different asset set and corner size.
 */
export default function NineSlicePanel({ assets, style, bgStyle, children }: Props) {
  return (
    <div style={{ ...wrap(assets.cornerSize), ...style }}>
      <div style={{ ...corner, gridArea: 'tl', backgroundImage: `url(${assets.topLeft})` }} />
      <div style={{ ...borderX, gridArea: 'top', backgroundImage: `url(${assets.top})` }} />
      <div style={{ ...corner, gridArea: 'tr', backgroundImage: `url(${assets.topRight})` }} />
      <div style={{ ...borderY, gridArea: 'left', backgroundImage: `url(${assets.left})` }} />
      <div style={{ ...bg, backgroundImage: `url(${assets.bg})`, ...bgStyle }}>{children}</div>
      <div style={{ ...borderY, gridArea: 'right', backgroundImage: `url(${assets.right})` }} />
      <div style={{ ...corner, gridArea: 'bl', backgroundImage: `url(${assets.bottomLeft})` }} />
      <div style={{ ...borderX, gridArea: 'bottom', backgroundImage: `url(${assets.bottom})` }} />
      <div style={{ ...corner, gridArea: 'br', backgroundImage: `url(${assets.bottomRight})` }} />
    </div>
  );
}
