import { colors, fontSerif } from '../../../theme';
import { type Guide } from '../data/guidesCatalog';
import '../style/GuideShell.css';

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

export function GuideButtons({ guides }: { guides: Guide[] }) {
  if (guides.length === 0) return null;

  return (
    <div style={s.row}>
      {guides.map((guide) => (<GuideButton key={guide.href} guide={guide} />))}
    </div>
  );
}
