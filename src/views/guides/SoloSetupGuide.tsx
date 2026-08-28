// NOTE FOR REVIEW: boilerplate/example content only, drafted from general knowledge, not from
// anything verified in this workspace. Treat the steps below as placeholders to replace.
import GuideShell from './GuideShell';
import { gs } from './guideTheme';
import { useGuideMeta } from './useGuideMeta';

const steps = [
  {
    title: 'Turn off Auto Retaliate',
    body: 'You never need to fight the knight yourself — it\'s already stuck on the splasher. Auto Retaliate off means a stray hit from a nearby monster can\'t accidentally drag you into a fight while you\'re AFK.',
  },
  {
    title: 'Bring minimal food, nothing else',
    body: 'A splashed knight rarely lands a hit and pickpocketing has a low max hit on failure, so a handful of food is enough for a long session. No potions, prayer, or special gear needed.',
  },
  {
    title: 'Pick a world with a stable splasher',
    body: 'Check Ardy Host\'s live list for a world that\'s been up a while rather than one that just appeared — a longer-running splasher is less likely to log off mid-session and end your AFK run early.',
  },
  {
    title: 'Set a check-in reminder',
    body: 'Use your phone alarm, a RuneLite notification plugin, or the Splash Helper plugin\'s own idle/HP notifications to remind yourself to glance back every so often, rather than staring at the screen the whole time.',
  },
  {
    title: 'Know what ends the session',
    body: 'The two things that can interrupt a solo AFK run are the splasher logging off (the knight walks off eventually) and your own HP dropping low without you noticing. Both are covered by the check-in reminder above — nothing else to manage.',
  },
];

export default function SoloSetupGuide() {
  useGuideMeta({
    title: 'Solo / AFK Pickpocketing Setup for Ardougne Knights | Ardy Host',
    description: 'A step-by-step guide to pickpocketing splashed Knights of Ardougne solo and AFK — minimal gear, no group needed, just a stable world and a check-in reminder.',
    path: '/guides/solo-setup',
  });

  return (
    <GuideShell>
      <div style={{ ...gs.container, padding: '2.5rem 0 4rem' }}>
        <a href="/guides" style={gs.back}>&larr; Guides</a>
        <h1 style={gs.heading}>Solo / AFK Pickpocketing Setup</h1>
        <p style={gs.updated}>
          No group, no coordination, no chat required — just you, a splashed knight, and as little
          babysitting as possible.
        </p>

        <p style={gs.intro}>
          You don't need to know anyone, join a clan, or set anything up yourself to pickpocket a
          splashed knight — someone else has already done the setup work. This page is the minimal
          version: the smallest amount of preparation that lets you tab out and mostly forget about
          it.
        </p>

        <div style={gs.note}>
          This is the lowest-effort path in these guides — for higher GP/hour see the{' '}
          <a style={gs.a} href="/guides/optimal-setup">optimal setup guide</a> instead, which trades
          some of this AFK-ness for gear and unlocks.
        </div>

        <h2 style={gs.h2}>What you need</h2>
        <ul style={gs.ul}>
          <li style={gs.li}>55+ Thieving and Plague City completed — see the <a style={gs.a} href="/guides/pickpocketing">bare minimum</a>.</li>
          <li style={gs.li}>A small stack of food.</li>
          <li style={gs.li}>Nothing else — no group, alt account, or special gear.</li>
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
          On your phone? See the <a style={gs.a} href="/guides/mobile-setup">mobile setup guide</a>.
          Chasing GP/hour instead of AFK time? See the{' '}
          <a style={gs.a} href="/guides/optimal-setup">optimal setup guide</a>.
        </p>

        <p style={{ ...gs.p, marginTop: '2rem' }}>
          Back to <a style={gs.a} href="/guides">all guides</a>.
        </p>
      </div>
    </GuideShell>
  );
}
