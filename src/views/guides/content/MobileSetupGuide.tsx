// NOTE FOR REVIEW: boilerplate/example content only, drafted from general OSRS mobile client
// knowledge, not from anything verified in this workspace. Treat the steps below as placeholders.
import GuideShell from '../components/GuideShell';
import { gs } from '../style/guideTheme';
import { useGuideMeta } from '../hooks/useGuideMeta';

const steps = [
  {
    title: 'Log in on OSRS Mobile',
    body: 'Pickpocketing a splashed knight works identically on mobile — the knight is stuck in combat regardless of which client the thief uses. No special account setup is needed beyond the usual mobile login.',
  },
  {
    title: 'Find a live world from Ardy Host on your phone',
    body: 'Open splasher.help in your phone\'s browser (or add it to your home screen) to see who\'s currently splashing and on which world, without needing to be at a desktop.',
  },
  {
    title: 'Use a wide tap target, not a precise click',
    body: 'On touchscreens, tap slightly to the side of the knight\'s exact centre rather than trying to pinpoint it — it reduces mis-taps that select the tile behind the knight instead of the knight itself.',
  },
  {
    title: 'Turn off screen auto-lock while playing',
    body: 'Set your phone\'s display timeout to "never" (or the longest available) for your play session so the game doesn\'t pause mid-AFK when the screen locks. Remember to change it back afterward.',
  },
  {
    title: 'Keep the pickpocket menu option pinned to one spot',
    body: 'Whichever finger/hand position you tap from, keep it consistent — muscle memory for a fixed tap location is faster and more accurate than re-aiming every time on a small screen.',
  },
];

export default function MobileSetupGuide() {
  useGuideMeta({
    title: 'Mobile Pickpocketing Setup for Ardougne Knights | Ardy Host',
    description: 'A step-by-step guide to pickpocketing splashed Knights of Ardougne on OSRS Mobile — finding a world, tap technique, and keeping your screen awake.',
    path: '/guides/mobile-setup',
  });

  return (
    <GuideShell>
      <div style={{ ...gs.container, padding: '2.5rem 0 4rem' }}>
        <a href="/guides" style={gs.back}>&larr; Guides</a>
        <h1 style={gs.heading}>Mobile Pickpocketing Setup</h1>
        <p style={gs.updated}>
          Chilling with your phone out? Here's the simple, low-effort way to pickpocket a splashed
          knight from OSRS Mobile.
        </p>

        <p style={gs.intro}>
          Everything in the <a style={gs.a} href="/guides/pickpocketing">pickpocketing basics</a>{' '}
          applies the same on mobile as on desktop — same level requirement, same need for a
          splashed knight. This page is just the handful of mobile-specific adjustments that make
          it comfortable on a touchscreen.
        </p>

        <div style={gs.note}>
          No special gear is required for mobile specifically — see the{' '}
          <a style={gs.a} href="/guides/optimal-setup">optimal setup guide</a> if you also want to
          maximize GP/hour and success chance.
        </div>

        <h2 style={gs.h2}>What you need</h2>
        <ul style={gs.ul}>
          <li style={gs.li}>OSRS Mobile installed, logged into an account with 55+ Thieving.</li>
          <li style={gs.li}>A phone browser to check <a style={gs.a} href="/">Ardy Host's live list</a> for a world.</li>
          <li style={gs.li}>Nothing else — the "bare minimum" requirements are identical to desktop.</li>
        </ul>

        <h2 style={gs.h2}>How to do it</h2>
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
          Want more GP/hour instead? See the <a style={gs.a} href="/guides/optimal-setup">optimal
          setup guide</a>. Just want to be left alone and AFK? See the{' '}
          <a style={gs.a} href="/guides/solo-setup">solo setup guide</a>.
        </p>

        <p style={{ ...gs.p, marginTop: '2rem' }}>
          Back to <a style={gs.a} href="/guides">all guides</a>.
        </p>
      </div>
    </GuideShell>
  );
}
