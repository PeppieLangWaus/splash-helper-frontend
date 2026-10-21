import type { CSSProperties, ReactNode } from 'react';
import './OSRSTile.css';

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

  square: { width: 36, height: 36 },

  normal: { width: 36, height: 32 },

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

  sizeType?: OSRSTileSize;

  contentType: OSRSTileContentType;
}

export default function OSRSTile({ assets, content, type, width, height, sizeType, contentType }: Props) {
  const preset = SIZE_PRESETS[sizeType ?? 'normal'];
  const cssWidth = toCssSize(width) ?? `${preset.width}px`;
  const cssHeight = toCssSize(height) ?? `${preset.height}px`;

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
      </div>
      {contentType === 'equipment' && <div className="osrs-tile__equipment-icon">{content}</div>}
      {contentType === 'text' && <div className="osrs-tile__content">{content}</div>}
    </div>
  );
}
