import { colors, fontSerif } from '../../../theme';
import { type Guide } from '../data/guidesCatalog';
import '../style/GuideShell.css';

/** Compact link-button for pointing at another guide inline — title + meta only, no
 *  description. For the fuller card treatment (with description) see the guides hub,
 *  GuidesView.tsx. Looks up guides from the shared catalog by href. Hover treatment lives in
 *  GuideShell.css (`.guide-link-btn`) since inline styles can't express `:hover`. */
const s = {
  row: { display: 'flex', flexWrap: 'wrap' as const, gap: '0.6rem' },
  button: {
    display: 'inline-flex',
    flexDirection: 'column' as const,
    gap: '0.2rem',
    background: colors.panel,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    padding: '0.6rem 0.95rem',
    textDecoration: 'none',
  },
  title: { fontFamily: fontSerif, fontSize: '0.85rem', fontWeight: 700, color: colors.text },
  meta: { color: colors.textFaint, fontSize: '0.72rem', fontWeight: 600 },
} as const;

export function GuideButton({ guide }: { guide: Guide }) {
  return (
    <a href={guide.href} className="guide-link-btn" style={s.button}>
      <span style={s.title}>{guide.title}</span>
      <span style={s.meta}>{guide.meta}</span>
    </a>
  );
}

/** Row of `GuideButton`s, resolved from the shared catalog by href. Unknown hrefs are
 *  silently skipped; renders nothing if none resolve. */
export function GuideButtons({ guides }: { guides: Guide[] }) {
  if (guides.length === 0) return null;

  return (
    <div style={s.row}>
      {guides.map((guide) => (<GuideButton key={guide.href} guide={guide} />))}
    </div>
  );
}
