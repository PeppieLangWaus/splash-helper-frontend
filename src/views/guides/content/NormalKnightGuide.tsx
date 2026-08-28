// NOTE FOR REVIEW: unlike the sticky-knight and plugin guides, this page is drafted from
// general OSRS/splashing-community knowledge, not from anything in this workspace — there's
// no equivalent "normal spot" tile data checked in anywhere (see GuideTiles.java for the
// sticky-knight setup's authoritative coordinates, which this page deliberately does NOT
// invent an equivalent of). Please fact-check the mechanics description and, ideally, replace
// the generic "find a fence/wall the knight patrols along" framing with an actual named
// spot/tile before this goes live.
import GuideShell from '../components/GuideShell';
import { gs } from '../style/guideTheme';
import { useGuideMeta } from '../hooks/useGuideMeta';

const steps = [
  {
    title: 'Gear up to guarantee the splash',
    body: 'Remove or avoid any gear with a positive magic attack bonus — most splashers use plain robes or even bare-handed melee gear. The goal is a magic attack bonus low enough that your hit chance against the knight rounds to zero, so every cast visually "splashes" (misses) instead of risking an accidental hit that could end the fight early.',
  },
  {
    title: 'Pick your spell',
    body: "Autocast a cheap combat spell — Wind Strike is the classic choice since it only needs an air and a mind rune, but anything you can afford to spam works. You're not trying to deal damage, just stay in combat and rack up Magic XP.",
  },
  {
    title: 'Find a knight patrolling along an obstacle near the bank',
    body: "Knights of Ardougne patrol on foot around East Ardougne, and the area right around the South Ardougne bank has fences and walls they walk along. Watch a knight's patrol route and find a stretch where a fence or wall runs between you and where it would need to stand to reach you in melee.",
  },
  {
    title: 'Position yourself on the far side',
    body: "Stand on the opposite side of that obstacle from the knight, close enough to be in spell range but on a tile the knight can't path onto or attack you from. It should be forced to walk toward you and get stuck against the obstacle instead of reaching you.",
  },
  {
    title: 'Attack it and keep it in combat',
    body: "Cast your spell on the knight to aggro it. Once it's stuck against the obstacle and locked onto you, keep autocasting — as long as it's actively fighting you (even while whiffing every hit), it stays in place and can't return to its patrol.",
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
