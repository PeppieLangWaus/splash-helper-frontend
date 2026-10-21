import { useCallback, useEffect, useRef, useState } from 'react';
import { getLinkPreview } from '../../../api';
import type { LinkPreviewResult } from '../../../types/linkPreview';

export type LinkPreviewStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface LinkPreviewState {
  status: LinkPreviewStatus;
  result?: LinkPreviewResult;

  request: () => void;

  cancel: () => void;
}

const cache = new Map<string, LinkPreviewResult>();
const inFlight = new Map<string, Promise<LinkPreviewResult>>();

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

export function useLinkPreview(url: string): LinkPreviewState {
  const [status, setStatus] = useState<LinkPreviewStatus>(() => (cache.has(url) ? 'ready' : 'idle'));
  const [result, setResult] = useState<LinkPreviewResult | undefined>(() => cache.get(url));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestedRef = useRef(false);

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
