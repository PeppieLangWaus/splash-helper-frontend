import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { colors } from '../../../theme';
import type { MapPath, MapRectangle } from '../../../types/explvMap';

const MAP_BASE_URL = (import.meta.env.VITE_EXPLV_MAP_URL as string)
const MAP_ORIGIN = new URL(MAP_BASE_URL).origin;

const MESSAGE_SOURCE = 'explv-map-embed';

export interface ExplvMapProps {

  centre?: { x: number; y: number; plane?: number };

  regionId?: number;

  zoom?: number;

  showControls?: boolean;
  showLabels?: boolean;

  paths?: MapPath[];

  rectangles?: MapRectangle[];

  description?: string;

  title?: string;
  className?: string;
  style?: CSSProperties;

  height?: number | string;
  width?: number | string;
}

export default function ExplvMap({
  centre,
  regionId,
  zoom,
  showControls = true,
  showLabels = true,
  paths,
  rectangles,
  description,
  title = "Explv's Map",
  className,
  style,
  height = 480,
  width = "100%"
}: ExplvMapProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [readySrc, setReadySrc] = useState<string | null>(null);

  const params = new URLSearchParams();

  if (centre) {
    params.set('centreX', String(centre.x));
    params.set('centreY', String(centre.y));
    params.set('centreZ', String(centre.plane ?? 0));
  } else if (regionId !== undefined) {
    params.set('regionID', String(regionId));
  }

  if (zoom !== undefined) {
    params.set('zoom', String(zoom));
  }

  if (!showControls) {
    params.set('controls', 'false');
  }
  if (!showLabels) {
    params.set('labels', 'false');
  }

  const query = params.toString();
  const src = query ? `${MAP_BASE_URL}/?${query}` : `${MAP_BASE_URL}/`;

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== MAP_ORIGIN || event.source !== iframeRef.current?.contentWindow) return;
      if (event.data?.source === MESSAGE_SOURCE && event.data.type === 'ready') {
        setReadySrc(src);
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [src]);

  useEffect(() => {
    if (readySrc !== src) return;
    iframeRef.current?.contentWindow?.postMessage(
      { source: MESSAGE_SOURCE, type: 'set-overlays', paths: paths ?? [], rectangles: rectangles ?? [], description: description ?? '' },
      MAP_ORIGIN,
    );
  }, [readySrc, src, paths, rectangles, description]);

  return (
    <iframe
      ref={iframeRef}
      src={src}
      title={title}
      className={className}
      loading="lazy"
      style={{
        width,
        height,
        border: `1px solid ${colors.border}`,
        borderRadius: 8,
        ...style,
      }}
    />
  );
}
