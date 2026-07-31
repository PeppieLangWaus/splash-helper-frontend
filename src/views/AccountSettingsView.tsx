import { useEffect, useState } from 'react';
import {
  getArchivedSessions,
  setSplasherWebhook,
  getMyCommunities,
  regenerateCommunityApiToken,
  getAllCommunities,
  applyToCommunity,
} from '../api';
import { useAuth } from '../context/AuthContext';
import WebhookFieldsEditor from '../components/WebhookFieldsEditor';
import CopyableField from '../components/CopyableField';
import type { Community, CommunitySummary, SplasherWebhooks } from '../types';

const s = {
  container: { maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' },
  heading: { fontSize: '1.5rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.25rem' },
  subtext: { color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' },
  card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1.25rem', marginBottom: '1rem' },
  cardTitle: { fontSize: '1.05rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.9rem' },
  fieldHint: { color: '#9ca3af', fontSize: '0.78rem', marginTop: '0.75rem' },
  errorBox: { padding: '0.65rem 0.85rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 6, color: '#991b1b', fontSize: '0.875rem', marginBottom: '1rem' },
  successBox: { padding: '0.65rem 0.85rem', background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 6, color: '#065f46', fontSize: '0.875rem', marginBottom: '1rem' },
  emptyMsg: { color: '#9ca3af', fontSize: '0.85rem' },
  communityRow: { display: 'flex', flexDirection: 'column' as const, gap: '0.5rem', marginBottom: '1rem' },
  communityName: { fontSize: '0.9rem', fontWeight: 600, color: '#374151' },
  applyRow: { display: 'flex', gap: '0.5rem' },
  select: { padding: '0.5rem 0.7rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.875rem', flex: 1 },
  btnPrimary: { padding: '0.5rem 1rem', background: '#1e3a5f', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 },
} as const;

export default function AccountSettingsView() {
  const { token, user } = useAuth();
  const [pluginToken, setPluginToken] = useState<string | null>(null);
  const [webhooks, setWebhooks] = useState<SplasherWebhooks>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [ownedCommunities, setOwnedCommunities] = useState<Community[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  const [allCommunities, setAllCommunities] = useState<CommunitySummary[]>([]);
  const [applyTarget, setApplyTarget] = useState('');
  const [applying, setApplying] = useState(false);

  function showFeedback(type: 'error' | 'success', message: string) {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  }

  useEffect(() => {
    if (!token || !user) return;
    setLoading(true);
    setError(null);
    getArchivedSessions(user.username, token)
      .then((data) => {
        setPluginToken(data.token ?? null);
        setWebhooks({
          discordActiveWebhookUrl: data.discordActiveWebhookUrl,
          discordHistoryWebhookUrl: data.discordHistoryWebhookUrl,
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load account data.'))
      .finally(() => setLoading(false));
  }, [token, user]);

  useEffect(() => {
    if (!token) return;
    getAllCommunities(token).then(setAllCommunities).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token || !user?.communityEligible) return;
    getMyCommunities(token).then(setOwnedCommunities).catch(() => {});
  }, [token, user]);

  async function saveActiveWebhook(value: string) {
    if (!token || !user) return;
    setWebhooks(await setSplasherWebhook(user.username, { activeWebhookUrl: value }, token));
  }

  async function saveHistoryWebhook(value: string) {
    if (!token || !user) return;
    setWebhooks(await setSplasherWebhook(user.username, { historyWebhookUrl: value }, token));
  }

  async function handleRegenerate(communityId: string) {
    if (!token) return;
    const apiToken = await regenerateCommunityApiToken(communityId, token);
    setOwnedCommunities((prev) => prev.map((c) => (c._id === communityId ? { ...c, apiToken } : c)));
    showFeedback('success', 'API token regenerated');
  }

  async function handleApply() {
    if (!token || !applyTarget) return;
    setApplying(true);
    try {
      const result = await applyToCommunity(applyTarget, token);
      showFeedback(
        'success',
        result.status === 'added' ? "You're now a splasher for that community!" : 'Application submitted — pending staff approval.',
      );
      setApplyTarget('');
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Failed to apply');
    } finally {
      setApplying(false);
    }
  }

  if (!user) return null;

  return (
    <div style={s.container}>
      <h2 style={s.heading}>Account Settings</h2>
      <p style={s.subtext}>Your account details, webhooks, and community access.</p>

      {feedback && <div style={feedback.type === 'error' ? s.errorBox : s.successBox}>{feedback.message}</div>}
      {error && <div style={s.errorBox}>{error}</div>}

      {loading ? (
        <p style={s.emptyMsg}>Loading…</p>
      ) : (
        <>
          <div style={s.card}>
            <div style={s.cardTitle}>Your plugin token</div>
            {pluginToken ? (
              <CopyableField
                label="Sync token"
                value={pluginToken}
                hint="Enter this in the Splash Helper RuneLite plugin to sync your sessions. Also used by the Discord bot's /link command to verify your account."
              />
            ) : (
              <p style={s.emptyMsg}>No plugin token found — sync a session from the plugin first.</p>
            )}
          </div>

          <div style={s.card}>
            <div style={s.cardTitle}>Discord webhooks</div>
            <WebhookFieldsEditor
              activeUrl={webhooks.discordActiveWebhookUrl}
              historyUrl={webhooks.discordHistoryWebhookUrl}
              onSaveActive={saveActiveWebhook}
              onSaveHistory={saveHistoryWebhook}
            />
            <p style={s.fieldHint}>
              Personal webhooks, additive with any community you belong to — your posts go to
              both.
            </p>
          </div>

          {user.communityEligible && (
            <div style={s.card}>
              <div style={s.cardTitle}>Your community API tokens</div>
              {ownedCommunities.length === 0 ? (
                <p style={s.emptyMsg}>You don't own any communities yet.</p>
              ) : (
                ownedCommunities.map((community) => (
                  <div key={community._id} style={s.communityRow}>
                    <span style={s.communityName}>{community.name}</span>
                    <CopyableField
                      label="API token"
                      value={community.apiToken}
                      onRegenerate={() => handleRegenerate(community._id)}
                      hint="Used by the Discord bot's /setup command, and any external access to this community's data."
                    />
                  </div>
                ))
              )}
            </div>
          )}

          <div style={s.card}>
            <div style={s.cardTitle}>Apply to a community</div>
            {allCommunities.length === 0 ? (
              <p style={s.emptyMsg}>No communities available yet.</p>
            ) : (
              <div style={s.applyRow}>
                <select
                  style={s.select}
                  value={applyTarget}
                  onChange={(e) => setApplyTarget(e.target.value)}
                  disabled={applying}
                >
                  <option value="">Select a community…</option>
                  {allCommunities.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                <button style={s.btnPrimary} type="button" onClick={handleApply} disabled={applying || !applyTarget}>
                  {applying ? 'Applying…' : 'Apply'}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
