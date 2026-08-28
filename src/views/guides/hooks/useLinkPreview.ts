import { useCallback, useEffect, useRef, useState } from 'react';
import { getLinkPreview } from '../../../api';
import type { LinkPreviewResult } from '../../../types/linkPreview';

export type LinkPreviewStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface LinkPreviewState {
  status: LinkPreviewStatus;
  result?: LinkPreviewResult;
  /** Wire to the anchor's onMouseEnter/onFocus — debounced, so a quick mouse pass-through never
   *  triggers a request. Cheap to call repeatedly; it no-ops once already loading/loaded. */
  request: () => void;
  /** Wire to the anchor's onMouseLeave/onBlur — cancels a debounce that hasn't fired yet. Does
   *  nothing once a request is already in flight or resolved (no point aborting a fetch that's
   *  this close to done, and the result gets cached for next time regardless). */
  cancel: () => void;
}

// Shared across every <LinkPreview> instance on the page, so hovering the same link twice — even
// from two different components — only ever fetches once per page load. The backend already
// caches per-TTL (splash-helper-backend's LinkPreviewCache), this just saves the round trip
// entirely for a link already resolved this session.
const cache = new Map<string, LinkPreviewResult>();
const inFlight = new Map<string, Promise<LinkPreviewResult>>();

// Roughly matches "hover to actually read it" intent rather than a cursor merely passing over the
// link on its way somewhere else.
const DEBOUNCE_MS = 200;

async function resolve(url: string): Promise<LinkPreviewResult> {
  const cached = cache.get(url);
  if (cached) return cached;

  let promise = inFlight.get(url);
  if (!promise) {
    promise = getLinkPreview(url)
      .catch((): LinkPreviewResult => ({ type: 'unsupported' }))
      .finally(() => inFlight.delete(url));
    inFlight.set(url, promise);
  }

  const result = await promise;
  cache.set(url, result);
  return result;
}

/** Lazily resolves a URL to Discord-style preview data. Nothing is fetched until `request()`
 *  fires — see LinkPreview.tsx for the anchor + tooltip this backs. */
export function useLinkPreview(url: string): LinkPreviewState {
  const [status, setStatus] = useState<LinkPreviewStatus>(() => (cache.has(url) ? 'ready' : 'idle'));
  const [result, setResult] = useState<LinkPreviewResult | undefined>(() => cache.get(url));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestedRef = useRef(false);

  // Cleanup only — this hook assumes `url` stays fixed for its instance's lifetime, which holds
  // for every current caller (a <LinkPreview href> is always a static literal). If a future caller
  // ever needs to swap the href on a live instance, mount a fresh one instead via `key={href}`
  // rather than teaching this hook to reset itself mid-life.
  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const request = useCallback(() => {
    const cached = cache.get(url);
    if (cached) {
      setResult(cached);
      setStatus('ready');
      return;
    }
    // A fetch is already scheduled or in flight for this instance — let it run rather than
    // stacking another timer/request on top.
    if (requestedRef.current || timerRef.current) return;

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      requestedRef.current = true;
      setStatus('loading');
      resolve(url)
        .then((r) => {
          setResult(r);
          setStatus('ready');
        })
        .catch(() => setStatus('error'));
    }, DEBOUNCE_MS);
  }, [url]);

  return { status, result, request, cancel };
}
