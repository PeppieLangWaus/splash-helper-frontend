// NOTE FOR REVIEW: boilerplate/example content only, drafted from the "optimal setup" bullets
// already listed in PickpocketGuide.tsx's "Recommended setup" section, not from any verified
// XP/GP-rate source. Treat the steps, ordering, and numbers below as placeholders to replace,
// not as fact-checked advice.
import GuideShell from '../components/GuideShell';
import { gs } from '../style/guideTheme';
import { useGuideMeta } from '../hooks/useGuideMeta';
import { LinkPreview } from '../components/LinkPreview';

const steps = [
  {
    title: 'Settings (All Settings menu)',
    body: (
      <>
        <ol className='guide-ol' style={gs.ol}>
          <li style={gs.li}>
            Go to: <span style={gs.code}>Interfaces {'>'} Game client layout</span> and set it to <span style={gs.code}>Resizable - Modern layout</span>
          </li>
          <li style={gs.li}>
            Enable: <span style={gs.code}>Controls {'>'} Modern Layout - Side panel can be closed by the hotkeys</span>
          </li>
        </ol>
      </>
    )
  },
  {
    title: 'Install plugins',
    body: (
      <>
        <ol className='guide-ol' style={gs.ol}>
          <li style={gs.li}>
            From the Runelite Plugin Hub install:{' '}
            <LinkPreview href='https://runelite.net/plugin-hub/show/pickpocket-helper' style={gs.a}>
              Pickpocket Helper
            </LinkPreview>
          </li>
          <li style={gs.li}>
            From the Runelite Plugin Hub install:{' '}
            <LinkPreview href='https://runelite.net/plugin-hub/show/hold-your-ground' style={gs.a}>
              Hold Your Ground
            </LinkPreview>
            {' '}— set its "Hold your horses" and "Hold your pickpockets" toggles on so misclicks
            can't walk you off your tile.
          </li>
        </ol>
      </>
    ),
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
          For players in it for the long haul. A guide focused on maximizing AFK
        </p>

        <p style={gs.intro}>
          So, you want to get that 99 Thieving? Maybe you're going for Rocky? Or thr coveted locked-in rank on the leaderboards with 200M XP?
          This guide will show you how to set up your Runelite client in a way that allows you to click in a single spot for all actions.
          This includes: pickpocketing knight, opening pouches and casting Shadow Veil.
        </p>

        <div style={gs.note}>
          This guide changes quite a bit of how the game looks, so you might want to do this in a seperate Runelite profile. <br />
          You  can do this by going to the settings (the wrench icon) and then clicking the second tab. Here you can open your default profile
          and duplicate it. Make sure to switch over to the newly created profile before making any changes.
        </div>

        <h2 style={gs.h2}>Requirements</h2>
        <ul style={gs.ul}>
          <li style={gs.li}>Ardougne Diary 2 (Medium) completed</li>
          <li style={gs.li}>Full Rogues' equipment</li>
          <li style={gs.li}>Shadow Veil unlocked, Lava battlestaff equipped and cosmic runes in inventory</li>
          <li style={gs.li}>A supply of Dodgy necklaces and one equipped (if you're not 95 thieving yet)</li>
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
