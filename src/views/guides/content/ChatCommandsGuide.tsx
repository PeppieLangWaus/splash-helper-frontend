import GuideShell from '../components/GuideShell';
import { gs } from '../styling/guideTheme';
import { useGuideMeta } from '../hooks/useGuideMeta';

const consoleCommands = [
  { cmd: '::commands', usage: '::commands', desc: 'List every console command.' },
  { cmd: '::open', usage: '::open <menu item>', desc: 'Jump to a page, e.g. ::open account, ::open bot.' },
  { cmd: '::settings', usage: '::settings [setting] [value]', desc: 'View or change a setting. No args opens Account Settings.' },
  { cmd: '::clear', usage: '::clear [chat tab]', desc: 'Clear all chat history, or just one tab, e.g. ::clear trade.' },
  { cmd: '::toggle', usage: '::toggle <chat tab>', desc: "Cycle a tab's On / Filtered / Off status, same as clicking it directly." },
];

const openTargets = [
  { arg: 'active / home', goesTo: 'Active Splashers (home page)' },
  { arg: 'account / settings', goesTo: 'Account Settings' },
  { arg: 'communities / community', goesTo: 'Communities' },
  { arg: 'bot / discord', goesTo: 'Discord bot page' },
  { arg: 'admin', goesTo: 'Admin panel' },
];

const clearToggleTabs = [
  { tab: 'game', clear: 'yes', toggle: 'yes' },
  { tab: 'info', clear: 'yes', toggle: 'no' },
  { tab: 'system', clear: 'yes', toggle: 'no' },
  { tab: 'public', clear: 'yes', toggle: 'yes' },
  { tab: 'private', clear: 'yes', toggle: 'yes' },
  { tab: 'channel / friends / fc', clear: 'yes', toggle: 'yes' },
  { tab: 'clan / cc', clear: 'yes', toggle: 'yes' },
  { tab: 'trade', clear: 'yes', toggle: 'yes' },
];

const gameChatCommands = [
  { cmd: '!log <page>', desc: "Resolves a collection log page (e.g. !log cyclopes) into the actual items on that page, with real item icons and owned counts." },
  { cmd: '!log missing <page>', desc: 'Same as above, but only shows the items on that page you don\'t have yet.' },
  { cmd: '!pets', desc: 'Resolves your unlocked pets the same way, using the collection log\'s Pets page.' },
];

export default function ChatCommandsGuide() {
  useGuideMeta({
    title: 'Chatbox Chat Commands Reference | Ardy Host',
    description: "Reference for Ardy Host's chatbox: the site's own ::commands console, and the !log / !pets in-game chat commands it resolves into item icons.",
    path: '/guides/chat-commands',
  });

  return (
    <GuideShell>
      <div style={{ ...gs.container, padding: '2.5rem 0 4rem' }}>
        <a href="/guides" style={gs.back}>&larr; Guides</a>
        <h1 style={gs.heading}>Chat Commands Reference</h1>
        <p style={gs.updated}>
          Two separate command sets live in the chatbox: commands you type into its input row, and
          commands recognized from your actual in-game chat.
        </p>

        <p style={gs.intro}>
          The chatbox's input row is a <strong>command console</strong>, not a real chat — nothing
          typed there is broadcast anywhere. Every line is parsed as a <code style={gs.code}>::command</code>{' '}
          and answered with a "System" reply. Separately, if you're relaying your real OSRS chat
          into the chatbox, a couple of in-game chat lines get automatically resolved into richer
          info — see below.
        </p>

        <h2 style={gs.h2}>Console commands</h2>
        <p style={gs.p}>Type these directly into the chatbox's input row.</p>
        <table style={gs.table}>
          <thead>
            <tr>
              <th style={gs.th}>Command</th>
              <th style={gs.th}>Usage</th>
              <th style={gs.th}>What it does</th>
            </tr>
          </thead>
          <tbody>
            {consoleCommands.map((c) => (
              <tr key={c.cmd}>
                <td style={gs.td}><code style={gs.code}>{c.cmd}</code></td>
                <td style={gs.td}><code style={gs.code}>{c.usage}</code></td>
                <td style={gs.td}>{c.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={gs.note}>
          Anything that doesn't start with <code style={gs.code}>::</code>, or isn't a recognized
          command name, gets a "not a recognized command" reply pointing you at{' '}
          <code style={gs.code}>::commands</code>.
        </div>

        <h3 style={gs.h3}><code style={gs.code}>::open</code> targets</h3>
        <table style={gs.table}>
          <thead>
            <tr>
              <th style={gs.th}>Argument</th>
              <th style={gs.th}>Opens</th>
            </tr>
          </thead>
          <tbody>
            {openTargets.map((o) => (
              <tr key={o.arg}>
                <td style={gs.td}><code style={gs.code}>{o.arg}</code></td>
                <td style={gs.td}>{o.goesTo}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 style={gs.h3}><code style={gs.code}>::clear</code> / <code style={gs.code}>::toggle</code> tabs</h3>
        <table style={gs.table}>
          <thead>
            <tr>
              <th style={gs.th}>Tab</th>
              <th style={gs.th}>::clear</th>
              <th style={gs.th}>::toggle</th>
            </tr>
          </thead>
          <tbody>
            {clearToggleTabs.map((t) => (
              <tr key={t.tab}>
                <td style={gs.td}><code style={gs.code}>{t.tab}</code></td>
                <td style={gs.td}>{t.clear}</td>
                <td style={gs.td}>{t.toggle}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={gs.p}>
          <code style={gs.code}>::clear</code> with no argument wipes every tab at once.{' '}
          <code style={gs.code}>::settings</code> currently only has one recognized setting,{' '}
          <code style={gs.code}>timestamp</code> (e.g. <code style={gs.code}>::settings timestamp off</code>) —
          run it with no value to see its current state.
        </p>

        <h2 style={gs.h2}>In-game chat commands</h2>
        <p style={gs.p}>
          These aren't typed into the chatbox — they're regular lines typed in your actual OSRS
          chat. If you're relaying chat to Ardy Host, the backend recognizes these two and rewrites
          them into a resolved item list with real icons before they reach the feed.
        </p>
        <table style={gs.table}>
          <thead>
            <tr>
              <th style={gs.th}>Command</th>
              <th style={gs.th}>What it does</th>
            </tr>
          </thead>
          <tbody>
            {gameChatCommands.map((c) => (
              <tr key={c.cmd}>
                <td style={gs.td}><code style={gs.code}>{c.cmd}</code></td>
                <td style={gs.td}>{c.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={gs.note}>
          Resolution is looked up live from your RuneProfile-synced collection log — the same
          public data RuneProfile itself uses — so it reflects your actual progress, not a cached
          snapshot. No separate linking to Ardy Host is required beyond having a RuneProfile.
        </div>

        <p style={{ ...gs.p, marginTop: '2rem' }}>
          Back to <a style={gs.a} href="/guides">all guides</a>.
        </p>
      </div>
    </GuideShell>
  );
}
