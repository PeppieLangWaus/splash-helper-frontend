import type { CSSProperties, ReactNode } from 'react';
import './Tile.css';

const CORNER_SIZE = 8;
const EDGE_SIZE = 4;

type TileProps = {
  width?: number | string;
  height?: number | string;
  /** Integer pixel scale for the corner/edge sprites (border stays crisp, doesn't stretch). */
  scale?: number;
  className?: string;
  contentClassName?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

export default function Tile({
  width,
  height,
  scale = 1,
  className,
  contentClassName,
  style,
  children,
}: TileProps) {
  const corner = CORNER_SIZE * scale;
  const edge = EDGE_SIZE * scale;

  return (
    <div className={`tile ${className ?? ''}`} style={{ width, height, ...style }}>
      <div className="tile-bg">
        <div className="tile-corner tile-corner-top-left" style={{ width: corner, height: corner }} />
        <div className="tile-corner tile-corner-top-right" style={{ width: corner, height: corner }} />
        <div className="tile-corner tile-corner-bottom-left" style={{ width: corner, height: corner }} />
        <div className="tile-corner tile-corner-bottom-right" style={{ width: corner, height: corner }} />

        <div
          className="tile-edge tile-edge-top"
          style={{ left: corner, right: corner, height: edge, backgroundSize: `${edge}px ${edge}px` }}
        />
        <div
          className="tile-edge tile-edge-bottom"
          style={{ left: corner, right: corner, height: edge, backgroundSize: `${edge}px ${edge}px` }}
        />
        <div
          className="tile-edge tile-edge-left"
          style={{ top: corner, bottom: corner, width: edge, backgroundSize: `${edge}px ${edge}px` }}
        />
        <div
          className="tile-edge tile-edge-right"
          style={{ top: corner, bottom: corner, width: edge, backgroundSize: `${edge}px ${edge}px` }}
        />

        <div
          className="tile-bg-fill"
          style={{ backgroundSize: `${edge}px ${edge}px` }}
        />
      </div>

      {children != null && <div className={`tile-content ${contentClassName ?? ''}`}>{children}</div>}
    </div>
  );
}
