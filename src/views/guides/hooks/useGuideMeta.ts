import { useEffect } from 'react';

type GuideMetaOptions = {

  title: string;

  description: string;

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
