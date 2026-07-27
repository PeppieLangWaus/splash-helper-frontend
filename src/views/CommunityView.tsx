import { useEffect, useState } from 'react';
import {
  getMyCommunities,
  createCommunity,
  setCommunityWebhook,
  getCommunitySplashers,
  setCommunityMemberWebhook,
} from '../api';
import { useAuth } from '../context/AuthContext';
import WebhookFieldsEditor from '../components/WebhookFieldsEditor';
import type { Community, CommunitySplasher } from '../types';

const s = {
  container: { maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' },
  heading: { fontSize: '1.5rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.25rem' },
  subtext: { color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' },
  errorBox: { padding: '0.65rem 0.85rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 6, color: '#991b1b', fontSize: '0.875rem', marginBottom: '1rem' },
  successBox: { padding: '0.65rem 0.85rem', background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 6, color: '#065f46', fontSize: '0.875rem', marginBottom: '1rem' },
  createRow: { display: 'flex', gap: '0.5rem', marginBottom: '1.75rem' },
  input: { padding: '0.5rem 0.7rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.875rem', flex: 1, outline: 'none' },
  btnPrimary: { padding: '0.5rem 1rem', background: '#1e3a5f', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 },
  card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1.25rem', marginBottom: '1rem' },
  cardTitle: { fontSize: '1.05rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.15rem' },
  cardMeta: { color: '#9ca3af', fontSize: '0.8rem', marginBottom: '1rem' },
  fieldHint: { color: '#9ca3af', fontSize: '0.78rem', marginTop: '0.75rem' },
  subheading: { fontSize: '0.95rem', fontWeight: 700, color: '#374151', margin: '1.25rem 0 0.75rem' },
  splasherRow: { border: '1px solid #f3f4f6', borderRadius: 6, marginBottom: '0.5rem' },
  splasherHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.55rem 0.75rem', cursor: 'pointer' },
  splasherName: { fontSize: '0.875rem', fontWeight: 600, color: '#374151' },
  toggleHint: { fontSize: '0.78rem', color: '#2563eb', fontWeight: 600 },
  splasherBody: { padding: '0 0.75rem 0.9rem' },
  emptyMsg: { color: '#9ca3af', textAlign: 'center' as const, padding: '1.5rem' },
} as const;

function CommunityWebhookForm({
  community,
  onSaved,
}: {
  community: Community;
  onSaved: (updated: Community) => void;
}) {
  const { token } = useAuth();

  async function saveActive(value: string) {
    if (!token) return;
    onSaved(await setCommunityWebhook(community._id, { activeWebhookUrl: value }, token));
  }

  async function saveHistory(value: string) {
    if (!token) return;
    onSaved(await setCommunityWebhook(community._id, { historyWebhookUrl: value }, token));
  }

  return (
    <div>
      <WebhookFieldsEditor
        activeUrl={community.discordActiveWebhookUrl}
        historyUrl={community.discordHistoryWebhookUrl}
        onSaveActive={saveActive}
        onSaveHistory={saveHistory}
      />
      <p style={s.fieldHint}>
        The active-sessions webhook shows every member's current session; the history webhook
        posts each member's archived sessions as they finish.
      </p>
    </div>
  );
}

function MemberWebhookRow({ communityId, splasher, onSaved }: {
  communityId: string;
  splasher: CommunitySplasher;
  onSaved: (updated: CommunitySplasher) => void;
}) {
  const { token } = useAuth();
  const [expanded, setExpanded] = useState(false);

  async function saveActive(value: string) {
    if (!token) return;
    const result = await setCommunityMemberWebhook(communityId, splasher.username, { activeWebhookUrl: value }, token);
    onSaved({ ...splasher, ...result });
  }

  async function saveHistory(value: string) {
    if (!token) return;
    const result = await setCommunityMemberWebhook(communityId, splasher.username, { historyWebhookUrl: value }, token);
    onSaved({ ...splasher, ...result });
  }

  const hasOverride = !!(splasher.discordActiveWebhookUrl || splasher.discordHistoryWebhookUrl);

  return (
    <div style={s.splasherRow}>
      <div style={s.splasherHeader} onClick={() => setExpanded((v) => !v)}>
        <span style={s.splasherName}>
          {splasher.username}
          {hasOverride && <span style={{ color: '#065f46', fontWeight: 600 }}> · personal webhook set</span>}
        </span>
        <span style={s.toggleHint}>{expanded ? 'Hide' : 'Edit webhook'}</span>
      </div>
      {expanded && (
        <div style={s.splasherBody}>
          <WebhookFieldsEditor
            activeUrl={splasher.discordActiveWebhookUrl}
            historyUrl={splasher.discordHistoryWebhookUrl}
            onSaveActive={saveActive}
            onSaveHistory={saveHistory}
          />
        </div>
      )}
    </div>
  );
}

function CommunitySplashersPanel({ communityId }: { communityId: string }) {
  const { token } = useAuth();
  const [splashers, setSplashers] = useState<CommunitySplasher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    getCommunitySplashers(communityId, token)
      .then(setSplashers)
      .finally(() => setLoading(false));
  }, [communityId, token]);

  function handleSaved(updated: CommunitySplasher) {
    setSplashers((prev) => prev.map((s2) => (s2._id === updated._id ? updated : s2)));
  }

  if (loading) return <p style={s.fieldHint}>Loading splashers...</p>;
  if (splashers.length === 0) return <p style={s.fieldHint}>No splashers assigned yet.</p>;

  return (
    <div>
      {splashers.map((splasher) => (
        <MemberWebhookRow key={splasher._id} communityId={communityId} splasher={splasher} onSaved={handleSaved} />
      ))}
    </div>
  );
}

export default function CommunityView() {
  const { token } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  function showFeedback(type: 'error' | 'success', message: string) {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  }

  async function loadCommunities() {
    if (!token) return;
    try {
      setCommunities(await getMyCommunities(token));
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Failed to load communities');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadCommunities(); }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !newName.trim()) return;
    setCreating(true);
    try {
      const community = await createCommunity(newName.trim(), token);
      setCommunities((prev) => [...prev, community]);
      setNewName('');
      showFeedback('success', `Created "${community.name}"`);
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Failed to create community');
    } finally {
      setCreating(false);
    }
  }

  function handleWebhookSaved(updated: Community) {
    setCommunities((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
  }

  return (
    <div style={s.container}>
      <h2 style={s.heading}>My Community</h2>
      <p style={s.subtext}>
        Manage the Discord webhooks your splashers' history and active sessions post to, and
        set personal overrides for individual members.
      </p>

      {feedback && (
        <div style={feedback.type === 'error' ? s.errorBox : s.successBox}>{feedback.message}</div>
      )}

      <form style={s.createRow} onSubmit={handleCreate}>
        <input
          style={s.input}
          type="text"
          placeholder="New community name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          disabled={creating}
        />
        <button style={s.btnPrimary} type="submit" disabled={creating || !newName.trim()}>
          Create
        </button>
      </form>

      {loading ? (
        <p style={s.emptyMsg}>Loading...</p>
      ) : communities.length === 0 ? (
        <p style={s.emptyMsg}>You don't own any communities yet.</p>
      ) : (
        communities.map((community) => (
          <div key={community._id} style={s.card}>
            <div style={s.cardTitle}>{community.name}</div>
            <div style={s.cardMeta}>{community.memberUserIds.length} splasher{community.memberUserIds.length === 1 ? '' : 's'}</div>
            <CommunityWebhookForm community={community} onSaved={handleWebhookSaved} />

            <h4 style={s.subheading}>Per-splasher overrides</h4>
            <CommunitySplashersPanel communityId={community._id} />
          </div>
        ))
      )}
    </div>
  );
}
