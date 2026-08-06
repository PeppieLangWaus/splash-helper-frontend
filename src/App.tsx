import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AllSplashersView from './views/AllSplashersView';
import UserView from './views/UserView';
import LoginView from './views/LoginView';
import ForgotPasswordView from './views/ForgotPasswordView';
import SetupAccountView from './views/SetupAccountView';
import AdminView from './views/AdminView';
import CommunityView from './views/CommunityView';
import AccountSettingsView from './views/AccountSettingsView';
import DevSessionsPanel from './views/DevSessionsPanel';
import DiscordBotView from './views/DiscordBotView';
import TermsOfServiceView from './views/TermsOfServiceView';
import PrivacyPolicyView from './views/PrivacyPolicyView';
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

const nav = {
  wrapper: {
    background: '#1c150f',
    borderBottom: `4px solid ${colors.border}`,
    boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
    padding: '0 1.5rem',
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
      if (window.location.pathname === '/setup') return;
      setView(pathToView(window.location.pathname));
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle setup link: /setup?token=...
  const [setupToken, setSetupToken] = useState<string | null>(null);
  useEffect(() => {
    if (window.location.pathname === '/setup') {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      if (token) setSetupToken(token);
    }
  }, []);

  // Standalone legal pages, e.g. linked from the Discord bot's settings —
  // always reachable at their own URL, outside the nav/login-gated shell.
  if (window.location.pathname === '/terms') return <TermsOfServiceView />;
  if (window.location.pathname === '/privacy') return <PrivacyPolicyView />;

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
      <ForgotPasswordView
        onSuccess={() => navigate({ name: 'active' })}
        onBack={() => navigate({ name: 'login' })}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.bg }}>
      <nav style={nav.wrapper}>
        <span style={nav.brand}>Splash Helper</span>
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
        {import.meta.env.DEV && (
          <button
            style={nav.btn(view.name === 'dev')}
            onClick={() => navigate({ name: 'dev' })}
            type="button"
          >
            Dev
          </button>
        )}

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
