import GuideShell from '../components/GuideShell';
import { gs } from '../style/guideTheme';
import { useGuideMeta } from '../hooks/useGuideMeta';

export default function PluginGuide() {
  useGuideMeta({
    title: 'Installing and Configuring the Splash Helper Plugin | Ardy Host',
    description: 'How to install the Splash Helper RuneLite plugin, set up the combat idle timer and notifications, and use its built-in interactive sticky-knight setup guide.',
    path: '/guides/splash-helper-plugin',
  });

  return (
    <GuideShell>
      <div style={{ ...gs.container, padding: '2.5rem 0 4rem' }}>
        <a href="/guides" style={gs.back}>&larr; Guides</a>
        <h1 style={gs.heading}>Installing and Configuring the Splash Helper Plugin</h1>
        <p style={gs.updated}>Splash Helper is the RuneLite plugin behind Ardy Host — a combat idle timer, session stats, and an in-game step-by-step sticky knight setup guide.</p>

        <p style={gs.intro}>
          Splash Helper is a free RuneLite plugin built for splashing Knights of Ardougne. It warns
          you before your combat times out, tracks your session stats (casts, XP, rune cost), can
          optionally stream your live status to Ardy Host so thieves can find you, and — the part
          most people install it for — walks you through the sticky knight setup tile-by-tile
          inside the game itself.
        </p>

        <h2 style={gs.h2}>Installing it</h2>
        <ol className='guide-ol' style={gs.ol}>
          <li style={gs.li}>Open RuneLite and click the <strong>Plugin Hub</strong> icon in the sidebar (the wrench-and-plug icon).</li>
          <li style={gs.li}>Search for <strong>"Splash Helper"</strong>.</li>
          <li style={gs.li}>Click <strong>Install</strong>. A new panel icon appears in your RuneLite sidebar once it's enabled.</li>
        </ol>
        <div style={gs.note}>
          Server Sync (the feature that puts you on Ardy Host's live list) is <strong>off by default</strong> after
          install — see below for what it sends and how to turn it on.
        </div>

        <h2 style={gs.h2}>Setting up the combat idle timer</h2>
        <p style={gs.p}>
          The timer starts automatically the moment you attack or interact with the NPC you've
          configured, and counts down until you're expected to have gone idle — useful for
          knowing when to check back in on a semi-AFK session.
        </p>
        <ol className='guide-ol' style={gs.ol}>
          <li style={gs.li}>Open the plugin's settings from the RuneLite config panel.</li>
          <li style={gs.li}>Set <strong>Target NPC</strong> to <code style={gs.code}>Knight of Ardougne</code> (this is the default).</li>
          <li style={gs.li}>Set <strong>Timer Duration</strong> to how many minutes you expect to be away between checks.</li>
          <li style={gs.li}><strong>Warning Threshold</strong> and <strong>Critical Threshold</strong> control when the timer text/screen tint turns orange, then red, as time runs low.</li>
        </ol>

        <h2 style={gs.h2}>Notifications</h2>
        <p style={gs.p}>
          Under the <strong>Notifications</strong> section you can enable separate alerts for: the
          knight reaching a boundary tile you've marked, the idle timer expiring, and your HP
          dropping below a threshold while the knight is capable of attacking you. Sound and visual
          (screen tint) notifications can be toggled independently.
        </p>

        <h2 style={gs.h2}>Tile markers &amp; movement tracking</h2>
        <p style={gs.p}>
          Right-click any ground tile in-game to set it as a marker:
        </p>
        <ul style={gs.ul}>
          <li style={gs.li}><strong>Knight Boundary</strong> — get notified when the tracked NPC reaches this tile.</li>
          <li style={gs.li}><strong>Knight Tile 1 / Knight Tile 2</strong> — set both and the plugin automatically tracks movement between them and shows movements-per-hour in the overlay, useful for judging how "stuck" a spot really is.</li>
        </ul>

        <h2 style={gs.h2}>The built-in sticky knight setup guide</h2>
        <p style={gs.p}>
          Rather than following a written walkthrough from memory, the plugin has the entire sticky
          knight setup built in as an interactive overlay: it highlights the exact tile to stand on,
          the exact spell or button to use, and waits for you to actually do it before advancing.
        </p>
        <table style={gs.table}>
          <thead>
            <tr>
              <th style={gs.th}>Action</th>
              <th style={gs.th}>Default hotkey</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={gs.td}>Start / stop the guide</td><td style={gs.td}><code style={gs.code}>Ctrl + G</code></td></tr>
            <tr><td style={gs.td}>Next step / skip step</td><td style={gs.td}><code style={gs.code}>Ctrl + .</code></td></tr>
            <tr><td style={gs.td}>Previous step</td><td style={gs.td}><code style={gs.code}>Ctrl + ,</code></td></tr>
          </tbody>
        </table>
        <p style={gs.p}>
          The first time you start it, it shows a requirements checklist so you can confirm your
          setup before committing — see the full requirements and walkthrough in the{' '}
          <a style={gs.a} href="/guides/sticky-knight-setup">sticky knight setup guide</a>.
        </p>

        <h2 style={gs.h2}>Server Sync (optional)</h2>
        <p style={gs.p}>
          Server Sync connects to a Splash Helper server over WebSocket (splasher.help/Ardy Host by
          default) and streams your live session — this is what makes you show up on Ardy Host's
          home page so thieves can find you.
        </p>
        <div style={gs.warn}>
          Enabling it sends your account username and session statistics — spell used, world, Magic
          XP, rune usage and cost, spells cast, knight movements, nearby player counts, nearby player
          deaths, and timestamps — to that server. Nothing is sent while it's disabled, and RuneLite
          shows this same warning before it turns on.
        </div>
        <p style={gs.p}>
          To enable it: open the plugin settings, expand <strong>Server Sync</strong>, and turn on
          <strong> Enable Server Sync</strong>. Leave <strong>Server URL</strong> on its default
          unless you're pointed at a different community's server.
        </p>

        <h2 style={gs.h2}>Safety features</h2>
        <ul style={gs.ul}>
          <li style={gs.li}><strong>Safety Mode</strong> — a toggleable hotkey (default Numlock <code style={gs.code}>*</code>) meant to guard against actions that would drop the knight's aggro.</li>
          <li style={gs.li}><strong>Grief Prevention</strong> — warns you if Accept Aid is on or Private Chat is set to "All," both of which make you an easier target while you're AFK.</li>
        </ul>

        <p style={{ ...gs.p, marginTop: '2rem' }}>
          Next: <a style={gs.a} href="/guides/sticky-knight-setup">set up a sticky knight</a> using the
          plugin's guided walkthrough, or head back to <a style={gs.a} href="/guides">all guides</a>.
        </p>
      </div>
    </GuideShell>
  );
}
