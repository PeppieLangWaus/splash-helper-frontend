import { useEffect, useState } from 'react';
import { adminGetUsers, adminGetSessions, adminPromoteUser, adminDeleteUser, adminDeleteSession } from '../api';
import { useAuth } from '../context/AuthContext';
import type { AdminUser, ArchivedSession } from '../types';

const s = {
  container: { maxWidth: 960, margin: '0 auto', padding: '2rem 1rem' },
  heading: { fontSize: '1.5rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.25rem' },
  subheading: { fontSize: '1.1rem', fontWeight: 700, color: '#374151', margin: '1.75rem 0 0.75rem' },
  badge: (active: boolean) => ({
    display: 'inline-block',
    padding: '0.1rem 0.45rem',
    borderRadius: 4,
    fontSize: '0.72rem',
    fontWeight: 600,
    background: active ? '#dbeafe' : '#f3f4f6',
    color: active ? '#1d4ed8' : '#6b7280',
  }),
  table: { width: '100%', borderCollapse: 'collapse' as const, background: '#fff', borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb', fontSize: '0.875rem' },
  th: { background: '#f9fafb', padding: '0.6rem 0.85rem', textAlign: 'left' as const, fontSize: '0.75rem', fontWeight: 700, color: '#374151', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase' as const, letterSpacing: '0.05em', whiteSpace: 'nowrap' as const },
  td: { padding: '0.6rem 0.85rem', color: '#374151', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' as const },
  btnDanger: { padding: '0.25rem 0.65rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 5, color: '#991b1b', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 },
  btnAction: { padding: '0.25rem 0.65rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 5, color: '#1d4ed8', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, marginRight: '0.4rem' },
  errorBox: { padding: '0.65rem 0.85rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 6, color: '#991b1b', fontSize: '0.875rem', marginBottom: '1rem' },
  successBox: { padding: '0.65rem 0.85rem', background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 6, color: '#065f46', fontSize: '0.875rem', marginBottom: '1rem' },
  secretRow: { display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' },
  secretInput: { padding: '0.45rem 0.65rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.875rem', flex: 1, maxWidth: 280, outline: 'none' },
  label: { fontSize: '0.875rem', fontWeight: 600, color: '#374151' },
  emptyMsg: { color: '#9ca3af', textAlign: 'center' as const, padding: '2rem' },
} as const;

function fmt(n: number) { return n.toLocaleString(); }
function fmtDate(ts: number) { return new Date(ts).toLocaleString(); }

export default function AdminView() {
  const { token } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [sessions, setSessions] = useState<ArchivedSession[]>([]);
  const [adminSecret, setAdminSecret] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'sessions'>('users');

  function showFeedback(type: 'error' | 'success', message: string) {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  }

  async function loadUsers() {
    if (!token) return;
    try {
      setUsers(await adminGetUsers(token));
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Failed to load users');
    }
  }

  async function loadSessions() {
    if (!token) return;
    try {
      setSessions(await adminGetSessions(token));
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Failed to load sessions');
    }
  }

  useEffect(() => { void loadUsers(); void loadSessions(); }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handlePromote(username: string) {
    if (!token || !adminSecret) { showFeedback('error', 'Enter admin secret first'); return; }
    try {
      const result = await adminPromoteUser(username, adminSecret, token);
      showFeedback('success', result.message);
      void loadUsers();
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Promote failed');
    }
  }

  async function handleDeleteUser(username: string) {
    if (!token) return;
    if (!confirm(`Delete user "${username}" and ALL their sessions? This cannot be undone.`)) return;
    try {
      await adminDeleteUser(username, token);
      showFeedback('success', `User "${username}" deleted`);
      void loadUsers();
      void loadSessions();
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Delete failed');
    }
  }

  async function handleDeleteSession(sessionId: string) {
    if (!token) return;
    if (!confirm(`Delete session "${sessionId}"?`)) return;
    try {
      await adminDeleteSession(sessionId, token);
      showFeedback('success', 'Session deleted');
      void loadSessions();
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Delete failed');
    }
  }

  const tabStyle = (active: boolean) => ({
    padding: '0.45rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    background: active ? '#1e3a5f' : '#fff',
    color: active ? '#fff' : '#374151',
    cursor: 'pointer',
    fontWeight: active ? 600 : 400,
    fontSize: '0.875rem',
  });

  return (
    <div style={s.container}>
      <h2 style={s.heading}>Admin Panel</h2>

      {feedback && (
        <div style={feedback.type === 'error' ? s.errorBox : s.successBox}>{feedback.message}</div>
      )}

      {/* Admin secret for promote/demote */}
      <div style={s.secretRow}>
        <label style={s.label} htmlFor="admin-secret">Admin secret:</label>
        <input
          id="admin-secret"
          style={s.secretInput}
          type="password"
          placeholder="Required for promote/demote"
          value={adminSecret}
          onChange={(e) => setAdminSecret(e.target.value)}
        />
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <button style={tabStyle(activeTab === 'users')} onClick={() => setActiveTab('users')} type="button">
          Users ({users.length})
        </button>
        <button style={tabStyle(activeTab === 'sessions')} onClick={() => setActiveTab('sessions')} type="button">
          Sessions ({sessions.length})
        </button>
      </div>

      {/* Users tab */}
      {activeTab === 'users' && (
        <>
          {users.length === 0 ? (
            <p style={s.emptyMsg}>No users found.</p>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Username</th>
                  <th style={s.th}>Admin</th>
                  <th style={s.th}>Account set up</th>
                  <th style={s.th}>Created</th>
                  <th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td style={s.td}>{u.username}</td>
                    <td style={s.td}><span style={s.badge(u.isAdmin)}>{u.isAdmin ? 'Yes' : 'No'}</span></td>
                    <td style={s.td}><span style={s.badge(u.setupLinkUsed)}>{u.setupLinkUsed ? 'Yes' : 'Pending'}</span></td>
                    <td style={s.td}>{new Date(u.createdAt).toLocaleString()}</td>
                    <td style={s.td}>
                      <button
                        style={s.btnAction}
                        type="button"
                        onClick={() => handlePromote(u.username)}
                        title={adminSecret ? undefined : 'Enter admin secret first'}
                      >
                        {u.isAdmin ? 'Demote' : 'Promote'}
                      </button>
                      <button style={s.btnDanger} type="button" onClick={() => handleDeleteUser(u.username)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* Sessions tab */}
      {activeTab === 'sessions' && (
        <>
          {sessions.length === 0 ? (
            <p style={s.emptyMsg}>No archived sessions.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Username</th>
                    <th style={s.th}>Date</th>
                    <th style={s.th}>Spell</th>
                    <th style={s.th}>World</th>
                    <th style={s.th}>Spells Cast</th>
                    <th style={s.th}>XP Gained</th>
                    <th style={s.th}>Rune Cost (gp)</th>
                    <th style={s.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[...sessions]
                    .sort((a, b) => b.createdTimestamp - a.createdTimestamp)
                    .map((entry) => {
                      const d = entry.session;
                      return (
                        <tr key={entry.sessionId}>
                          <td style={s.td}>{entry.username}</td>
                          <td style={{ ...s.td, whiteSpace: 'nowrap' }}>{fmtDate(entry.createdTimestamp)}</td>
                          <td style={s.td}>{d.spell}</td>
                          <td style={s.td}>{d.world}</td>
                          <td style={s.td}>{fmt(d.spellsCast)}</td>
                          <td style={s.td}>{fmt(d.currentMagicXp - d.startMagicXp)}</td>
                          <td style={s.td}>{fmt(d.runeCostGp)}</td>
                          <td style={s.td}>
                            <button
                              style={s.btnDanger}
                              type="button"
                              onClick={() => handleDeleteSession(entry.sessionId)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
