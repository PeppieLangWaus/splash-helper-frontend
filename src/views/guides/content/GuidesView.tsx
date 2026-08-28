import { colors, fontSerif } from '../../../theme';
import { gs } from '../style/guideTheme';
import { useGuideMeta } from '../hooks/useGuideMeta';
import { guides, type Guide} from '../data/guidesCatalog';

const s = {
  ...gs,
  sectionLabel: { color: colors.textFaint, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', margin: '2rem 0 0.75rem' },
  grid: { display: 'flex', flexDirection: 'column' as const, gap: '0.75rem' },
  card: {
    display: 'block',
    background: colors.panel,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    padding: '1.1rem 1.25rem',
    textDecoration: 'none',
  },
  cardTitle: { fontFamily: fontSerif, fontSize: '1.05rem', fontWeight: 700, color: colors.text, marginBottom: '0.3rem' },
  cardDesc: { color: colors.textMuted, fontSize: '0.85rem', lineHeight: 1.55 },
  cardMeta: { color: colors.textFaint, fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 600 },
};

function GuideCard({ guide }: { guide: Guide }) {
  return (
    <a href={guide.href} style={s.card}>
      <div style={s.cardTitle}>{guide.title}</div>
      <div style={s.cardDesc}>{guide.desc}</div>
      <div style={s.cardMeta}>{guide.meta}</div>
    </a>
  );
}

export default function GuidesView() {
  useGuideMeta({
    title: 'OSRS Ardougne Knight Splashing Guides | Ardy Host',
    description: 'Guides for OSRS Ardougne Knight splashing: setting up a normal or sticky knight at South Ardougne bank, installing the Splash Helper plugin, and pickpocketing for Thieving XP.',
    path: '/guides',
  });

  return (
    <div style={s.container}>
      <a href="/" style={s.back}>&larr; Ardy Host</a>
      <h1 style={s.heading}>Guides</h1>
      <p style={s.intro}>
        Everything you need to splash or pickpocket Knights of Ardougne, from setting up your
        own spot at the South Ardougne bank to configuring the Splash Helper plugin. Pick a
        guide below.
      </p>

      <p style={s.sectionLabel}>Just here to thieve?</p>
      <div style={s.grid}>
        <GuideCard guide={guides.pickpocket[0]} />
      </div>

      <p style={s.sectionLabel}>Pickpocketing setups</p>
      <div style={s.grid}>
        {guides.pickpocketSetup.map((g) => <GuideCard key={g.href} guide={g} />)}
      </div>

      <p style={s.sectionLabel}>Splash spot setup guides</p>
      <div style={s.grid}>
        {guides.knightSetup.map((g) => <GuideCard key={g.href} guide={g} />)}
      </div>

      <p style={s.sectionLabel}>Tools &amp; reference</p>
      <div style={s.grid}>
        <GuideCard guide={guides.other[0]} />
        <GuideCard guide={guides.other[1]} />
      </div>

      <p style={{ ...s.p, marginTop: '2rem' }}>
        Or skip the guides and <a style={s.a} href="/">see who’s splashing right now</a>.
      </p>
    </div>
  );
}
