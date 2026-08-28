// NOTE FOR REVIEW: boilerplate/example content only, drafted from the "optimal setup" bullets
// already listed in PickpocketGuide.tsx's "Recommended setup" section, not from any verified
// XP/GP-rate source. Treat the steps, ordering, and numbers below as placeholders to replace,
// not as fact-checked advice.
import GuideShell from '../components/GuideShell';
import { gs } from '../style/guideTheme';
import { useGuideMeta } from '../hooks/useGuideMeta';

const steps = [
  {
    title: 'Finish Ardougne Diary 2 (Medium)',
    body: 'The Medium Ardougne Achievement Diary gives a +10% pickpocket success chance against Knights of Ardougne and increases your thieving pouch size to 56 — the single biggest success-rate upgrade available, so get this first.',
  },
  {
    title: 'Get full Rogues\' equipment',
    body: 'The complete Rogue outfit gives a 100% chance to double any GP/loot from a successful pickpocket. It has no effect on success chance itself, but roughly doubles your GP/hour for free once you have it.',
  },
  {
    title: 'Unlock Shadow Veil and grab a Lava battlestaff',
    body: 'Shadow Veil (Lunar spellbook) gives a 15% chance to dodge a stun on a failed pickpocket, which stacks multiplicatively with Dodgy necklaces. A Lava battlestaff lets you cast it for one cosmic rune instead of carrying elemental runes too.',
  },
  {
    title: 'Stock up on Dodgy necklaces',
    body: 'Each Dodgy necklace has a 20% chance per charge to cancel a stun outright and 10 charges before it breaks. Buy in bulk — this is the setup\'s main consumable cost.',
  },
  {
    title: 'Consider a Hitpoints cape and/or Regen bracelet',
    body: 'Both speed up HP regeneration between stuns, cutting how much food (or bank trips) you need. The Regen bracelet trades roughly 10% less GP/hour for less downtime — worth it if you\'re optimizing for AFK time over pure profit.',
  },
  {
    title: 'Track your rate and tune from there',
    body: 'Use the Splash Helper plugin\'s session stats (or your own tracking) to see your actual pickpockets/hour and GP/hour, and adjust — e.g. dropping the Regen bracelet for a Hitpoints cape, or vice versa, once you know which you\'re actually optimizing for.',
  },
];

export default function OptimalSetupGuide() {
  useGuideMeta({
    title: 'Optimal Pickpocketing Setup for Ardougne Knights | Ardy Host',
    description: 'A step-by-step gear and unlock order for maximizing GP/hour and success rate while pickpocketing splashed Knights of Ardougne.',
    path: '/guides/optimal-setup',
  });

  return (
    <GuideShell>
      <div style={{ ...gs.container, padding: '2.5rem 0 4rem' }}>
        <a href="/guides" style={gs.back}>&larr; Guides</a>
        <h1 style={gs.heading}>Optimal Pickpocketing Setup</h1>
        <p style={gs.updated}>
          For players in it for the long haul — the gear and unlock order that maximizes success
          chance and GP/hour once you've got the basics down.
        </p>

        <p style={gs.intro}>
          This builds on the <a style={gs.a} href="/guides/pickpocketing">bare minimum</a> to
          pickpocket a Knight of Ardougne. None of it is required — you can thieve productively
          with nothing but 55 Thieving and a splashed knight — but each step below either raises
          your success chance, your GP/hour, or both.
        </p>

        <div style={gs.note}>
          Chasing 200m XP or a leaderboard spot? This is the setup most long-term grinders end up
          running. It's an investment, not a day-one requirement.
        </div>

        <h2 style={gs.h2}>What you'll end up with</h2>
        <ul style={gs.ul}>
          <li style={gs.li}>Ardougne Diary 2 (Medium) completed</li>
          <li style={gs.li}>Full Rogues' equipment</li>
          <li style={gs.li}>Shadow Veil unlocked, Lava battlestaff equipped</li>
          <li style={gs.li}>A steady supply of Dodgy necklaces</li>
          <li style={gs.li}>Hitpoints cape and/or Regen bracelet, depending on what you're optimizing for</li>
        </ul>

        <h2 style={gs.h2}>Build order</h2>
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

        <h2 style={gs.h2}>Related</h2>
        <p style={gs.p}>
          On mobile? See the <a style={gs.a} href="/guides/mobile-setup">mobile setup guide</a>{' '}
          instead. Playing solo/AFK-first rather than GP-first? See the{' '}
          <a style={gs.a} href="/guides/solo-setup">solo setup guide</a>.
        </p>

        <p style={{ ...gs.p, marginTop: '2rem' }}>
          Back to <a style={gs.a} href="/guides">all guides</a>.
        </p>
      </div>
    </GuideShell>
  );
}
