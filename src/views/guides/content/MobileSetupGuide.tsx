import GuideShell from '../components/GuideShell';
import { gs } from '../style/guideTheme';
import { useGuideMeta } from '../hooks/useGuideMeta';
import GuideFigure from '../components/GuideFigure';
import { colors } from '../../../theme';

const steps = [
  {
    title: 'Configure Settings',
    body: (
      <>
        <p style={{ ...gs.p, fontSize: '17px', marginBottom: '-1em', color: colors.accentText}}>
          <strong>Activities</strong>
        </p>
        <ul style={gs.ul}>
          <li style={gs.li}><strong>NPC Highlight</strong>: <span style={gs.code}>Enabled</span></li>
          <li style={gs.li}><strong>NPC Highlight – tagging</strong>: <span style={gs.code}>Enabled</span></li>
        </ul>

        <p style={{ ...gs.p, fontSize: '17px', marginBottom: '-1em', color: colors.accentText}}>
          <strong>Controls</strong>
        </p>
        <ul style={gs.ul}>
          <li style={gs.li}><strong>NPC Attack options</strong>: <span style={gs.code}>Always long-tap</span></li>
          <li style={gs.li}><strong>Move follower options lower down</strong>: <span style={gs.code}>Enabled</span></li>
        </ul>

        <p style={{ ...gs.p, fontSize: '17px', marginBottom: '-1em', color: colors.accentText}}>
          <strong>Hotkey Settings</strong> – <span style={{color: colors.textMuted}}>Button at the bottom of <i>Controls</i></span>
        </p>
        <ol style={gs.ol}>
          <li style={gs.li}><strong>Select</strong> any unused loadout</li>
          <li style={gs.li}><strong>Add</strong>: <span style={gs.code}>Tap-to-drop</span></li>
          <li style={gs.li}><strong>Add</strong>: <span style={gs.code}>Disable walk</span></li>
          <li style={gs.li}><strong>Add</strong>: <span style={gs.code}>NPC tags</span></li>
          <li style={gs.li}><strong>Click</strong>: <i>Make active</i></li>
        </ol>
      </>
    ),
  },
  {
    title: 'Equipment',
    body: (
      <>
        <p style={gs.note}>
          Any part of the equipment below is optional, but <i>Dodgy Necklaces</i> are strongly recommended, and if you care about the GP rogues outfit is too
        </p>
        <div style={gs.row}>
          <GuideFigure
            src='/assets/images/guides/optimal/equipment.png'
            alt='Equipment'
            width='15em'
            caption='Equipment'
          />
          <GuideFigure
            src='/assets/images/guides/optimal/inventory.png'
            alt='Inventory'
            width='15em'
            caption='Inventory'
          />
        </div>
      </>
    ),
  },
];

export default function MobileSetupGuide() {
  useGuideMeta({
    title: 'Mobile Pickpocketing Setup for Ardougne Knights | Ardy Host',
    description: 'A step-by-step guide to pickpocketing splashed Knights of Ardougne on OSRS Mobile',
    path: '/guides/mobile-setup',
  });

  return (
    <GuideShell>
      <div style={{ ...gs.container, padding: '2.5rem 0 4rem' }}>
        <a href="/guides" style={gs.back}>&larr; Guides</a>
        <h1 style={gs.heading}>Mobile Pickpocketing Setup</h1>
        <p style={gs.updated}>
          Chilling with your phone out watching a show? Here's the settings you need for OSRS Mobile.
        </p>

        <p style={gs.intro}>
          Everything in the <a style={gs.a} href="/guides/pickpocketing">pickpocketing basics</a>{' '}
          applies the same on mobile as on desktop — same level requirement, same need for a
          splashed knight. This page is just the handful of mobile-specific adjustments that make
          it comfortable on a touchscreen.
        </p>

        <div style={gs.note}>
          No special gear is required for mobile specifically — see the{' '}
          <a style={gs.a} href="/guides/optimal-setup">optimal setup guide</a> if you want to
          switch over to your PC. Don't forget to switch back NPC attack options when you're done!
        </div>

        <h2 style={gs.h2}>What you need</h2>
        <ul style={gs.ul}>
          <li style={gs.li}>OSRS Mobile installed, logged into an account with 55+ Thieving.</li>
          <li style={gs.li}>Level 55 Thieving</li>
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
          Switching over to desktop soon? See the <a style={gs.a} href="/guides/optimal-setup">optimal
          setup guide</a>. No splasher online? See the{' '}
          <a style={gs.a} href="/guides/solo-setup">solo setup guide</a>.
        </p>

        <p style={{ ...gs.p, marginTop: '2rem' }}>
          Back to <a style={gs.a} href="/guides">all guides</a>.
        </p>
      </div>
    </GuideShell>
  );
}
