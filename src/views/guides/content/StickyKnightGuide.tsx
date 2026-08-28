import GuideShell from '../components/GuideShell';
import { gs } from '../styling/guideTheme';
import { useGuideMeta } from '../hooks/useGuideMeta';

const phases = [
  {
    title: 'Tag the knight and take your opening tile',
    body: "Find the knight you're going to trap and splash it once to tag it — this is also the moment the plugin's guide snapshots your current gear as your \"splasher loadout\" to restore later. Take the marked opening tile so the knight settles directly east of you.",
  },
  {
    title: 'Strip your -magic gear',
    body: 'Unequip your head, body, legs and boots slots. Splasher gear is deliberately built with a poor (often negative) magic attack bonus so every cast splashes — but that same negative bonus stops Entangle from landing, so it has to come off before you can bind the knight.',
  },
  {
    title: 'Equip a dragon spear and cast Entangle',
    body: 'Equip a dragon spear from your inventory (this also clears your weapon/shield slots), open the spellbook, and cast Entangle on the knight to bind it in place.',
  },
  {
    title: 'Special-attack it west, one tile at a time',
    body: 'With the knight bound, arm your special attack and hit it with the dragon spear — each hit shoves it one tile west along a push lane, and you follow onto the tile it just vacated. A full special attack bar is four dragon spear specs (25% each), so the first bar buys you four shoves.',
  },
  {
    title: "Refill your special from an alt, then re-bind and keep pushing",
    body: "This is where the alt account comes in: stand still while it casts Lunar Energy Transfer on you to refill your special attack bar to full. Entangle wears off, so re-cast it on the knight, then spend the refilled bar on three more westward shoves.",
  },
  {
    title: 'Re-equip your splasher gear and let the knight settle',
    body: "Put your original gear back on, then splash the knight once. With you blocking one side and the alt blocking another, the dragged knight can only shuffle back the way it came until it settles on a fixed stop tile at the edge of its wander range — same tile, every time.",
  },
  {
    title: 'Herd it into the corner',
    body: "Move to a push tile and splash it once to halt it, then move to a pull tile and splash again to draw it forward onto a pre-trap tile. Follow up while it holds that tile, then spend your last banked special attack to shove it onto the trap tile itself.",
  },
  {
    title: 'Move to your splashing tile and confirm the splash',
    body: "Take your permanent splashing position and splash the knight once. If it splashes, setup is complete — the knight is now stuck in that corner whether or not anyone is actively casting on it, and stays pickpocketable around the clock.",
  },
];

export default function StickyKnightGuide() {
  useGuideMeta({
    title: 'Sticky Knight Setup Guide (South Ardougne Bank) | Ardy Host',
    description: 'How to trap a Knight of Ardougne permanently at South Ardougne bank using Entangle and dragon spear specials, so it stays splashable even with nobody actively casting.',
    path: '/guides/sticky-knight-setup',
  });

  return (
    <GuideShell>
      <div style={{ ...gs.container, padding: '2.5rem 0 4rem' }}>
        <a href="/guides" style={gs.back}>&larr; Guides</a>
        <h1 style={gs.heading}>Setting Up a Sticky Knight at South Ardougne Bank</h1>
        <p style={gs.updated}>
          The advanced setup: trap a Knight of Ardougne in a corner permanently, so it's pickpocketable
          24/7 whether or not anyone's actively splashing it.
        </p>

        <p style={gs.intro}>
          A normal splash spot only holds because someone is actively casting — stop, and the knight
          walks back to its patrol. A <strong>sticky knight</strong> is different: it's been walked
          into a specific trap tile near the South Ardougne bank (around world coordinates{' '}
          <code style={gs.code}>2644–2655, 3280–3298</code>, ground floor) where it gets stuck against
          the terrain and stays stuck, splashed or not. It's a genuinely technical setup — order- and
          timing-sensitive, and not soloable — so read the requirements below before you start.
        </p>

        <div style={gs.warn}>
          <strong>This is technical. Use the plugin, not memory.</strong> The Splash Helper RuneLite
          plugin has this exact process built in as an interactive in-client guide — it highlights
          the tile, spell, or button for every step and won't let you advance until you've actually
          done it. This page explains what's happening and why; see the{' '}
          <a style={{ color: 'inherit', fontWeight: 700 }} href="/guides/splash-helper-plugin">plugin guide</a>{' '}
          to install it and start the guide with <code style={gs.code}>Ctrl+G</code>.
        </div>

        <h2 style={gs.h2}>What you need</h2>
        <h3 style={gs.h3}>On your main</h3>
        <ul style={gs.ul}>
          <li style={gs.li}>Standard spellbook, with <strong>Entangle</strong> unlocked and runes for it in your inventory or rune pouch.</li>
          <li style={gs.li}>A <strong>full special attack bar</strong> and a <strong>dragon spear</strong> in your inventory.</li>
          <li style={gs.li}>Your usual splasher gear equipped going in — it gets stripped and re-equipped partway through.</li>
        </ul>
        <h3 style={gs.h3}>On a second account (alt)</h3>
        <ul style={gs.ul}>
          <li style={gs.li}>Lunar spellbook, with <strong>Energy Transfer</strong> unlocked and runes for it.</li>
          <li style={gs.li}>Standing on the designated alt tile, spell selected and ready to cast on your main.</li>
          <li style={gs.li}>The alt does <em>not</em> need Splash Helper installed.</li>
        </ul>
        <div style={gs.note}>
          The alt exists to refill your special attack bar mid-setup via Energy Transfer — there's no
          solo version of this method, since the push phase needs two full bars' worth of dragon spear specials.
        </div>

        <h2 style={gs.h2}>How the setup works</h2>
        <div style={gs.stepList}>
          {phases.map((p, i) => (
            <div key={p.title} style={gs.step}>
              <div style={gs.stepNum}>{i + 1}</div>
              <div>
                <div style={gs.stepTitle}>{p.title}</div>
                <div style={gs.stepBody}>{p.body}</div>
              </div>
            </div>
          ))}
        </div>

        <h2 style={gs.h2}>Why bother over a normal spot?</h2>
        <p style={gs.p}>
          A sticky knight doesn't need a splasher standing there — it's already stuck. That means
          thieves can pickpocket it any time, and once one exists in a community, it tends to just
          stay listed and used indefinitely instead of disappearing the moment someone logs off. It's
          more setup cost for a permanent result, versus a normal spot's zero setup cost for a
          temporary one.
        </p>
        <p style={gs.p}>
          If the setup above sounds like more than you want to deal with, a{' '}
          <a style={gs.a} href="/guides/normal-knight-setup">normal knight setup</a> gets you splashing
          in minutes with no alt required — or skip setup entirely and just{' '}
          <a style={gs.a} href="/">join a world someone else is already splashing</a>.
        </p>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'HowTo',
              name: 'Setting Up a Sticky Knight at South Ardougne Bank (OSRS)',
              description: 'How to trap a Knight of Ardougne permanently using Entangle and dragon spear special attacks, so it stays splashable without an active splasher.',
              step: phases.map((p) => ({ '@type': 'HowToStep', name: p.title, text: p.body })),
            }),
          }}
        />

        <p style={{ ...gs.p, marginTop: '2rem' }}>
          Back to <a style={gs.a} href="/guides">all guides</a>.
        </p>
      </div>
    </GuideShell>
  );
}
