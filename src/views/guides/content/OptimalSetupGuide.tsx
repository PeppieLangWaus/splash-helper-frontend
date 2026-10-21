import GuideShell from '../components/GuideShell';
import { gs } from '../style/guideTheme';
import { useGuideMeta } from '../hooks/useGuideMeta';
import { LinkPreview } from '../components/LinkPreview';
import GuideFigure from '../components/GuideFigure';
import { colors } from '../../../theme';
import { Tooltip } from 'react-tooltip';

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
          <li style={gs.li}>
            Check <span style={gs.code}>Controls {'>'} Keybinds</span> and remember what key you spellbook is set to.
          </li>
          
        </ol>
      </>
    )
  },
  {
    title: 'Install Plugins',
    body: (
      <>
        <ol className='guide-ol' style={gs.ol}>
          <li style={gs.li}>
            From the Runelite Plugin Hub install:{' '}
            <LinkPreview href='https://runelite.net/plugin-hub/show/pickpocket-helper' style={gs.a}>
              Pickpocket Helper
            </LinkPreview>
            <p style={{marginTop: '-.6em', ...gs.subtext}}>Shows important info and alerts</p>
          </li>
          <li style={gs.li}>
            From the Runelite Plugin Hub install:{' '}
            <LinkPreview href='https://runelite.net/plugin-hub/show/hold-your-ground' style={gs.a}>
              Hold Your Ground
            </LinkPreview>
            <p style={{marginTop: '-.6em', ...gs.subtext}}>Prevents you from walking to wrong tiles (hold shift to bypass)</p>
          </li>
        </ol>
      </>
    ),
  },
  {
    title: 'Configure Plugins',
    body: (
      <>
        <p style={{ ...gs.p, fontSize: '17px', marginBottom: '-1em', color: colors.accentText}}><strong>Pickpocket Helper:</strong></p>
        <ul style={gs.ul}>
          <li style={gs.li}>
            <strong>Alerts:</strong>
            <ul style={gs.ul}>
              <li style={gs.li}><strong>Speech Volume:</strong> set to preference</li>
              <li style={gs.li}><strong>Type:</strong> set to notification if TTS bothers you</li>
              <li style={gs.li}><strong>Inactive Delay:</strong> set to <span style={gs.code}>10s</span></li>
            </ul>
          </li>
          <li style={gs.li}>
            <strong>Utility:</strong>
            <ul style={gs.ul}>
              <li style={gs.li}><strong>Left-click Pickpocket:</strong> enable</li>
            </ul>
          </li>
        </ul>

        <p style={{ ...gs.p, fontSize: '17px', marginBottom: '-1em', color: colors.accentText}}><strong>Hold Your Ground:</strong></p>
        <ul style={gs.ul}>
          <li style={gs.li}><strong>Hold your horses hotkey:</strong> set to <span style={gs.code}>shift</span></li>
        </ul>

        <p style={{ ...gs.p, fontSize: '17px', marginBottom: '-1em', color: colors.accentText}}><strong>Key Remapping (Runelite built-in)</strong></p>
        <ul style={gs.ul}>
          <li style={gs.li}>
            <strong>F-key remapping:</strong>
            <ul style={gs.ul}>
              <li style={gs.li}>set the F key that your spellbook is on to the <span style={gs.code}>Up</span> arrow key</li>
              <li style={gs.li}>set the <i>ESC</i> key at the bottom to the <span style={gs.code}>Down</span> arrow key</li>

            </ul>
          </li>
        </ul>
      </>
    ),
  },
  {
    title: 'Reorder Spellbook',
    body:  (
      <>
        <ol style={gs.ol}>
          <li style={gs.li}><strong>Right click</strong> the spellbook icon, and <strong>Enable</strong> spellbook filtering.</li>
          <li style={gs.li}><strong>Right click</strong> the spellbook icon, and <strong>Enable</strong> spellbook reordering.</li>
          <li style={gs.li}><strong>Left click</strong> the spellbook icon, and <strong>drag</strong> <i>Shadow Veil</i> to the first slot.</li>
          <li style={gs.li}><strong>Right click</strong> the spellbook icon, and <strong>Disable</strong> spellbook reordering.</li>
          <li style={gs.li}><strong>Left click</strong> the <i>filter</i> button, and <strong>Uncheck</strong> <i>Show spells you lack the runes to cast</i>.</li>
          <li style={gs.li}>in the same menu <strong>Uncheck</strong> <i>Enable icon resizing (outside PvP ares)</i>.</li>
        </ol>
      </>
    ),
  },
  {
    title: 'Positioning Camera & Inventory',
    body:  (
      <>
        <p style={gs.p}><strong>Hold</strong> <i>alt</i>, and <strong>drag</strong> the the inventory so that the coin pouch is on top of the knight and the tile you're standing on.</p>
        <GuideFigure 
            src='/assets/images/guides/optimal/layout.png'
            alt='Equipment'
            width='35em'
            zoomable
          />
          <p style={{marginTop: '-1.25em', ...gs.subtext}}>click to view image fullscreen</p>
      </>
    ),
  },
  {
    title: 'Click sequence',
    body:  (
      <>
        <p style={gs.p}>It is assumed you are starting with the inventory panel open. You can pickpocket <strong>once</strong> every <i>1.2 seconds</i> (2 ticks), so that's the click rate you should be aiming for.</p>
        <ol style={gs.ol}>
          <li style={gs.li}><strong>Press</strong> <span style={gs.code}>Up</span> once.</li>
          <li style={gs.li}><strong>Press</strong> <span style={gs.code}>Numpad 5</span> once.</li>
          <li style={gs.li}><strong>Press</strong> <span style={gs.code}>Up</span> once.</li>
          <li style={gs.li}><strong>Press</strong> <span style={gs.code}>Numpad 5</span> until pouch is full, or <i>Shadow Veil</i> has run out.</li>
          <li style={gs.li}><strong>If Shadow Veil has run out:</strong>
            <ol style={gs.ol}>
              <li style={gs.li}><strong>Press</strong> <span style={gs.code}>Up</span> once.</li>
              <li style={gs.li}><strong>Press</strong> <span style={gs.code}>Numpad 5</span> until <i>Shadow Veil</i> is cast.</li>
              <li style={gs.li}><strong>Press</strong> <span style={gs.code}>Up</span> once.</li>
            </ol>
          </li>
          <li style={gs.li}><strong>If pouch is full:</strong>
            <ol style={gs.ol}>
              <li style={gs.li}><strong>Press</strong> <span style={gs.code}>Down</span> once.</li>
              <li style={gs.li}><strong>Press</strong> <span style={gs.code}>Numpad 5</span> until pouch is emptied.</li>
              <li style={gs.li}><strong>Press</strong> <span style={gs.code}>Down</span> once.</li>
            </ol>
          </li>
          <li style={gs.li}><strong>Repeat</strong> from <span style={gs.code}>step 4</span></li>

        </ol>
      </>
    ),
  },
];

const mouseKeysTooltip = (
  <>
      <Tooltip
        id='mouse-keys'
        content={(
          <>
            <ul style={gs.ul}>
              <li style={gs.li}><strong>Windows</strong>: <span style={gs.code}>Left Alt + Left Shift + Num Lock</span></li>
              <li style={gs.li}><strong>MacOS</strong>: <span style={gs.code}>Option + Command + F5</span></li>
              <li style={gs.li}><strong>Linux (gnome)</strong>: No shortcut, enable it with <span style={gs.code}>Settings {">"} Accessibility {">"} Pointing and Clicking {">"} Mouse Keys</span></li>
            </ul>
          </>
        )}
        border={`1px solid ${colors.accent}`}
        style={gs.tooltip}
        place={'bottom'}
        opacity={1}
        disableStyleInjection
        portalRoot={document.body}
      />
      <a data-tooltip-id='mouse-keys'>Mouse Keys</a>
    </>
)

export default function OptimalSetupGuide() {
  useGuideMeta({
    title: 'Optimal Pickpocketing Setup for Ardougne Knights | Ardy Host',
    description: 'A step-by-step guide for pickpocketing splashed Knights of Ardougne.',
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
          So, you want to get that 99 Thieving? Maybe you're going for Rocky? Or are you after locking in a spot on the leaderboards with the coveted 200M XP?
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
          <li style={gs.li}>Have {mouseKeysTooltip} enabled</li>

        </ul>

        {/* <h2 style={gs.h2}>Equipment & Inventory & Spellbook</h2> */}
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
          <GuideFigure 
            src='/assets/images/guides/optimal/spellbook.png'
            alt='Spellbook'
            width='15em'
            caption='Spellbook (See step 4)'
          />
        </div>

        <h2 style={gs.h2}>Step-by-step guide</h2>
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
