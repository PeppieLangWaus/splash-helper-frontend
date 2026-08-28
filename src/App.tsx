import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AllSplashersView from './views/AllSplashersView';
import UserView from './views/UserView';
import LoginView from './views/LoginView';
import ForgotPasswordView from './views/ForgotPasswordView';
import ResetPasswordView from './views/ResetPasswordView';
import VerifyEmailView from './views/VerifyEmailView';
import SetupAccountView from './views/SetupAccountView';
import AdminView from './views/AdminView';
import CommunityView from './views/CommunityView';
import AccountSettingsView from './views/AccountSettingsView';
import DevSessionsPanel from './views/DevSessionsPanel';
import DiscordBotView from './views/DiscordBotView';
import TermsOfServiceView from './views/TermsOfServiceView';
import PrivacyPolicyView from './views/PrivacyPolicyView';
import GuidesView from './views/guides/GuidesView';
import NormalKnightGuide from './views/guides/NormalKnightGuide';
import StickyKnightGuide from './views/guides/StickyKnightGuide';
import PluginGuide from './views/guides/PluginGuide';
import PickpocketGuide from './views/guides/PickpocketGuide';
import OptimalSetupGuide from './views/guides/OptimalSetupGuide';
import MobileSetupGuide from './views/guides/MobileSetupGuide';
import SoloSetupGuide from './views/guides/SoloSetupGuide';
import ChatCommandsGuide from './views/guides/ChatCommandsGuide';
import InfoCorner from './components/InfoCorner';
import { colors, fontSerif } from './theme';

type View =
  | { name: 'active' }
  | { name: 'user'; username: string }
  | { name: 'login' }
  | { name: 'forgot-password' }
  | { name: 'admin' }
  | { name: 'community' }
  | { name: 'settings' }
  | { name: 'bot' }
  | { name: 'dev' };

/** Maps a `View` to the URL path it should be reachable at, and back. Lets browser
 *  Back/Forward and hard refreshes land on the actual page the user was looking at,
 *  since the app otherwise has no router — `view` is just local state. */
function viewToPath(view: View): string {
  switch (view.name) {
    case 'active': return '/';
    case 'user': return `/sessions/${encodeURIComponent(view.username)}`;
    case 'login': return '/login';
    case 'forgot-password': return '/forgot-password';
    case 'admin': return '/admin';
    case 'community': return '/communities';
    case 'settings': return '/account';
    case 'bot': return '/bot';
    case 'dev': return '/dev';
  }
}

function pathToView(pathname: string): View {
  const sessionsMatch = pathname.match(/^\/sessions\/([^/]+)\/?$/);
  if (sessionsMatch) return { name: 'user', username: decodeURIComponent(sessionsMatch[1]) };

  switch (pathname) {
    case '/login': return { name: 'login' };
    case '/forgot-password': return { name: 'forgot-password' };
    case '/admin': return { name: 'admin' };
    case '/communities': return { name: 'community' };
    case '/account': return { name: 'settings' };
    case '/bot': return { name: 'bot' };
    case '/dev': return { name: 'dev' };
    default: return { name: 'active' };
  }
}

/** The "What is this?" corner blurb's content, per view — `null` skips rendering it
 *  (login/forgot-password/dev, where it wouldn't have anything useful to say). */
function introForView(view: View) {
  switch (view.name) {
    case 'active':
      return (
        <>
          Ardy Host tracks OSRS worlds in real time where mages are <strong>splashing the Knights of Ardougne</strong> —
          AFK-attacking them with a guaranteed-to-miss combat spell so the knights stay stuck in combat and never
          retaliate. That makes them safe to <strong>pickpocket for Thieving training</strong>: free, low-effort
          Thieving XP for anyone who shows up. Pick a live <strong>splash world</strong> below and start pickpocketing,
          or read the <a href="/guides/pickpocketing">full guide</a> if you're new to this, or browse{' '}
          <a href="/guides">all guides</a> for setting up your own splash spot.
        </>
      );
    case 'user':
      return (
        <>
          This is <strong>{view.username}</strong>'s splashing history — every past session, its duration, runes
          burned, and the rune-usage breakdown, archived once the session ends. If it's your own account, this is
          also where your <strong>runecraft/webhook stats</strong> accumulate over time.
        </>
      );
    case 'admin':
      return (
        <>
          Admin-only controls: manage every registered <strong>user</strong> and <strong>community</strong> in the
          system, promote or delete accounts, inspect archived sessions, and adjust community eligibility. Changes
          here affect other people's accounts directly.
        </>
      );
    case 'community':
      return (
        <>
          Set up and manage a <strong>splashing community</strong> — create webhooks, ranks, and the Discord bot
          integration that lets your members link accounts, post live splash sessions, and sync chat through the
          shared <strong>API token</strong>.
        </>
      );
    case 'settings':
      return (
        <>
          Your <strong>account settings</strong>: recovery email, splasher webhooks, chat-log size limits, and
          exporting/importing your local session data.
        </>
      );
    case 'bot':
      return (
        <>
          Invite the <strong>Splash Helper Discord bot</strong> to your server — it runs the setup wizard, links
          member accounts, opens tickets, and keeps a live embed of who's splashing in your community.
        </>
      );
    default:
      return null;
  }
}

const nav = {
  wrapper: {
    background: '#1c150f',
    padding: '0 1.5rem 0 0 ',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    height: 60,
  },
  brand: {
    fontFamily: fontSerif,
    color: colors.text,
    fontWeight: 700,
    fontSize: '1.15rem',
    marginRight: '1.5rem',
    letterSpacing: '-0.01em',
    whiteSpace: 'nowrap' as const,
  },
  btn: (active: boolean) => ({
    background: active ? colors.accent : 'transparent',
    border: 'none',
    borderRadius: 6,
    color: active ? '#fff' : colors.textMuted,
    padding: '0.4rem 0.85rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontFamily: fontSerif,
    fontWeight: 700,
    transition: 'background 0.15s, color 0.15s',
  }),
  right: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.6rem' },
  username: { color: colors.textFaint, fontSize: '0.8rem' },
  logoutBtn: {
    background: '#3e2816',
    border: `1px solid ${colors.borderStrong}`,
    borderRadius: 6,
    color: colors.textMuted,
    padding: '0.35rem 0.8rem',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
} as const;

function AppInner() {
  const { user, logout } = useAuth();
  // Initialize from the current URL (not always 'active') so a hard refresh stays put.
  const [view, setView] = useState<View>(() => pathToView(window.location.pathname));

  // Navigating within the app pushes a new history entry so Back/Forward retrace the
  // actual pages visited (not just re-toggling nav tab styling).
  const navigate = useCallback((next: View) => {
    setView(next);
    const path = viewToPath(next);
    if (window.location.pathname !== path) {
      history.pushState(null, '', path);
    }
  }, []);

  // Handle Back/Forward: sync `view` from the URL without pushing another entry.
  useEffect(() => {
    function handlePopState() {
      if (window.location.pathname === '/setup' || window.location.pathname === '/reset-password' || window.location.pathname === '/verify-email') return;
      setView(pathToView(window.location.pathname));
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle setup link: /setup?token=...
  const [setupToken, setSetupToken] = useState<string | null>(() => {
    if (window.location.pathname !== '/setup') return null;
    return new URLSearchParams(window.location.search).get('token');
  });

  // Handle password-reset link: /reset-password?token=...
  const [resetToken, setResetToken] = useState<string | null>(() => {
    if (window.location.pathname !== '/reset-password') return null;
    return new URLSearchParams(window.location.search).get('token');
  });

  // Handle email-verification link: /verify-email?token=...
  const [verifyEmailTokenValue, setVerifyEmailTokenValue] = useState<string | null>(() => {
    if (window.location.pathname !== '/verify-email') return null;
    return new URLSearchParams(window.location.search).get('token');
  });

  // Standalone legal pages, e.g. linked from the Discord bot's settings —
  // always reachable at their own URL, outside the nav/login-gated shell.
  if (window.location.pathname === '/terms') return <TermsOfServiceView />;
  if (window.location.pathname === '/privacy') return <PrivacyPolicyView />;
  if (window.location.pathname === '/guides') return <GuidesView />;
  if (window.location.pathname === '/guides/normal-knight-setup') return <NormalKnightGuide />;
  if (window.location.pathname === '/guides/sticky-knight-setup') return <StickyKnightGuide />;
  if (window.location.pathname === '/guides/splash-helper-plugin') return <PluginGuide />;
  if (window.location.pathname === '/guides/pickpocketing') return <PickpocketGuide />;
  if (window.location.pathname === '/guides/optimal-setup') return <OptimalSetupGuide />;
  if (window.location.pathname === '/guides/mobile-setup') return <MobileSetupGuide />;
  if (window.location.pathname === '/guides/solo-setup') return <SoloSetupGuide />;
  if (window.location.pathname === '/guides/chat-commands') return <ChatCommandsGuide />;
  // Legacy URL from before the guides hub existed — keep it working and consolidate to the
  // new canonical path so it doesn't linger as a second indexed URL for the same content.
  if (window.location.pathname === '/guide') {
    history.replaceState(null, '', '/guides/pickpocketing');
    return <PickpocketGuide />;
  }

  // If a setup token is present, show the setup view
  if (setupToken) {
    return (
      <SetupAccountView
        setupToken={setupToken}
        onSuccess={() => {
          setSetupToken(null);
          navigate({ name: 'active' });
        }}
      />
    );
  }

  if (resetToken) {
    return (
      <ResetPasswordView
        resetToken={resetToken}
        onSuccess={() => {
          setResetToken(null);
          navigate({ name: 'active' });
        }}
      />
    );
  }

  if (verifyEmailTokenValue) {
    return (
      <VerifyEmailView
        verifyToken={verifyEmailTokenValue}
        onDone={() => {
          setVerifyEmailTokenValue(null);
          navigate({ name: user ? 'settings' : 'login' });
        }}
      />
    );
  }

  if (view.name === 'login') {
    return (
      <LoginView
        onSuccess={() => navigate({ name: 'active' })}
        onForgotPassword={() => navigate({ name: 'forgot-password' })}
      />
    );
  }

  if (view.name === 'forgot-password') {
    return (
      <ForgotPasswordView onBack={() => navigate({ name: 'login' })} />
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.bg }}>
      <nav className="main-nav" style={nav.wrapper}>
        <div className='logo-container'>
          <span style={nav.brand}>Splash Helper</span>
        </div>
        <div className='nav-items'>
          <button
            style={nav.btn(view.name === 'active')}
            onClick={() => navigate({ name: 'active' })}
            type="button"
          >
            Active
          </button>
          {user && (
            <button
              style={nav.btn(view.name === 'user')}
              onClick={() => navigate({ name: 'user', username: user.username })}
              type="button"
            >
              Sessions
            </button>
          )}
          {user && (
            <button
              style={nav.btn(view.name === 'community')}
              onClick={() => navigate({ name: 'community' })}
              type="button"
            >
              Communities
            </button>
          )}
          {user?.isAdmin && (
            <button
              style={nav.btn(view.name === 'admin')}
              onClick={() => navigate({ name: 'admin' })}
              type="button"
            >
              Admin
            </button>
          )}
          {user && (
            <button
              style={nav.btn(view.name === 'settings')}
              onClick={() => navigate({ name: 'settings' })}
              type="button"
            >
              Account
            </button>
          )}
          <button
            style={nav.btn(view.name === 'bot')}
            onClick={() => navigate({ name: 'bot' })}
            type="button"
          >
            Discord Bot
          </button>
          <a href="/guides" style={{ ...nav.btn(false), textDecoration: 'none', display: 'inline-block' }}>
            Guides
          </a>
          {import.meta.env.DEV && (
            <button
              style={nav.btn(view.name === 'dev')}
              onClick={() => navigate({ name: 'dev' })}
              type="button"
            >
              Dev
            </button>
          )}
        </div> 

        <div style={nav.right}>
          {user ? (
            <>
              <span style={nav.username}>{user.username}</span>
              <button
                style={nav.logoutBtn}
                type="button"
                onClick={() => { logout(); navigate({ name: 'active' }); }}
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              style={nav.btn(false)}
              type="button"
              onClick={() => navigate({ name: 'login' })}
            >
              Sign in
            </button>
          )}
        </div>
      </nav>

      {introForView(view) && <InfoCorner key={view.name}>{introForView(view)}</InfoCorner>}

      {view.name === 'active' && (
        <AllSplashersView onSelectUser={(username) => navigate({ name: 'user', username })} />
      )}
      {view.name === 'user' && (
        <UserView
          username={view.username}
          onBack={() => navigate({ name: 'active' })}
          onLoginRequired={() => navigate({ name: 'login' })}
        />
      )}
      {view.name === 'admin' && (
        <AdminView onSelectUser={(username) => navigate({ name: 'user', username })} />
      )}
      {view.name === 'community' && <CommunityView />}
      {view.name === 'settings' && <AccountSettingsView />}
      {view.name === 'bot' && <DiscordBotView />}
      {view.name === 'dev' && <DevSessionsPanel />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
