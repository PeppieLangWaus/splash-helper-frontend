import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import UploadView from './views/UploadView';
import AllSplashersView from './views/AllSplashersView';
import UserView from './views/UserView';
import LoginView from './views/LoginView';
import SetupAccountView from './views/SetupAccountView';
import AdminView from './views/AdminView';
import CommunityView from './views/CommunityView';
import DevSessionsPanel from './views/DevSessionsPanel';

type View =
  | { name: 'active' }
  | { name: 'upload' }
  | { name: 'user'; username: string }
  | { name: 'login' }
  | { name: 'admin' }
  | { name: 'community' }
  | { name: 'dev' };

const nav = {
  wrapper: {
    background: '#1e3a5f',
    padding: '0 1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    height: 52,
  },
  brand: {
    color: '#fff',
    fontWeight: 700,
    fontSize: '1rem',
    marginRight: '1.5rem',
    letterSpacing: '-0.01em',
  },
  btn: (active: boolean) => ({
    background: active ? 'rgba(255,255,255,0.15)' : 'none',
    border: 'none',
    borderRadius: 6,
    color: active ? '#fff' : 'rgba(255,255,255,0.65)',
    padding: '0.4rem 0.85rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: active ? 600 : 400,
  }),
  right: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  username: { color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' },
  logoutBtn: {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 6,
    color: 'rgba(255,255,255,0.75)',
    padding: '0.3rem 0.75rem',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
} as const;

function AppInner() {
  const { user, logout } = useAuth();
  const [view, setView] = useState<View>({ name: 'active' });

  // Handle setup link: /setup?token=...
  const [setupToken, setSetupToken] = useState<string | null>(null);
  useEffect(() => {
    if (window.location.pathname === '/setup') {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      if (token) setSetupToken(token);
    }
  }, []);

  // If a setup token is present, show the setup view
  if (setupToken) {
    return (
      <SetupAccountView
        setupToken={setupToken}
        onSuccess={() => {
          setSetupToken(null);
          history.replaceState({}, "", '/');
          setView({ name: 'active' });
        }}
      />
    );
  }

  if (view.name === 'login') {
    return <LoginView onSuccess={() => setView({ name: 'active' })} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', fontFamily: 'system-ui, sans-serif' }}>
      <nav style={nav.wrapper}>
        <span style={nav.brand}>Splash Helper</span>
        <button
          style={nav.btn(view.name === 'active')}
          onClick={() => setView({ name: 'active' })}
          type="button"
        >
          Active
        </button>
        <button
          style={nav.btn(view.name === 'upload')}
          onClick={() => setView({ name: 'upload' })}
          type="button"
        >
          Upload
        </button>
        {user && (
          <button
            style={nav.btn(view.name === 'user')}
            onClick={() => setView({ name: 'user', username: user.username })}
            type="button"
          >
            My Sessions
          </button>
        )}
        {user?.communityEligible && (
          <button
            style={nav.btn(view.name === 'community')}
            onClick={() => setView({ name: 'community' })}
            type="button"
          >
            My Community
          </button>
        )}
        {user?.isAdmin && (
          <button
            style={nav.btn(view.name === 'admin')}
            onClick={() => setView({ name: 'admin' })}
            type="button"
          >
            Admin
          </button>
        )}
        {import.meta.env.DEV && (
          <button
            style={nav.btn(view.name === 'dev')}
            onClick={() => setView({ name: 'dev' })}
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
                onClick={() => { logout(); setView({ name: 'active' }); }}
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              style={nav.btn(false)}
              type="button"
              onClick={() => setView({ name: 'login' })}
            >
              Sign in
            </button>
          )}
        </div>
      </nav>

      {view.name === 'active' && (
        <AllSplashersView onSelectUser={(username) => setView({ name: 'user', username })} />
      )}
      {view.name === 'upload' && <UploadView />}
      {view.name === 'user' && (
        <UserView
          username={view.username}
          onBack={() => setView({ name: 'active' })}
          onLoginRequired={() => setView({ name: 'login' })}
        />
      )}
      {view.name === 'admin' && (
        <AdminView onSelectUser={(username) => setView({ name: 'user', username })} />
      )}
      {view.name === 'community' && <CommunityView />}
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
