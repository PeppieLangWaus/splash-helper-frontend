import { useEffect, useMemo, useState } from 'react';
import {
  adminGetUsers, adminGetSessions, adminPromoteUser, adminDeleteUser, adminDeleteSession,
  adminSetCommunityEligibility, adminGetCommunities, adminDeleteCommunity,
  adminAssignUsersToCommunity, adminRemoveUserFromCommunity, getCommunitySplashers,
} from '../api';
import { useAuth } from '../context/AuthContext';
import { useAdminSecret } from '../hooks/useAdminSecret';
import Menu, { type MenuItem } from '../components/Menu';
import { useContextMenu } from '../components/ContextMenu';
import Modal from '../components/Modal';
import type { AdminUser, ArchivedSession, Community, CommunitySplasher } from '../types';
import { colors, fontSerif } from '../theme';

const s = {
  container: { maxWidth: 960, margin: '0 auto', padding: '2rem 1rem' },
  heading: { fontFamily: fontSerif, fontSize: '1.6rem', fontWeight: 700, color: colors.text, marginBottom: '0.25rem' },
  subheading: { fontFamily: fontSerif, fontSize: '1.15rem', fontWeight: 700, color: colors.text, margin: '1.75rem 0 0.75rem' },
  badge: (active: boolean) => ({
    display: 'inline-block',
    padding: '0.1rem 0.45rem',
    borderRadius: 4,
    fontSize: '0.72rem',
    fontWeight: 600,
    background: active ? colors.accentSoft : colors.panelAlt,
    color: active ? colors.accentText : colors.textFaint,
  }),
  table: { width: '100%', borderCollapse: 'collapse' as const, background: colors.panel, borderRadius: 8, overflow: 'hidden', border: `1px solid ${colors.border}`, fontSize: '0.875rem' },
  // Same as `table` but without its own rounded corners — used when the table is already
  // nested inside a container (e.g. `userGroup`) that handles the rounding/clipping itself.
  tableFlat: { width: '100%', borderCollapse: 'collapse' as const, background: colors.panel, borderTop: `1px solid ${colors.border}`, fontSize: '0.875rem' },
  th: { background: colors.panelAlt, padding: '0.6rem 0.85rem', textAlign: 'left' as const, fontSize: '0.75rem', fontWeight: 700, color: colors.textMuted, borderBottom: `1px solid ${colors.border}`, textTransform: 'uppercase' as const, letterSpacing: '0.05em', whiteSpace: 'nowrap' as const },
  td: { padding: '0.6rem 0.85rem', color: colors.textMuted, borderBottom: `1px solid ${colors.border}`, verticalAlign: 'middle' as const },
  btnDanger: { padding: '0.25rem 0.65rem', background: colors.dangerSoft, border: `1px solid ${colors.danger}`, borderRadius: 5, color: colors.dangerText, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 },
  btnAction: { padding: '0.25rem 0.65rem', background: colors.accentSoft, border: `1px solid ${colors.accent}`, borderRadius: 5, color: colors.accentText, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, marginRight: '0.4rem' },
  btnSecondary: { padding: '0.4rem 0.85rem', background: '#3e2816', border: `1px solid ${colors.borderStrong}`, borderRadius: 6, color: colors.textMuted, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 },
  usernameLink: { background: 'none', border: 'none', padding: 0, color: colors.link, fontWeight: 600, cursor: 'pointer', fontSize: 'inherit' },
  errorBox: { padding: '0.65rem 0.85rem', background: colors.dangerSoft, border: `1px solid ${colors.danger}`, borderRadius: 6, color: colors.dangerText, fontSize: '0.875rem', marginBottom: '1rem' },
  successBox: { padding: '0.65rem 0.85rem', background: colors.successSoft, border: `1px solid ${colors.success}`, borderRadius: 6, color: colors.successText, fontSize: '0.875rem', marginBottom: '1rem' },
  label: { fontSize: '0.875rem', fontWeight: 600, color: colors.textMuted },
  emptyMsg: { color: colors.textFaint, textAlign: 'center' as const, padding: '2rem' },
  card: { background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 8, padding: '1.25rem', marginBottom: '1rem' },
  cardHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' },
  cardTitle: { fontFamily: fontSerif, fontSize: '1.05rem', fontWeight: 700, color: colors.text, marginBottom: '0.15rem' },
  cardMeta: { color: colors.textFaint, fontSize: '0.8rem' },
  memberRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: `1px solid ${colors.border}`, fontSize: '0.875rem' },
  addRow: { display: 'flex', gap: '0.5rem', marginTop: '0.75rem' },
  input: { padding: '0.4rem 0.6rem', background: colors.inputBg, border: `1px solid ${colors.inputBorder}`, borderRadius: 6, color: colors.text, fontSize: '0.875rem', flex: 1, outline: 'none' },
  tokenCell: { display: 'flex', alignItems: 'center', gap: '0.4rem' },
  tokenCode: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: '0.78rem',
    color: colors.textMuted,
    background: colors.panelAlt,
    border: `1px solid ${colors.border}`,
    borderRadius: 4,
    padding: '0.15rem 0.4rem',
  },
  suggestWrap: { position: 'relative' as const, flex: 1 },
  suggestList: {
    position: 'absolute' as const,
    top: '100%',
    left: 0,
    right: 0,
    marginTop: '0.2rem',
    background: colors.panel,
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
    zIndex: 20,
    maxHeight: 180,
    overflowY: 'auto' as const,
  },
  suggestItem: {
    display: 'block',
    width: '100%',
    textAlign: 'left' as const,
    background: 'none',
    border: 'none',
    padding: '0.4rem 0.65rem',
    fontSize: '0.85rem',
    color: colors.textMuted,
    cursor: 'pointer',
  },
  userGroup: { border: `1px solid ${colors.border}`, borderRadius: 8, marginBottom: '0.75rem', overflow: 'hidden' },
  userGroupHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.55rem 0.85rem',
    background: colors.panelAlt,
    cursor: 'pointer',
  },
  userGroupTitle: { fontWeight: 700, color: colors.text, fontSize: '0.9rem' },
  userGroupMeta: { color: colors.textFaint, fontSize: '0.78rem' },
  chevron: (open: boolean) => ({
    display: 'inline-block',
    transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
    transition: 'transform 0.15s',
    color: colors.textFaint,
    fontSize: '0.75rem',
  }),
  bulkBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.6rem 0.85rem',
    background: colors.panel,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    marginBottom: '0.75rem',
  },
  modalHint: { color: colors.textFaint, fontSize: '0.82rem', marginBottom: '0.9rem' },
  modalInput: { width: '100%', padding: '0.5rem 0.7rem', background: colors.inputBg, border: `1px solid ${colors.inputBorder}`, borderRadius: 6, color: colors.text, fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const, marginBottom: '0.75rem' },
  modalCheckRow: { display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: colors.textMuted, marginBottom: '1rem' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' },
} as const;

function fmt(n: number) { return n.toLocaleString(); }
function fmtDate(ts: number) { return new Date(ts).toLocaleString(); }

interface Props {
  onSelectUser?: (username: string) => void;
}

function AdminSecretModal({ onSubmit, onCancel }: { onSubmit: (secret: string, remember: boolean) => void; onCancel: () => void }) {
  const [value, setValue] = useState('');
  const [remember, setRemember] = useState(true);

  return (
    <Modal title="Admin secret required" onClose={onCancel}>
      <p style={s.modalHint}>This action (promote/demote) requires the admin secret.</p>
      <input
        style={s.modalInput}
        type="password"
        placeholder="Admin secret"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter' && value) onSubmit(value, remember);
        }}
      />
      <label style={s.modalCheckRow}>
        <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
        Remember for this session (otherwise you'll be asked again next time)
      </label>
      <div style={s.modalActions}>
        <button style={s.btnSecondary} type="button" onClick={onCancel}>Cancel</button>
        <button style={s.btnAction} type="button" disabled={!value} onClick={() => onSubmit(value, remember)}>
          Confirm
        </button>
      </div>
    </Modal>
  );
}

function UsernameAutocomplete({
  users,
  value,
  onChange,
  placeholder,
}: {
  users: AdminUser[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const [focused, setFocused] = useState(false);
  const query = value.trim().toLowerCase();
  const suggestions = query
    ? users.filter((u) => u.username.toLowerCase().includes(query)).slice(0, 8)
    : [];

  return (
    <div style={s.suggestWrap}>
      <input
        style={s.input}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 120)}
      />
      {focused && suggestions.length > 0 && (
        <div style={s.suggestList}>
          {suggestions.map((u) => (
            <button
              key={u._id}
              type="button"
              style={s.suggestItem}
              onMouseDown={() => onChange(u.username)}
              onMouseEnter={(e) => { e.currentTarget.style.background = colors.panelHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
            >
              {u.username}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CommunityCard({
  community,
  users,
  showFeedback,
  onDeleted,
}: {
  community: Community;
  users: AdminUser[];
  showFeedback: (type: 'error' | 'success', message: string) => void;
  onDeleted: () => void;
}) {
  const { token } = useAuth();
  const [splashers, setSplashers] = useState<CommunitySplasher[]>([]);
  const [newUsername, setNewUsername] = useState('');

  async function loadMembers() {
    if (!token) return;
    try {
      setSplashers(await getCommunitySplashers(community._id, token));
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Failed to load members');
    }
  }

  useEffect(() => { void loadMembers(); }, [community._id, token]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAssign() {
    if (!token || !newUsername.trim()) return;
    try {
      const result = await adminAssignUsersToCommunity(community._id, [newUsername.trim()], token);
      if (result.notFound.length > 0) {
        showFeedback('error', `User "${result.notFound.join(', ')}" not found`);
      } else {
        showFeedback('success', result.message);
      }
      setNewUsername('');
      void loadMembers();
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Failed to assign splasher');
    }
  }

  async function handleRemove(username: string) {
    if (!token) return;
    try {
      await adminRemoveUserFromCommunity(community._id, username, token);
      showFeedback('success', `Removed "${username}" from "${community.name}"`);
      void loadMembers();
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Failed to remove splasher');
    }
  }

  async function handleDelete() {
    if (!token) return;
    if (!confirm(`Delete community "${community.name}"? This does not delete its splashers.`)) return;
    try {
      await adminDeleteCommunity(community._id, token);
      showFeedback('success', `Community "${community.name}" deleted`);
      onDeleted();
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Delete failed');
    }
  }

  return (
    <div style={s.card}>
      <div style={s.cardHeader}>
        <div>
          <div style={s.cardTitle}>{community.name}</div>
          <div style={s.cardMeta}>
            {splashers.length} splasher{splashers.length === 1 ? '' : 's'} · created {new Date(community.createdAt).toLocaleString()}
          </div>
        </div>
        <button style={s.btnDanger} type="button" onClick={handleDelete}>Delete</button>
      </div>

      {splashers.map((sp) => (
        <div key={sp._id} style={s.memberRow}>
          <span>{sp.username}</span>
          <button style={s.btnDanger} type="button" onClick={() => handleRemove(sp.username)}>Remove</button>
        </div>
      ))}

      <div style={s.addRow}>
        <UsernameAutocomplete users={users} value={newUsername} onChange={setNewUsername} placeholder="Username to add" />
        <button style={s.btnAction} type="button" onClick={() => void handleAssign()}>Add</button>
      </div>
    </div>
  );
}

export default function AdminView({ onSelectUser }: Props) {
  const { token } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [sessions, setSessions] = useState<ArchivedSession[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'sessions' | 'communities'>('users');
  const [revealedTokens, setRevealedTokens] = useState<Set<string>>(new Set());
  const [collapsedUsers, setCollapsedUsers] = useState<Set<string>>(new Set());
  const [selectedSessionIds, setSelectedSessionIds] = useState<Set<string>>(new Set());

  const adminSecretMgr = useAdminSecret();
  const contextMenu = useContextMenu();

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

  async function loadCommunities() {
    if (!token) return;
    try {
      setCommunities(await adminGetCommunities(token));
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Failed to load communities');
    }
  }

  useEffect(() => {
    void loadUsers();
    void loadSessions();
    void loadCommunities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function handlePromote(username: string) {
    if (!token) return;
    adminSecretMgr.withSecret((secret) => {
      adminPromoteUser(username, secret, token)
        .then((result) => {
          showFeedback('success', result.message);
          void loadUsers();
        })
        .catch((err) => showFeedback('error', err instanceof Error ? err.message : 'Promote failed'));
    });
  }

  async function handleToggleCommunityEligibility(username: string) {
    if (!token) return;
    try {
      const result = await adminSetCommunityEligibility(username, token);
      showFeedback('success', result.message);
      void loadUsers();
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Failed to update eligibility');
    }
  }

  function toggleTokenRevealed(username: string) {
    setRevealedTokens((prev) => {
      const next = new Set(prev);
      if (next.has(username)) next.delete(username);
      else next.add(username);
      return next;
    });
  }

  async function handleCopyToken(token: string) {
    try {
      await navigator.clipboard.writeText(token);
      showFeedback('success', 'Token copied to clipboard');
    } catch {
      showFeedback('error', 'Could not copy — clipboard access was denied');
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

  async function handleBulkDeleteSessions() {
    if (!token || selectedSessionIds.size === 0) return;
    if (!confirm(`Delete ${selectedSessionIds.size} selected session(s)? This cannot be undone.`)) return;
    const ids = [...selectedSessionIds];
    let failures = 0;
    for (const id of ids) {
      try {
        await adminDeleteSession(id, token);
      } catch {
        failures += 1;
      }
    }
    setSelectedSessionIds(new Set());
    void loadSessions();
    showFeedback(
      failures === 0 ? 'success' : 'error',
      failures === 0 ? `Deleted ${ids.length} session(s)` : `Deleted ${ids.length - failures} of ${ids.length} — ${failures} failed`,
    );
  }

  function userActions(u: AdminUser): MenuItem[] {
    return [
      { label: u.isAdmin ? 'Demote' : 'Promote', onClick: () => handlePromote(u.username) },
      {
        label: u.communityEligible ? 'Revoke community' : 'Allow community',
        onClick: () => void handleToggleCommunityEligibility(u.username),
      },
      { label: 'Delete', danger: true, onClick: () => void handleDeleteUser(u.username) },
    ];
  }

  function toggleUserCollapsed(username: string) {
    setCollapsedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(username)) next.delete(username);
      else next.add(username);
      return next;
    });
  }

  function toggleSessionSelected(sessionId: string) {
    setSelectedSessionIds((prev) => {
      const next = new Set(prev);
      if (next.has(sessionId)) next.delete(sessionId);
      else next.add(sessionId);
      return next;
    });
  }

  function toggleGroupSelected(ids: string[], checked: boolean) {
    setSelectedSessionIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }

  const sessionsByUser = useMemo(() => {
    const map = new Map<string, ArchivedSession[]>();
    for (const entry of sessions) {
      const arr = map.get(entry.username) ?? [];
      arr.push(entry);
      map.set(entry.username, arr);
    }
    for (const arr of map.values()) arr.sort((a, b) => b.createdTimestamp - a.createdTimestamp);
    return [...map.entries()].sort((a, b) => b[1][0].createdTimestamp - a[1][0].createdTimestamp);
  }, [sessions]);

  const tabStyle = (active: boolean) => ({
    padding: '0.45rem 1rem',
    border: `1px solid ${active ? colors.accent : colors.borderStrong}`,
    borderRadius: 6,
    background: active ? colors.accent : '#3e2816',
    color: active ? '#fff' : colors.textMuted,
    cursor: 'pointer',
    fontFamily: fontSerif,
    fontWeight: 700,
    fontSize: '0.875rem',
  });

  return (
    <div style={s.container}>
      <h2 style={s.heading}>Admin Panel</h2>

      {feedback && (
        <div style={feedback.type === 'error' ? s.errorBox : s.successBox}>{feedback.message}</div>
      )}

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <button style={tabStyle(activeTab === 'users')} onClick={() => setActiveTab('users')} type="button">
          Users ({users.length})
        </button>
        <button style={tabStyle(activeTab === 'sessions')} onClick={() => setActiveTab('sessions')} type="button">
          Sessions ({sessions.length})
        </button>
        <button style={tabStyle(activeTab === 'communities')} onClick={() => setActiveTab('communities')} type="button">
          Communities ({communities.length})
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
                  <th style={s.th}>Token</th>
                  <th style={s.th}>Admin</th>
                  <th style={s.th}>Account set up</th>
                  <th style={s.th}>Community Eligible</th>
                  <th style={s.th}>Created</th>
                  <th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} onContextMenu={(e) => contextMenu.open(e, userActions(u))}>
                    <td style={s.td}>
                      <button style={s.usernameLink} type="button" onClick={() => onSelectUser?.(u.username)}>
                        {u.username}
                      </button>
                    </td>
                    <td style={s.td}>
                      <div style={s.tokenCell}>
                        {revealedTokens.has(u.username) ? (
                          <>
                            <code style={s.tokenCode}>{u.token}</code>
                            <button style={s.btnAction} type="button" onClick={() => handleCopyToken(u.token)}>
                              Copy
                            </button>
                            <button style={s.btnAction} type="button" onClick={() => toggleTokenRevealed(u.username)}>
                              Hide
                            </button>
                          </>
                        ) : (
                          <button style={s.btnAction} type="button" onClick={() => toggleTokenRevealed(u.username)}>
                            Show
                          </button>
                        )}
                      </div>
                    </td>
                    <td style={s.td}><span style={s.badge(u.isAdmin)}>{u.isAdmin ? 'Yes' : 'No'}</span></td>
                    <td style={s.td}><span style={s.badge(u.setupLinkUsed)}>{u.setupLinkUsed ? 'Yes' : 'Pending'}</span></td>
                    <td style={s.td}><span style={s.badge(u.communityEligible)}>{u.communityEligible ? 'Yes' : 'No'}</span></td>
                    <td style={s.td}>{new Date(u.createdAt).toLocaleString()}</td>
                    <td style={s.td}>
                      <Menu items={userActions(u)} />
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
            <>
              {selectedSessionIds.size > 0 && (
                <div style={s.bulkBar}>
                  <span style={s.label}>{selectedSessionIds.size} selected</span>
                  <button style={s.btnDanger} type="button" onClick={() => void handleBulkDeleteSessions()}>
                    Delete selected
                  </button>
                  <button style={s.btnSecondary} type="button" onClick={() => setSelectedSessionIds(new Set())}>
                    Clear selection
                  </button>
                </div>
              )}
              {sessionsByUser.map(([username, userSessions]) => {
                const collapsed = collapsedUsers.has(username);
                const ids = userSessions.map((entry) => entry.sessionId);
                const allSelected = ids.length > 0 && ids.every((id) => selectedSessionIds.has(id));
                return (
                  <div key={username} style={s.userGroup}>
                    <div style={s.userGroupHeader} onClick={() => toggleUserCollapsed(username)}>
                      <span style={s.chevron(!collapsed)}>▶</span>
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => toggleGroupSelected(ids, e.target.checked)}
                        title="Select all sessions for this user"
                      />
                      <span style={s.userGroupTitle}>{username}</span>
                      <span style={s.userGroupMeta}>{userSessions.length} session{userSessions.length === 1 ? '' : 's'}</span>
                    </div>
                    {!collapsed && (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={s.tableFlat}>
                          <thead>
                            <tr>
                              <th style={s.th}></th>
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
                            {userSessions.map((entry) => {
                              const d = entry.session;
                              return (
                                <tr key={entry.sessionId}>
                                  <td style={s.td}>
                                    <input
                                      type="checkbox"
                                      checked={selectedSessionIds.has(entry.sessionId)}
                                      onChange={() => toggleSessionSelected(entry.sessionId)}
                                    />
                                  </td>
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
                  </div>
                );
              })}
            </>
          )}
        </>
      )}

      {/* Communities tab */}
      {activeTab === 'communities' && (
        <>
          {communities.length === 0 ? (
            <p style={s.emptyMsg}>No communities found.</p>
          ) : (
            communities.map((community) => (
              <CommunityCard
                key={community._id}
                community={community}
                users={users}
                showFeedback={showFeedback}
                onDeleted={() => void loadCommunities()}
              />
            ))
          )}
        </>
      )}

      {contextMenu.menu}

      {adminSecretMgr.modalOpen && (
        <AdminSecretModal onSubmit={adminSecretMgr.submit} onCancel={adminSecretMgr.cancel} />
      )}
    </div>
  );
}
