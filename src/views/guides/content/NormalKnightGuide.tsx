import GuideShell from '../components/GuideShell';
import { gs } from '../style/guideTheme';
import { useGuideMeta } from '../hooks/useGuideMeta';

const steps = [
  {
    title: 'Equipment',
    body: '',
  },
  {
    title: 'Lure the knight',
    body: '',
  },
  {
    title: '(optional) Push knight back into corner',
    body: '',
  },
  {
    title: '(optional) Announce world',
    body: '',
  },
];

export default function NormalKnightGuide() {
  useGuideMeta({
    title: 'Normal Knight Setup Guide (South Ardougne Bank) | Ardy Host',
    description: 'How to set up a normal (non-sticky) Knight of Ardougne splash spot near South Ardougne bank — gear, spell choice, and finding a patrol point to aggro against.',
    path: '/guides/normal-knight-setup',
  });

  return (
    <GuideShell>
      <div style={{ ...gs.container, padding: '2.5rem 0 4rem' }}>
        <a href="/guides" style={gs.back}>&larr; Guides</a>
        <h1 style={gs.heading}>Setting Up a Normal Knight at South Ardougne Bank</h1>
        <p style={gs.updated}>
          The quick, solo-friendly setup: no alt, no special items, just gear, a spell, and the right tile.
        </p>

        <p style={gs.intro}>
          This is the everyday splash spot — the kind most people on Ardy Host's live list are
          running. It takes minutes to set up, needs nothing but a spellbook and cheap runes, and
          works anywhere a knight patrols next to something it can't path around. The tradeoff is
          that it only holds while you're actively casting: log out, hop worlds, or stop attacking
          for too long, and the knight walks back to its patrol.
        </p>

        <div style={gs.note}>
          Want a spot that stays stuck even when you're not there? See the{' '}
          <a style={gs.a} href="/guides/sticky-knight-setup">sticky knight setup guide</a> — more
          setup work, but permanent.
        </div>

        <h2 style={gs.h2}>What you need</h2>
        <ul style={gs.ul}>
          <li style={gs.li}>Access to the standard spellbook and a cheap combat spell (Wind Strike or similar).</li>
          <li style={gs.li}>Enough runes to autocast continuously — a staff that covers one of the elements saves inventory space.</li>
          <li style={gs.li}>Gear with little to no magic attack bonus, so your hits reliably splash instead of connecting.</li>
          <li style={gs.li}>No special items, alt account, or unlocked spells beyond the basics — this is the low-commitment setup.</li>
        </ul>

        <h2 style={gs.h2}>How it works</h2>
        <div style={gs.stepList}>
          {steps.map((s, i) => (
            <div key={s.title} style={gs.step}>
              <div style={gs.stepNum}>{i + 1}</div>
              <div>
                <div style={gs.stepTitle}>{s.title}</div>
                <div style={gs.stepBody}>{s.body}</div>
              </div>
            </div>
          ))}
        </div>

        <h2 style={gs.h2}>Keeping it going</h2>
        <p style={gs.p}>
          The Splash Helper plugin's combat idle timer is built for exactly this — it counts down
          from the moment you attack the knight and warns you before the fight could time out, so
          you don't come back from an AFK break to find it's wandered off. See the{' '}
          <a style={gs.a} href="/guides/splash-helper-plugin">plugin guide</a> to set it up.
        </p>
        <p style={gs.p}>
          If you'd rather skip finding your own spot entirely, you don't have to set anything up —{' '}
          <a style={gs.a} href="/">check Ardy Host's live list</a> for a knight someone else is
          already splashing and just start pickpocketing.
        </p>

        <h2 style={gs.h2}>Letting others pickpocket while you splash</h2>
        <p style={gs.p}>
          Once your knight is stuck and splashing, you're not losing anything by letting thieves
          pickpocket it — you still get full Magic XP either way. If you want your world to show up
          on Ardy Host's live list automatically, turn on the{' '}
          <a style={gs.a} href="/guides/splash-helper-plugin">Splash Helper plugin's</a> Server Sync
          option.
        </p>

        <p style={{ ...gs.p, marginTop: '2rem' }}>
          Back to <a style={gs.a} href="/guides">all guides</a>.
        </p>
      </div>
    </GuideShell>
  );
}
