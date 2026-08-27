import { colors, fontSerif } from '../../theme';
import { gs } from './guideTheme';
import { useGuideMeta } from './useGuideMeta';

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

type Guide = {
  href: string;
  title: string;
  desc: string;
  meta: string;
};

const setupGuides: Guide[] = [
  {
    href: '/guides/normal-knight-setup',
    title: 'Setting up a normal knight at South Ardougne bank',
    desc: 'How to find a Knight of Ardougne patrol point near the bank, aggro it against an obstacle, and keep it splashing for as long as you’re actively casting.',
    meta: 'Setup guide · Needs an alt account',
  },
  {
    href: '/guides/sticky-knight-setup',
    title: 'Setting up a sticky knight at South Ardougne bank',
    desc: 'The advanced Entangle + dragon spear method for trapping a knight in a corner permanently, so it stays splashable even with nobody actively casting on it.',
    meta: 'Setup guide · needs an alt account',
  },
];

const otherGuides: Guide[] = [
  {
    href: '/guides/splash-helper-plugin',
    title: 'Installing and configuring the Splash Helper plugin',
    desc: 'Install the RuneLite plugin, set up the combat idle timer and notifications, and use its built-in interactive sticky-knight setup guide.',
    meta: 'Plugin guide',
  },
  {
    href: '/guides/pickpocketing',
    title: 'How to pickpocket a splashed Knight of Ardougne',
    desc: 'Just want to train Thieving? What you need, why it’s safe, and how to find a live splash world right now.',
    meta: 'Player guide · no setup required',
  },
];

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
        <GuideCard guide={otherGuides[1]} />
      </div>

      <p style={s.sectionLabel}>Setup guides</p>
      <div style={s.grid}>
        {setupGuides.map((g) => <GuideCard key={g.href} guide={g} />)}
      </div>

      <p style={s.sectionLabel}>Tools</p>
      <div style={s.grid}>
        <GuideCard guide={otherGuides[0]} />
      </div>

      <p style={{ ...s.p, marginTop: '2rem' }}>
        Or skip the guides and <a style={s.a} href="/">see who’s splashing right now</a>.
      </p>
    </div>
  );
}
