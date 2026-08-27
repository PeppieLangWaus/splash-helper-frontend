import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { colors } from '../theme';
import type { MapPath, MapRectangle } from '../types/explvMap';

/** Base URL of Explv's Map (../Explv-s-map — see repo README). Configurable via
 *  VITE_EXPLV_MAP_URL since it's a separately-hosted static site, not part of this app;
 *  defaults to the local dev instance (`npm run dev` in that repo runs on :3003). */
const MAP_BASE_URL = (import.meta.env.VITE_EXPLV_MAP_URL as string | undefined) || 'http://localhost:3003';
const MAP_ORIGIN = new URL(MAP_BASE_URL).origin;

/** Matches Explv-s-map's `js/embed_overlays.js` — must stay in sync with it. */
const MESSAGE_SOURCE = 'explv-map-embed';

export interface ExplvMapProps {
  /** OSRS world-point to centre the map on, e.g. `{ x: 2648, y: 3289, plane: 0 }`.
   *  Takes precedence over `regionId` if both are given. Omit both to load the map's own default view. */
  centre?: { x: number; y: number; plane?: number };
  /** Game map region ID to centre on instead of explicit coordinates. Ignored if `centre` is set. */
  regionId?: number;
  /** Leaflet zoom level. Omit to use the map's own default (7, or 9 when centred via `regionId`). */
  zoom?: number;
  /** Show the map's built-in UI (zoom buttons, plane switcher, search, coordinates readout, etc). Default: true. */
  showControls?: boolean;
  showLabels?: boolean;
  /** Dax paths to draw on the map as lines, e.g. fetched via src/api/pathfinder.ts's `findDaxPath`. */
  paths?: MapPath[];
  /** Rectangular areas to draw on the map. */
  rectangles?: MapRectangle[];
  /** Optional short caption shown as a semi-transparent black bar across the top of the map,
   *  e.g. to describe the path/area currently drawn. */
  description?: string;
  /** Accessible label for the embed. */
  title?: string;
  className?: string;
  style?: CSSProperties;
  /** CSS height of the embed. Default: 480px. */
  height?: number | string;
  width?: number | string;
}

/** Embeds Explv's Map (an OSRS world-map viewer) as an iframe, passing through only the
 *  query params it needs to reach the requested view. See that repo's `js/map.js` for the
 *  full param list this mirrors.
 *
 *  `paths`/`rectangles` are relayed into the embed via `postMessage` once it signals it's
 *  ready (see that repo's `js/embed_overlays.js`) — the map has no way to accept drawable
 *  data through the URL, and a plain query param can't carry an arbitrarily long path anyway. */
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
  // The src that the last "ready" message from the embed was received for — compared against
  // the current src rather than tracked as a plain boolean, so a src change (which reloads the
  // iframe) implicitly goes back to "not ready" without an extra effect to reset it.
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

  // Any src change reloads the iframe, so the "ready" handshake (see MESSAGE_SOURCE above)
  // has to happen again before it's safe to post overlay data at it.
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
