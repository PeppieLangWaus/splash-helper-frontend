import { forwardRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import './OSRSPanel.css';

export interface RSPanelAssets {

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

export type OSRSPanelType = 'side' | 'bank' | 'freeform';
export type OSRSPanelBorderType = 'stone' | 'steel';

const SIDE_PANEL_RATIO = 407 / 549;

function toCssSize(value: string | number | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
}

interface Props {
  assets: RSPanelAssets;

  width: string | number;

  height?: string | number;
  content: ReactNode;

  header?: ReactNode;

  headerDivider?: string;
  borderType: OSRSPanelBorderType;
  type: OSRSPanelType;
  className?: string;
}

const OSRSPanel = forwardRef<HTMLDivElement, Props>(function OSRSPanel(
  { assets, width, height, content, header, headerDivider, borderType, type, className },
  ref,
) {
  if (import.meta.env.DEV && borderType === 'stone' && type === 'bank') {
    console.warn('OSRSPanel: borderType="stone" is side/freeform-only — bank panels require "steel".');
  }

  const sizeStyle: CSSProperties = { width: toCssSize(width) };
  if (type === 'side' && height === undefined) {
    if (typeof width === 'number') {
      sizeStyle.minHeight = `${width / SIDE_PANEL_RATIO}px`;
    } else {
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
    <div ref={ref} className={`osrs-panel osrs-panel--${type}`} style={{ ...cssVars, ...sizeStyle }}>
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
        {type === 'bank' && header !== undefined && (
          <div className="osrs-panel__header" style={{ backgroundImage: `url(${headerDivider ?? assets.bottom})` }}>
            {header}
          </div>
        )}
        <div className={"osrs-panel__content" + (className ? ` ${className}` : "")}>{content}</div>
      </div>
    </div>
  );
});

export default OSRSPanel;
