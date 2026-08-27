import { useEffect } from 'react';

type GuideMetaOptions = {
  /** Document title, also used for og:title / twitter:title. */
  title: string;
  /** Meta description, also used for og:description / twitter:description. */
  description: string;
  /** Path only, e.g. '/guides/sticky-knight-setup' — combined with the site origin for canonical/og:url. */
  path: string;
};

function upsertMeta(attrName: 'name' | 'property', attrValue: string, content: string): () => void {
  let el = document.head.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
  const existed = !!el;
  const prevContent = el?.getAttribute('content') ?? null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
  return () => {
    if (!el) return;
    if (existed && prevContent !== null) el.setAttribute('content', prevContent);
    else el.remove();
  };
}

function upsertCanonical(href: string): () => void {
  let el = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  const existed = !!el;
  const prevHref = el?.getAttribute('href') ?? null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
  return () => {
    if (!el) return;
    if (existed && prevHref !== null) el.setAttribute('href', prevHref);
    else el.remove();
  };
}

/**
 * Sets document title + meta description + canonical + OG/Twitter tags for a standalone
 * content page, restoring whatever was there before on unmount.
 *
 * This is a client-side patch only — index.html ships one hardcoded set of tags (the
 * homepage's), and there's no SSR/prerendering in this app. It fixes what a JS-executing
 * crawler (Googlebot) and in-app navigation see; it does NOT fix raw-HTML scrapers or most
 * link-preview/social-share bots, which read index.html directly and will still show the
 * homepage's title/description for every guide URL. See the SEO notes for options here
 * (prerendering per route is the real fix).
 */
export function useGuideMeta({ title, description, path }: GuideMetaOptions) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;
    const url = `https://ardy.host${path}`;
    const cleanups = [
      upsertMeta('name', 'description', description),
      upsertCanonical(url),
      upsertMeta('property', 'og:title', title),
      upsertMeta('property', 'og:description', description),
      upsertMeta('property', 'og:url', url),
      upsertMeta('name', 'twitter:title', title),
      upsertMeta('name', 'twitter:description', description),
    ];
    return () => {
      document.title = prevTitle;
      cleanups.forEach((fn) => fn());
    };
  }, [title, description, path]);
}
