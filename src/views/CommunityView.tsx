import { useEffect, useState } from 'react';
import {
  getMyCommunities,
  createCommunity,
  setCommunityWebhook,
  setCommunityDiscordInvite,
  getCommunitySplashers,
  setCommunityMemberWebhook,
  getCommunityRanks,
  createCommunityRank,
  updateCommunityRank,
  deleteCommunityRank,
  setCommunityMemberRank,
  getCommunityDiscordConfig,
  setCommunityDiscordConfig,
  getCommunityChatConfig,
  setCommunityChatConfig,
  getAllCommunities,
  applyToCommunity,
  regenerateCommunityApiToken,
} from '../api';
import { useAuth } from '../context/AuthContext';
import WebhookFieldsEditor from '../components/WebhookFieldsEditor';
import CopyableField from '../components/CopyableField';
import Menu from '../components/Menu';
import type { Community, CommunitySplasher, Rank, DiscordServerConfig, CommunitySummary } from '../types';
import type { CommunityChatConfig } from '../types/chatbox';
import { colors, fontSerif } from '../theme';
import { logSystemEvent } from '../utils/systemLog';

const s = {
  container: { maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' },
  heading: { fontFamily: fontSerif, fontSize: '1.6rem', fontWeight: 700, color: colors.text, marginBottom: '0.25rem' },
  subtext: { color: colors.textFaint, fontSize: '0.875rem', marginBottom: '1.5rem' },
  errorBox: { padding: '0.65rem 0.85rem', background: colors.dangerSoft, border: `1px solid ${colors.danger}`, borderRadius: 6, color: colors.dangerText, fontSize: '0.875rem', marginBottom: '1rem' },
  successBox: { padding: '0.65rem 0.85rem', background: colors.successSoft, border: `1px solid ${colors.success}`, borderRadius: 6, color: colors.successText, fontSize: '0.875rem', marginBottom: '1rem' },
  createRow: { display: 'flex', gap: '0.5rem', marginBottom: '1.75rem' },
  input: { padding: '0.5rem 0.7rem', background: colors.inputBg, border: `1px solid ${colors.inputBorder}`, borderRadius: 6, color: colors.text, fontSize: '0.875rem', flex: 1, outline: 'none' },
  btnPrimary: { padding: '0.5rem 1rem', background: colors.accent, border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 700 },
  card: { background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 8, padding: '1.25rem', marginBottom: '1rem' },
  cardTitle: { fontFamily: fontSerif, fontSize: '1.05rem', fontWeight: 700, color: colors.text, marginBottom: '0.15rem' },
  cardMeta: { color: colors.textFaint, fontSize: '0.8rem', marginBottom: '1rem' },
  fieldHint: { color: colors.textFaint, fontSize: '0.78rem', marginTop: '0.75rem' },
  subheading: { fontFamily: fontSerif, fontSize: '0.95rem', fontWeight: 700, color: colors.text, margin: '1.25rem 0 0.75rem' },
  splasherRow: { border: `1px solid ${colors.border}`, borderRadius: 6, marginBottom: '0.5rem' },
  splasherHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.55rem 0.75rem', cursor: 'pointer' },
  splasherName: { fontSize: '0.875rem', fontWeight: 600, color: colors.textMuted },
  toggleHint: { fontSize: '0.78rem', color: colors.link, fontWeight: 600 },
  splasherBody: { padding: '0 0.75rem 0.9rem' },
  emptyMsg: { color: colors.textFaint, textAlign: 'center' as const, padding: '1.5rem' },
  rankRow: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' },
  rankBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.15rem 0.5rem',
    borderRadius: 12,
    fontSize: '0.72rem',
    fontWeight: 600,
    background: colors.accentSoft,
    color: colors.accentText,
  },
  rankNameInput: { padding: '0.4rem 0.6rem', background: colors.inputBg, border: `1px solid ${colors.inputBorder}`, borderRadius: 6, color: colors.text, fontSize: '0.82rem', width: 140 },
  rankRateInput: { padding: '0.4rem 0.6rem', background: colors.inputBg, border: `1px solid ${colors.inputBorder}`, borderRadius: 6, color: colors.text, fontSize: '0.82rem', width: 90 },
  rankSelect: { padding: '0.4rem 0.6rem', background: colors.inputBg, border: `1px solid ${colors.inputBorder}`, borderRadius: 6, color: colors.text, fontSize: '0.82rem' },
  btnSmall: { padding: '0.35rem 0.7rem', background: colors.accentSoft, border: `1px solid ${colors.accent}`, borderRadius: 6, color: colors.accentText, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 },
  btnSmallDanger: { padding: '0.35rem 0.7rem', background: colors.dangerSoft, border: `1px solid ${colors.danger}`, borderRadius: 6, color: colors.dangerText, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 },
  fieldGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' },
  fieldLabel: { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: colors.textMuted, marginBottom: '0.3rem' },
  applyRow: { display: 'flex', gap: '0.5rem' },
  select: { padding: '0.5rem 0.7rem', background: colors.inputBg, border: `1px solid ${colors.inputBorder}`, borderRadius: 6, color: colors.text, fontSize: '0.875rem', flex: 1 },
  checkboxRow: { display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: colors.textMuted, fontWeight: 600, marginBottom: '0.75rem' },
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

function CommunityInviteForm({
  community,
  onSaved,
}: {
  community: Community;
  onSaved: (updated: Community) => void;
}) {
  const { token } = useAuth();
  const [value, setValue] = useState(community.discordInviteUrl ?? '');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  function flash(type: 'error' | 'success', message: string) {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 2500);
  }

  async function handleSave() {
    if (!token) return;
    setSaving(true);
    try {
      const updated = await setCommunityDiscordInvite(community._id, value.trim(), token);
      onSaved(updated);
      flash('success', value.trim() ? 'Saved' : 'Cleared');
    } catch (err) {
      flash('error', err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: colors.textMuted, marginBottom: '0.35rem' }}>
        Discord invite link
      </label>
      <div style={s.rankRow}>
        <input
          style={{ ...s.input, marginBottom: 0 }}
          type="text"
          placeholder="https://discord.gg/..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={saving}
        />
        <button style={s.btnSmall} type="button" onClick={handleSave} disabled={saving}>
          Save
        </button>
      </div>
      {feedback && (
        <p style={{ ...s.fieldHint, color: feedback.type === 'error' ? colors.dangerText : colors.successText, marginTop: '0.3rem' }}>
          {feedback.message}
        </p>
      )}
      <p style={s.fieldHint}>
        Shown alongside your splashers' names on the public active-sessions feed, linking out to
        your server.
      </p>
    </div>
  );
}

type DiscordConfigForm = {
  supportTicketChannelId: string;
  splasherLinkChannelId: string;
  historyChannelId: string;
  activeWorldsChannelId: string;
  bankChannelId: string;
  supportRoleIds: string;
  bankManagerRoleIds: string;
  autoAddSplashers: boolean;
  minPayoutGp: string;
};

function toForm(config: DiscordServerConfig): DiscordConfigForm {
  return {
    supportTicketChannelId: config.supportTicketChannelId ?? '',
    splasherLinkChannelId: config.splasherLinkChannelId ?? '',
    historyChannelId: config.historyChannelId ?? '',
    activeWorldsChannelId: config.activeWorldsChannelId ?? '',
    bankChannelId: config.bankChannelId ?? '',
    supportRoleIds: config.supportRoleIds.join(', '),
    bankManagerRoleIds: config.bankManagerRoleIds.join(', '),
    autoAddSplashers: config.autoAddSplashers,
    minPayoutGp: String(config.minPayoutGp),
  };
}

function parseIdList(value: string): string[] {
  return value.split(',').map((v) => v.trim()).filter(Boolean);
}

function DiscordConfigPanel({ communityId }: { communityId: string }) {
  const { token } = useAuth();
  const [config, setConfig] = useState<DiscordServerConfig | null | undefined>(undefined);
  const [form, setForm] = useState<DiscordConfigForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  function flash(type: 'error' | 'success', message: string) {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  }

  useEffect(() => {
    if (!token) return;
    getCommunityDiscordConfig(communityId, token)
      .then((c) => {
        setConfig(c);
        setForm(c ? toForm(c) : null);
      })
      .catch((err) => flash('error', err instanceof Error ? err.message : 'Failed to load Discord config'));
  }, [communityId, token]);

  function setField<K extends keyof DiscordConfigForm>(key: K, value: DiscordConfigForm[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave() {
    if (!token || !form) return;
    const minPayoutGp = Number(form.minPayoutGp);
    if (!Number.isFinite(minPayoutGp) || minPayoutGp < 0) {
      flash('error', 'Minimum payout must be a non-negative number');
      return;
    }

    setSaving(true);
    try {
      const updated = await setCommunityDiscordConfig(
        communityId,
        {
          supportTicketChannelId: form.supportTicketChannelId.trim(),
          splasherLinkChannelId: form.splasherLinkChannelId.trim(),
          historyChannelId: form.historyChannelId.trim(),
          activeWorldsChannelId: form.activeWorldsChannelId.trim(),
          bankChannelId: form.bankChannelId.trim(),
          supportRoleIds: parseIdList(form.supportRoleIds),
          bankManagerRoleIds: parseIdList(form.bankManagerRoleIds),
          autoAddSplashers: form.autoAddSplashers,
          minPayoutGp,
        },
        token,
      );
      setConfig(updated);
      setForm(toForm(updated));
      flash('success', 'Saved');
    } catch (err) {
      flash('error', err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (config === undefined) return <p style={s.fieldHint}>Loading Discord setup...</p>;
  if (config === null || !form) {
    return (
      <p style={s.fieldHint}>
        This community isn't linked to a Discord server yet — run <code>/setup</code> there first.
      </p>
    );
  }

  return (
    <div>
      {feedback && (
        <div style={feedback.type === 'error' ? s.errorBox : s.successBox}>{feedback.message}</div>
      )}

      <div style={s.fieldGrid}>
        <label>
          <span style={s.fieldLabel}>Support ticket channel ID</span>
          <input
            style={s.input}
            type="text"
            value={form.supportTicketChannelId}
            onChange={(e) => setField('supportTicketChannelId', e.target.value)}
            disabled={saving}
          />
        </label>
        <label>
          <span style={s.fieldLabel}>Splasher-link ticket channel ID</span>
          <input
            style={s.input}
            type="text"
            value={form.splasherLinkChannelId}
            onChange={(e) => setField('splasherLinkChannelId', e.target.value)}
            disabled={saving}
          />
        </label>
        <label>
          <span style={s.fieldLabel}>History channel ID</span>
          <input
            style={s.input}
            type="text"
            value={form.historyChannelId}
            onChange={(e) => setField('historyChannelId', e.target.value)}
            disabled={saving}
          />
        </label>
        <label>
          <span style={s.fieldLabel}>Active worlds channel ID</span>
          <input
            style={s.input}
            type="text"
            value={form.activeWorldsChannelId}
            onChange={(e) => setField('activeWorldsChannelId', e.target.value)}
            disabled={saving}
          />
        </label>
        <label>
          <span style={s.fieldLabel}>Bank channel ID</span>
          <input
            style={s.input}
            type="text"
            value={form.bankChannelId}
            onChange={(e) => setField('bankChannelId', e.target.value)}
            disabled={saving}
          />
        </label>
        <label>
          <span style={s.fieldLabel}>Minimum /income payout (gp)</span>
          <input
            style={s.input}
            type="number"
            min={0}
            value={form.minPayoutGp}
            onChange={(e) => setField('minPayoutGp', e.target.value)}
            disabled={saving}
          />
        </label>
      </div>

      <label style={{ display: 'block', marginBottom: '0.75rem' }}>
        <span style={s.fieldLabel}>Support role IDs (comma-separated)</span>
        <input
          style={s.input}
          type="text"
          value={form.supportRoleIds}
          onChange={(e) => setField('supportRoleIds', e.target.value)}
          disabled={saving}
        />
      </label>
      <label style={{ display: 'block', marginBottom: '0.75rem' }}>
        <span style={s.fieldLabel}>Bank manager role IDs (comma-separated)</span>
        <input
          style={s.input}
          type="text"
          value={form.bankManagerRoleIds}
          onChange={(e) => setField('bankManagerRoleIds', e.target.value)}
          disabled={saving}
        />
      </label>

      <label style={s.checkboxRow}>
        <input
          type="checkbox"
          checked={form.autoAddSplashers}
          onChange={(e) => setField('autoAddSplashers', e.target.checked)}
          disabled={saving}
        />
        Auto-add splashers who link or apply (otherwise staff approval is required)
      </label>

      <button style={s.btnSmall} type="button" onClick={handleSave} disabled={saving}>
        Save
      </button>
      <p style={s.fieldHint}>
        Copy channel and role IDs from Discord with Developer Mode enabled (right-click → Copy ID).
        Leave a field blank to clear it.
      </p>
    </div>
  );
}

const CHAT_RELAY_URLS = ['https://chat.splasher.help', 'https://chat.ardy.host'];

type ChatConfigForm = {
  friendsChatName: string;
  friendsChatDisplayName: string;
  clanChatName: string;
  discordFriendsChatWebhookUrl: string;
  discordClanChatWebhookUrl: string;
};

function toChatConfigForm(config: CommunityChatConfig): ChatConfigForm {
  return {
    friendsChatName: config.friendsChatName ?? '',
    friendsChatDisplayName: config.friendsChatDisplayName ?? '',
    clanChatName: config.clanChatName ?? '',
    discordFriendsChatWebhookUrl: config.discordFriendsChatWebhookUrl ?? '',
    discordClanChatWebhookUrl: config.discordClanChatWebhookUrl ?? '',
  };
}

/**
 * Lets the owner register this community's Friends/Clan Chat names (what the live chatbox on
 * the site matches incoming relay messages against — see splash-helper-backend's
 * services/chatRelay.ts) and, optionally, a Discord webhook to also post that chat to. Below
 * that, the two relay URLs to paste into the RuneLite Discord Chat Logger plugin's webhook
 * fields — the same URL works for both Friends Chat and Clan Chat.
 */
function ChatConfigPanel({ communityId }: { communityId: string }) {
  const { token } = useAuth();
  const [form, setForm] = useState<ChatConfigForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  function flash(type: 'error' | 'success', message: string) {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  }

  useEffect(() => {
    if (!token) return;
    getCommunityChatConfig(communityId, token)
      .then((c) => setForm(toChatConfigForm(c)))
      .catch((err) => flash('error', err instanceof Error ? err.message : 'Failed to load live chat settings'));
  }, [communityId, token]);

  function setField<K extends keyof ChatConfigForm>(key: K, value: ChatConfigForm[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave() {
    if (!token || !form) return;
    setSaving(true);
    try {
      const updated = await setCommunityChatConfig(
        communityId,
        {
          friendsChatName: form.friendsChatName.trim(),
          friendsChatDisplayName: form.friendsChatDisplayName.trim(),
          clanChatName: form.clanChatName.trim(),
          discordFriendsChatWebhookUrl: form.discordFriendsChatWebhookUrl.trim(),
          discordClanChatWebhookUrl: form.discordClanChatWebhookUrl.trim(),
        },
        token,
      );
      setForm(toChatConfigForm(updated));
      flash('success', 'Saved');
      logSystemEvent('Updated live chat settings');
    } catch (err) {
      flash('error', err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (!form) return <p style={s.fieldHint}>Loading live chat settings...</p>;

  return (
    <div>
      {feedback && (
        <div style={feedback.type === 'error' ? s.errorBox : s.successBox}>{feedback.message}</div>
      )}

      <div style={s.fieldGrid}>
        <label>
          <span style={s.fieldLabel}>Friends Chat name</span>
          <input
            style={s.input}
            type="text"
            placeholder="e.g. Ardy Splash"
            value={form.friendsChatName}
            onChange={(e) => setField('friendsChatName', e.target.value)}
            disabled={saving}
          />
        </label>
        <label>
          <span style={s.fieldLabel}>Clan Chat name</span>
          <input
            style={s.input}
            type="text"
            placeholder="e.g. Ardy Splash CC"
            value={form.clanChatName}
            onChange={(e) => setField('clanChatName', e.target.value)}
            disabled={saving}
          />
        </label>
      </div>

      <label style={{ display: 'block', marginBottom: '0.75rem' }}>
        <span style={s.fieldLabel}>Friends Chat display name (optional)</span>
        <input
          style={s.input}
          type="text"
          placeholder={form.friendsChatName || 'Defaults to the Friends Chat name above'}
          value={form.friendsChatDisplayName}
          onChange={(e) => setField('friendsChatDisplayName', e.target.value)}
          disabled={saving}
        />
      </label>
      <p style={s.fieldHint}>
        Your Friends Chat's in-game name is tied to your own RSN — set a display name here to
        show something else (e.g. your community's name) in the chatbox's <code>[...]</code>
        prefix instead.
      </p>

      <div style={s.fieldGrid}>
        <label>
          <span style={s.fieldLabel}>Friends Chat Discord webhook (optional)</span>
          <input
            style={s.input}
            type="text"
            placeholder="https://discord.com/api/webhooks/..."
            value={form.discordFriendsChatWebhookUrl}
            onChange={(e) => setField('discordFriendsChatWebhookUrl', e.target.value)}
            disabled={saving}
          />
        </label>
        <label>
          <span style={s.fieldLabel}>Clan Chat Discord webhook (optional)</span>
          <input
            style={s.input}
            type="text"
            placeholder="https://discord.com/api/webhooks/..."
            value={form.discordClanChatWebhookUrl}
            onChange={(e) => setField('discordClanChatWebhookUrl', e.target.value)}
            disabled={saving}
          />
        </label>
      </div>

      <button style={s.btnSmall} type="button" onClick={handleSave} disabled={saving}>
        Save
      </button>
      <p style={s.fieldHint}>
        These must exactly match your in-game Friends Chat / Clan Chat names, and must be unique
        across every community on Splash Helper — saving fails if another community already
        registered the same name. Leave a Discord webhook blank to only show that chat on the
        website without also posting it to Discord — each one is independent.
      </p>

      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {CHAT_RELAY_URLS.map((url) => (
          <CopyableField key={url} label="Relay URL" value={url} />
        ))}
      </div>
      <p style={s.fieldHint}>
        In RuneLite, install the <strong>Discord Chat Logger</strong> plugin and paste either
        relay URL above into <em>both</em> its "Friends Chat webhook" and "Clan Chat webhook"
        fields — no per-chat-type setup needed, and every member who does this feeds the same
        live chat.
      </p>
    </div>
  );
}

function RanksPanel({ communityId, onRanksChanged }: { communityId: string; onRanksChanged?: () => void }) {
  const { token } = useAuth();
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newRate, setNewRate] = useState('');
  const [error, setError] = useState<string | null>(null);

  function load() {
    if (!token) return;
    getCommunityRanks(communityId, token).then(setRanks).finally(() => setLoading(false));
  }

  useEffect(load, [communityId, token]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !newName.trim()) return;
    const rate = Number(newRate);
    if (!Number.isFinite(rate) || rate < 0) {
      setError('Hourly rate must be a non-negative number');
      return;
    }
    setError(null);
    try {
      const rank = await createCommunityRank(communityId, newName.trim(), rate, token);
      setRanks((prev) => [...prev, rank]);
      setNewName('');
      setNewRate('');
      onRanksChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create rank');
    }
  }

  async function handleRateChange(rank: Rank, rate: number) {
    if (!token || !Number.isFinite(rate) || rate < 0) return;
    const updated = await updateCommunityRank(communityId, rank._id, { hourlyRate: rate }, token);
    setRanks((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
    onRanksChanged?.();
  }

  async function handleDelete(rank: Rank) {
    if (!token) return;
    setError(null);
    try {
      await deleteCommunityRank(communityId, rank._id, token);
      setRanks((prev) => prev.filter((r) => r._id !== rank._id));
      onRanksChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete rank');
    }
  }

  if (loading) return <p style={s.fieldHint}>Loading ranks...</p>;

  return (
    <div>
      {error && <div style={s.errorBox}>{error}</div>}
      {ranks.map((rank) => (
        <div key={rank._id} style={s.rankRow}>
          <input
            style={s.rankNameInput}
            type="text"
            defaultValue={rank.name}
            onBlur={(e) => {
              if (!token || !e.target.value.trim() || e.target.value.trim() === rank.name) return;
              updateCommunityRank(communityId, rank._id, { name: e.target.value.trim() }, token).then((updated) =>
                setRanks((prev) => prev.map((r) => (r._id === updated._id ? updated : r))),
              );
            }}
          />
          <input
            style={s.rankRateInput}
            type="number"
            min={0}
            step="0.01"
            defaultValue={rank.hourlyRate}
            onBlur={(e) => handleRateChange(rank, Number(e.target.value))}
          />
          <span style={s.fieldHint}>gp/hr</span>
          <Menu
            items={[
              // Hidden for the already-default rank (nothing to promote it to); disabled
              // for every other rank until the backend gains a way to change the default —
              // see Notes/Splash Helper/Backend/Features/Rank set-default endpoint.md.
              ...(!rank.isDefault
                ? [{
                  label: 'Set as default',
                  disabled: true,
                  title: 'Coming soon — the backend needs a new endpoint to change the default rank.',
                    onClick: () => {},
                  }]
                : []),
              {
                label: 'Delete',
                danger: true,
                disabled: rank.isDefault,
                title: rank.isDefault ? "Can't delete the default rank" : undefined,
                onClick: () => handleDelete(rank),
              },
            ]}
          />
          {rank.isDefault && <span style={s.rankBadge}>Default</span>}
        </div>
      ))}

      <form style={{ ...s.rankRow, marginTop: '0.75rem' }} onSubmit={handleCreate}>
        <input
          style={s.rankNameInput}
          type="text"
          placeholder="New rank name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <input
          style={s.rankRateInput}
          type="number"
          min={0}
          step="0.01"
          placeholder="Rate"
          value={newRate}
          onChange={(e) => setNewRate(e.target.value)}
        />
        <button style={s.btnSmall} type="submit" disabled={!newName.trim()}>
          Add rank
        </button>
      </form>
    </div>
  );
}

function MemberWebhookRow({ communityId, splasher, ranks, onSaved }: {
  communityId: string;
  splasher: CommunitySplasher;
  ranks: Rank[];
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

  async function handleRankChange(rankId: string) {
    if (!token || !rankId) return;
    const result = await setCommunityMemberRank(communityId, splasher.username, rankId, token);
    onSaved({ ...splasher, rank: { ...result.rank } });
  }

  const hasOverride = !!(splasher.discordActiveWebhookUrl || splasher.discordHistoryWebhookUrl);

  return (
    <div style={s.splasherRow}>
      <div style={s.splasherHeader} onClick={() => setExpanded((v) => !v)}>
        <span style={s.splasherName}>
          {splasher.username}
          {splasher.rank && <span style={{ ...s.rankBadge, marginLeft: '0.5rem' }}>{splasher.rank.name}</span>}
          {hasOverride && <span style={{ color: colors.successText, fontWeight: 600 }}> · personal webhook set</span>}
        </span>
        <span style={s.toggleHint}>{expanded ? 'Hide' : 'Edit'}</span>
      </div>
      {expanded && (
        <div style={s.splasherBody}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: colors.textMuted, marginBottom: '0.35rem' }}>
              Rank
            </label>
            <select
              style={s.rankSelect}
              value={splasher.rank?.id ?? ''}
              onChange={(e) => handleRankChange(e.target.value)}
            >
              {!splasher.rank && <option value="">No rank assigned</option>}
              {ranks.map((rank) => (
                <option key={rank._id} value={rank._id}>{rank.name} ({rank.hourlyRate} gp/hr)</option>
              ))}
            </select>
          </div>
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
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [loading, setLoading] = useState(true);

  function loadRanks() {
    if (!token) return;
    getCommunityRanks(communityId, token).then(setRanks).catch(() => {});
  }

  useEffect(() => {
    if (!token) return;
    getCommunitySplashers(communityId, token)
      .then(setSplashers)
      .finally(() => setLoading(false));
    loadRanks();
  }, [communityId, token]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSaved(updated: CommunitySplasher) {
    setSplashers((prev) => prev.map((s2) => (s2._id === updated._id ? updated : s2)));
  }

  if (loading) return <p style={s.fieldHint}>Loading splashers...</p>;
  if (splashers.length === 0) return <p style={s.fieldHint}>No splashers assigned yet.</p>;

  return (
    <div>
      {splashers.map((splasher) => (
        <MemberWebhookRow
          key={splasher._id}
          communityId={communityId}
          splasher={splasher}
          ranks={ranks}
          onSaved={handleSaved}
        />
      ))}
    </div>
  );
}

/** Shown to users without community-owner rights: joins them as a splasher for an
 *  existing community. Moved here from Account Settings so it lives alongside everything
 *  else community-related. */
function ApplyToCommunityCard() {
  const { token } = useAuth();
  const [allCommunities, setAllCommunities] = useState<CommunitySummary[]>([]);
  const [applyTarget, setApplyTarget] = useState('');
  const [applying, setApplying] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  function showFeedback(type: 'error' | 'success', message: string) {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  }

  useEffect(() => {
    if (!token) return;
    getAllCommunities(token).then(setAllCommunities).catch(() => {});
  }, [token]);

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

  return (
    <div style={s.card}>
      <div style={s.cardTitle}>Apply to a community</div>
      {feedback && (
        <div style={feedback.type === 'error' ? s.errorBox : s.successBox}>{feedback.message}</div>
      )}
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
  );
}

function CommunityTokenField({ community, onRegenerated }: { community: Community; onRegenerated: (apiToken: string) => void }) {
  const { token } = useAuth();

  async function handleRegenerate() {
    if (!token) return;
    onRegenerated(await regenerateCommunityApiToken(community._id, token));
  }

  return (
    <CopyableField
      label="API token"
      value={community.apiToken}
      onRegenerate={handleRegenerate}
      hint="Used by the Discord bot's /setup command, and any external access to this community's data."
    />
  );
}

export default function CommunityView() {
  const { user, token } = useAuth();
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
      logSystemEvent(`Created community "${community.name}"`);
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Failed to create community');
    } finally {
      setCreating(false);
    }
  }

  function handleWebhookSaved(updated: Community) {
    setCommunities((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
  }

  if (!user) return null;

  if (!user.communityEligible) {
    return (
      <div style={s.container}>
        <h2 style={s.heading}>Communities</h2>
        <p style={s.subtext}>You're not a community owner — apply below to splash for one instead.</p>
        <ApplyToCommunityCard />
      </div>
    );
  }

  return (
    <div style={s.container}>
      <h2 style={s.heading}>Communities</h2>
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

            <CommunityTokenField
              community={community}
              onRegenerated={(apiToken) => setCommunities((prev) => prev.map((c) => (c._id === community._id ? { ...c, apiToken } : c)))}
            />

            <h4 style={s.subheading}>Discord invite</h4>
            <CommunityInviteForm community={community} onSaved={handleWebhookSaved} />

            <h4 style={s.subheading}>Ranks</h4>
            <RanksPanel communityId={community._id} />

            <h4 style={s.subheading}>Discord setup</h4>
            <DiscordConfigPanel communityId={community._id} />

            <h4 style={s.subheading}>Live chat</h4>
            <ChatConfigPanel communityId={community._id} />

            <h4 style={s.subheading}>Webhooks</h4>
            <CommunityWebhookForm community={community} onSaved={handleWebhookSaved} />
            <p style={{ ...s.fieldLabel, marginTop: '1rem' }}>Per-splasher overrides</p>
            <CommunitySplashersPanel communityId={community._id} />
          </div>
        ))
      )}
    </div>
  );
}
