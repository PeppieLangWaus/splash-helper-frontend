import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { colors, fontSerif } from '../../../theme';
import '../styling/GuideShell.css';

type Heading = { id: string; text: string; level: 2 | 3; branch: boolean };

const s = {
  wrap: { maxWidth: 1040, margin: '0 auto', padding: '0 1.25rem', display: 'flex', gap: '2.5rem', alignItems: 'flex-start' as const },
  content: { flex: '1 1 0%', minWidth: 0 },
  tocLabel: { color: colors.textFaint, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', margin: '2.5rem 0 0.75rem' },
  tocList: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' as const },
  tocLink: (active: boolean) => ({
    display: 'block',
    padding: '0.32rem 0 0.32rem 0.8rem',
    borderLeft: `2px solid ${active ? colors.accent : colors.border}`,
    fontSize: '0.82rem',
    lineHeight: 1.4,
    fontFamily: fontSerif,
    textDecoration: 'none',
    color: active ? colors.accentText : colors.textMuted,
    fontWeight: active ? 700 : 400,
    transition: 'color 0.15s, border-color 0.15s',
  }),
  branch: (active: boolean): CSSProperties | undefined => ({ 
    display: 'inline-block',
    position: 'relative',
    top: '-.05em',
    left: '-1em',
    marginRight: '-.65em',
    width: '1.5em',
    height: '2px',
    backgroundColor: `${active ? colors.accent : colors.border}`,
    verticalAlign: 'middle'
  }),
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '') || 'section';
}

/**
 * Wraps a guide page's content with a sticky, scroll-spied table of contents to its left,
 * auto-built from the `h2`/`h3` elements rendered inside `children`. Falls back to no sidebar
 * (content alone, unchanged width) when there aren't enough headings to bother with, and hides
 * itself below the `GuideShell.css` breakpoint where there isn't room for both columns.
 */
export default function GuideShell({ children }: { children: ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Discover headings after the guide content renders, and stamp ids onto them for anchoring.
  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;
    const nodes = Array.from(root.querySelectorAll('h2, h3')) as HTMLElement[];
    const used = new Set<string>();
    const levels = nodes.map((node) => (node.tagName === 'H3' ? 3 : 2) as 2 | 3);
    const list: Heading[] = nodes.map((node, i) => {
      const base = slugify(node.textContent || '');
      let id = base;
      let n = 2;
      while (used.has(id)) id = `${base}-${n++}`;
      used.add(id);
      node.id = id;
      
      return { id, text: node.textContent || '', level: levels[i], branch: levels[i] == 3 ? true : false };
    });
    setHeadings(list);

    // The browser's native #hash jump (on initial load, or Back/Forward) fires before these
    // ids exist, so it lands at the top of the page. Redo it now that anchors are in place.
    if (location.hash) {
      const target = document.getElementById(location.hash.slice(1));
      if (target) target.scrollIntoView();
    }
  }, [children]);

  // Highlight whichever heading is currently in the "reading zone" near the top of the viewport.
  // Computed directly off scroll position (rather than IntersectionObserver) so it's correct
  // after both incremental scrolling and instant jumps — e.g. clicking a TOC link, or landing
  // on a #hash directly.
  useEffect(() => {
    if (headings.length === 0) return;
    const update = () => {
      let current = headings[0].id;
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el && el.getBoundingClientRect().top <= 120) current = h.id;
      }
      setActiveId(current);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [headings]);

  const handleClick = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 16;
    window.scrollTo({ top, behavior: 'smooth' });
    history.replaceState(null, '', `#${id}`);
    setActiveId(id);
  };

  return (
    <div style={s.wrap}>
      {headings.length > 1 && (
        <nav className="guide-toc" aria-label="On this page">
          <div style={s.tocLabel}>On this page</div>
          <ul style={s.tocList}>
            {headings.map((h) => (
              <li key={h.id}>
                <a href={`#${h.id}`} onClick={handleClick(h.id)} style={s.tocLink(activeId === h.id)}>
                  {h.branch && <div style={s.branch(activeId === h.id)}></div>}
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <div ref={contentRef} style={s.content}>
        {children}
      </div>
    </div>
  );
}
