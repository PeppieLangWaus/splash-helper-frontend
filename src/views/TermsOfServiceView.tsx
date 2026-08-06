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

export default function TermsOfServiceView() {
  return (
    <div style={s.container}>
      <a href="/" style={s.back}>&larr; Splash Helper</a>
      <h1 style={s.heading}>Terms of Service</h1>
      <p style={s.updated}>Last updated: August 6, 2026</p>

      <p style={s.p}>
        These Terms of Service ("Terms") govern your use of the Splash Helper website and the
        Splash Helper Discord bot (together, the "Service"), operated by Splash Helper
        ("we", "us"). By using the Service — including inviting the bot to a Discord server,
        running its commands, or using the website — you agree to these Terms.
      </p>

      <h2 style={s.h2}>1. The Service</h2>
      <p style={s.p}>
        Splash Helper helps players track and share "splashing" session activity. The website
        lets users upload and review session data. The Discord bot lets a server:
      </p>
      <ul style={s.ul}>
        <li style={s.li}>run a <code>/setup</code> wizard to link a Discord server to a Splash Helper community,</li>
        <li style={s.li}>run a <code>/link</code> command so a Discord member can connect their Splash Helper account,</li>
        <li style={s.li}>post active-session and session-history updates to channels the server configures.</li>
      </ul>

      <h2 style={s.h2}>2. Eligibility</h2>
      <p style={s.p}>
        You must meet Discord's own eligibility requirements (including its minimum age
        requirement) to add or use the bot, and your use of Discord itself remains subject to
        Discord's Terms of Service and Community Guidelines. Server owners are responsible for
        having the authority to add the bot to a server and to configure its channel, role, and
        webhook settings.
      </p>

      <h2 style={s.h2}>3. Acceptable Use</h2>
      <p style={s.p}>You agree not to:</p>
      <ul style={s.ul}>
        <li style={s.li}>use the Service to violate Discord's Terms of Service, API policies, or applicable law;</li>
        <li style={s.li}>attempt to disrupt, overload, or abuse the bot, its commands, or its webhooks;</li>
        <li style={s.li}>reverse engineer, scrape, or resell the Service without our permission;</li>
        <li style={s.li}>use another person's Splash Helper account or plugin/API token without authorization.</li>
      </ul>

      <h2 style={s.h2}>4. Account &amp; Server Linking</h2>
      <p style={s.p}>
        Linking a Discord account (via <code>/link</code>) or a Discord server (via{' '}
        <code>/setup</code>) to a Splash Helper account or community is voluntary. You're
        responsible for keeping any plugin or API tokens you generate confidential — anyone
        with a token can act as that account or community for the purposes the token allows.
        You can unlink an account or remove the bot from your server at any time.
      </p>

      <h2 style={s.h2}>5. Availability &amp; Changes</h2>
      <p style={s.p}>
        The Service is provided on an "as is" and "as available" basis, without warranties of
        any kind. We may add, change, or remove features (including bot commands) at any time,
        and we may suspend or discontinue the Service in whole or in part.
      </p>

      <h2 style={s.h2}>6. Limitation of Liability</h2>
      <p style={s.p}>
        To the fullest extent permitted by law, Splash Helper and its operators are not liable
        for any indirect, incidental, or consequential damages arising from your use of, or
        inability to use, the Service, including any loss of data posted to or configured in
        Discord.
      </p>

      <h2 style={s.h2}>7. Termination</h2>
      <p style={s.p}>
        We may suspend or terminate access to the Service for any account or server that
        violates these Terms. You may stop using the Service at any time by removing the bot
        from your server, unlinking your account, and/or discontinuing use of the website.
      </p>

      <h2 style={s.h2}>8. Changes to These Terms</h2>
      <p style={s.p}>
        We may update these Terms from time to time. Continued use of the Service after an
        update constitutes acceptance of the revised Terms. Material changes will update the
        "Last updated" date above.
      </p>

      <h2 style={s.h2}>9. Contact</h2>
      <p style={s.p}>
        Questions about these Terms? Contact us at{' '}
        <a style={s.a} href="mailto:peppielangwaus@gmail.com">peppielangwaus@gmail.com</a>.
      </p>

      <p style={s.p}>
        See also our <a style={s.a} href="/privacy">Privacy Policy</a>.
      </p>
    </div>
  );
}
