import { colors, fontSerif } from '../theme';

const s = {
  container: { maxWidth: 760, margin: '0 auto', padding: '2.5rem 1.25rem 4rem' },
  back: { color: colors.link, fontSize: '0.875rem', textDecoration: 'none', fontWeight: 600 },
  heading: { fontFamily: fontSerif, fontSize: '1.75rem', fontWeight: 700, color: colors.text, margin: '1rem 0 0.25rem' },
  updated: { color: colors.textFaint, fontSize: '0.8rem', marginBottom: '1.75rem' },
  h2: { fontFamily: fontSerif, fontSize: '1.1rem', fontWeight: 700, color: colors.text, marginTop: '1.75rem', marginBottom: '0.5rem' },
  p: { color: colors.textMuted, fontSize: '0.9rem', lineHeight: 1.65, marginBottom: '0.75rem' },
  ul: { color: colors.textMuted, fontSize: '0.9rem', lineHeight: 1.65, marginBottom: '0.75rem', paddingLeft: '1.25rem' },
  li: { marginBottom: '0.35rem' },
  a: { color: colors.link, fontWeight: 600 },
} as const;

export default function PrivacyPolicyView() {
  return (
    <div style={s.container}>
      <a href="/" style={s.back}>&larr; Splash Helper</a>
      <h1 style={s.heading}>Privacy Policy</h1>
      <p style={s.updated}>Last updated: August 6, 2026</p>

      <p style={s.p}>
        This Privacy Policy explains what information the Splash Helper website and Discord bot
        (together, the "Service") collect, how it's used, and the choices you have. By using
        the Service you agree to the collection and use of information as described here.
      </p>

      <h2 style={s.h2}>1. Information We Collect</h2>
      <p style={s.p}>Depending on how you use the Service, we may collect:</p>
      <ul style={s.ul}>
        <li style={s.li}>
          <strong>Discord identifiers</strong> — your Discord user ID, and, for servers that
          add the bot, the server (guild) ID and the channel and role IDs a server admin
          configures via <code>/setup</code>.
        </li>
        <li style={s.li}>
          <strong>Account link data</strong> — when you run <code>/link</code>, the Splash
          Helper plugin token you provide, used only to verify and connect your Discord account
          to your Splash Helper account.
        </li>
        <li style={s.li}>
          <strong>Session data</strong> — gameplay session statistics synced from the Splash
          Helper RuneLite plugin (e.g. spell used, runes consumed, session duration), which we
          store against your Splash Helper account and may relay to Discord channels or webhook
          URLs you or your community configure.
        </li>
        <li style={s.li}>
          <strong>Configuration data</strong> — webhook URLs and community settings (ranks,
          invite links) that you or your community's staff choose to store.
        </li>
      </ul>
      <p style={s.p}>
        We do not collect Discord message content outside of the bot's own commands, and we do
        not read messages in channels the bot has not been asked to post to.
      </p>

      <h2 style={s.h2}>2. How We Use Information</h2>
      <ul style={s.ul}>
        <li style={s.li}>To operate bot commands (<code>/setup</code>, <code>/link</code>) and post session updates to the channels a server configures.</li>
        <li style={s.li}>To link a Discord account to a Splash Helper account so session data can be attributed correctly.</li>
        <li style={s.li}>To display session history and community rankings on the website.</li>
        <li style={s.li}>To maintain, secure, and improve the Service.</li>
      </ul>

      <h2 style={s.h2}>3. Sharing of Information</h2>
      <p style={s.p}>
        We do not sell your information. Data is shared only: (a) with Discord, as part of
        normal bot operation (e.g. posting a message to a configured channel); (b) to the
        webhook URLs a user or community explicitly configures, which deliver messages directly
        to Discord; and (c) where required by law.
      </p>

      <h2 style={s.h2}>4. Data Retention</h2>
      <p style={s.p}>
        We retain linked-account and session data for as long as your account or community
        configuration exists. Removing the bot from your server stops it from posting new
        updates there; it does not automatically delete previously stored session history. You
        can request deletion of your account data at any time (see Contact below).
      </p>

      <h2 style={s.h2}>5. Your Choices</h2>
      <ul style={s.ul}>
        <li style={s.li}>Unlink your Discord account at any time by contacting us or regenerating your plugin token.</li>
        <li style={s.li}>Remove the bot from your Discord server at any time from Discord's Server Settings.</li>
        <li style={s.li}>Clear or change a webhook URL from your Account Settings on the website.</li>
        <li style={s.li}>Request a copy or deletion of your data by contacting us.</li>
      </ul>

      <h2 style={s.h2}>6. Children's Privacy</h2>
      <p style={s.p}>
        The Service is not directed at children and follows Discord's own minimum age
        requirements. We do not knowingly collect information from anyone below that age.
      </p>

      <h2 style={s.h2}>7. Security</h2>
      <p style={s.p}>
        We use reasonable technical measures to protect stored data, including treating plugin
        and API tokens as secrets. No method of storage or transmission is completely secure,
        and we can't guarantee absolute security.
      </p>

      <h2 style={s.h2}>8. Changes to This Policy</h2>
      <p style={s.p}>
        We may update this Privacy Policy from time to time. Material changes will update the
        "Last updated" date above, and continued use of the Service after a change constitutes
        acceptance of the revised policy.
      </p>

      <h2 style={s.h2}>9. Contact</h2>
      <p style={s.p}>
        Questions about this policy, or requests to access or delete your data, can be sent to{' '}
        <a style={s.a} href="mailto:peppielangwaus@gmail.com">peppielangwaus@gmail.com</a>.
      </p>

      <p style={s.p}>
        See also our <a style={s.a} href="/terms">Terms of Service</a>.
      </p>
    </div>
  );
}
