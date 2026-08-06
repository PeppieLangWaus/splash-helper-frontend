import { colors, fontSerif, shadow } from '../theme';

const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID as string | undefined;

// View Channels + Send Messages + Embed Links + Read Message History.
// Adjust if the bot ends up needing more (server owners can also grant more at invite time).
const INVITE_PERMISSIONS = '84992';

const inviteUrl = DISCORD_CLIENT_ID
  ? `https://discord.com/oauth2/authorize?client_id=${encodeURIComponent(DISCORD_CLIENT_ID)}&scope=bot%20applications.commands&permissions=${INVITE_PERMISSIONS}`
  : null;

const s = {
  container: { maxWidth: 640, margin: '0 auto', padding: '3rem 1.25rem 4rem', textAlign: 'center' as const },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    height: 64,
    borderRadius: 16,
    background: colors.accent,
    color: '#fff',
    fontFamily: fontSerif,
    fontSize: '1.75rem',
    fontWeight: 700,
    marginBottom: '1.25rem',
    boxShadow: shadow,
  },
  heading: { fontFamily: fontSerif, fontSize: '1.75rem', fontWeight: 700, color: colors.text, marginBottom: '0.5rem' },
  subtext: { color: colors.textFaint, fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' },
  card: {
    background: colors.panel,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    padding: '1.5rem',
    textAlign: 'left' as const,
    marginBottom: '1.5rem',
  },
  cardTitle: { fontFamily: fontSerif, fontSize: '1rem', fontWeight: 700, color: colors.text, marginBottom: '0.75rem' },
  ul: { color: colors.textMuted, fontSize: '0.875rem', lineHeight: 1.7, paddingLeft: '1.25rem', margin: 0 },
  inviteBtn: {
    display: 'inline-block',
    background: '#5865f2',
    color: '#fff',
    fontWeight: 700,
    fontSize: '1rem',
    padding: '0.75rem 2rem',
    borderRadius: 8,
    textDecoration: 'none',
    marginBottom: '0.75rem',
  },
  inviteBtnDisabled: {
    display: 'inline-block',
    background: colors.textDisabled,
    color: colors.bg,
    fontWeight: 700,
    fontSize: '1rem',
    padding: '0.75rem 2rem',
    borderRadius: 8,
  },
  note: { color: colors.textFaint, fontSize: '0.78rem', marginBottom: '2rem' },
  legalRow: { display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.85rem' },
  legalLink: { color: colors.link, fontWeight: 600, textDecoration: 'none' },
} as const;

export default function DiscordBotView() {
  return (
    <div style={s.container}>
      <div style={s.badge}>SH</div>
      <h1 style={s.heading}>Splash Helper Discord Bot</h1>
      <p style={s.subtext}>
        Bring live splashing session updates into your Discord server. Link splashers to your
        community, post active and history updates automatically, and manage everything from a
        few simple commands.
      </p>

      {inviteUrl ? (
        <a href={inviteUrl} target="_blank" rel="noreferrer" style={s.inviteBtn}>
          Add to Discord
        </a>
      ) : (
        <span style={s.inviteBtnDisabled} title="Set VITE_DISCORD_CLIENT_ID to enable this button">
          Add to Discord
        </span>
      )}
      {!inviteUrl && (
        <p style={s.note}>
          Invite link isn't configured yet — set <code>VITE_DISCORD_CLIENT_ID</code>.
        </p>
      )}

      <div style={s.card}>
        <div style={s.cardTitle}>What the bot does</div>
        <ul style={s.ul}>
          <li><code>/setup</code> — link your Discord server to a Splash Helper community and choose channels for updates.</li>
          <li><code>/link</code> — let a member connect their Splash Helper account to their Discord account.</li>
          <li>Posts active-session and session-history updates to the channels your server configures.</li>
        </ul>
      </div>

      <div style={s.legalRow}>
        <a style={s.legalLink} href="/terms">Terms of Service</a>
        <a style={s.legalLink} href="/privacy">Privacy Policy</a>
      </div>
    </div>
  );
}
