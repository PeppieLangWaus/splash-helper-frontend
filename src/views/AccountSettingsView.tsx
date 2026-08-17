import { useEffect, useRef, useState } from 'react';
import { getArchivedSessions, setSplasherWebhook, uploadJson, updateAccountEmail, resendVerificationEmail } from '../api';
import { useAuth } from '../context/AuthContext';
import WebhookFieldsEditor from '../components/WebhookFieldsEditor';
import CopyableField from '../components/CopyableField';
import EmailField from '../components/EmailField';
import type { SplasherWebhooks, SplashEntry } from '../types';
import { colors, fontSerif } from '../theme';
import { applyMessageLimitToAllStores, getMessageLimit } from '../utils/chatStorage';
import { logSystemEvent } from '../utils/systemLog';

const MIN_CHAT_LOG_SIZE = 10;
const MAX_CHAT_LOG_SIZE = 500;

const s = {
  container: { maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' },
  heading: { fontFamily: fontSerif, fontSize: '1.6rem', fontWeight: 700, color: colors.text, marginBottom: '0.25rem' },
  subtext: { color: colors.textFaint, fontSize: '0.875rem', marginBottom: '1.5rem' },
  card: { background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 8, padding: '1.25rem', marginBottom: '1rem' },
  cardTitle: { fontFamily: fontSerif, fontSize: '1.05rem', fontWeight: 700, color: colors.text, marginBottom: '0.9rem' },
  fieldHint: { color: colors.textFaint, fontSize: '0.78rem', marginTop: '0.75rem' },
  errorBox: { padding: '0.65rem 0.85rem', background: colors.dangerSoft, border: `1px solid ${colors.danger}`, borderRadius: 6, color: colors.dangerText, fontSize: '0.875rem', marginBottom: '1rem' },
  successBox: { padding: '0.65rem 0.85rem', background: colors.successSoft, border: `1px solid ${colors.success}`, borderRadius: 6, color: colors.successText, fontSize: '0.875rem', marginBottom: '1rem' },
  emptyMsg: { color: colors.textFaint, fontSize: '0.85rem' },
  btnRow: { display: 'flex', gap: '0.6rem', flexWrap: 'wrap' as const },
  btnSecondary: {
    padding: '0.5rem 1rem',
    background: '#3e2816',
    border: `1px solid ${colors.borderStrong}`,
    borderRadius: 6,
    color: colors.textMuted,
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 600,
  },
  btnSecondaryDisabled: { cursor: 'not-allowed', opacity: 0.6 },
} as const;

export default function AccountSettingsView() {
  const { token, user } = useAuth();
  const [pluginToken, setPluginToken] = useState<string | null>(null);
  const [webhooks, setWebhooks] = useState<SplasherWebhooks>({});
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [emailVerifiedAt, setEmailVerifiedAt] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [chatLogSize, setChatLogSize] = useState(() => String(getMessageLimit()));
  const [savingChatLogSize, setSavingChatLogSize] = useState(false);

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
        setEmail(data.email);
        setEmailVerifiedAt(data.emailVerifiedAt);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load account data.'))
      .finally(() => setLoading(false));
  }, [token, user]);

  async function saveActiveWebhook(value: string) {
    if (!token || !user) return;
    setWebhooks(await setSplasherWebhook(user.username, { activeWebhookUrl: value }, token));
    logSystemEvent('Updated active-sessions webhook');
  }

  async function saveHistoryWebhook(value: string) {
    if (!token || !user) return;
    setWebhooks(await setSplasherWebhook(user.username, { historyWebhookUrl: value }, token));
    logSystemEvent('Updated session-history webhook');
  }

  async function handleSaveEmail(newEmail: string, currentPassword: string) {
    if (!token) return;
    const result = await updateAccountEmail(newEmail, currentPassword, token);
    setEmail(result.email);
    setEmailVerifiedAt(result.emailVerifiedAt ?? undefined);
    logSystemEvent('Updated account email');
  }

  async function handleResendVerification() {
    if (!token) return;
    await resendVerificationEmail(token);
  }

  async function handleExport() {
    if (!token || !user) return;
    setExporting(true);
    try {
      const data = await getArchivedSessions(user.username, token);
      const blob = new Blob([JSON.stringify(data.sessions, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `splash-sessions-${user.username}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showFeedback('success', `Exported ${data.sessions.length} session${data.sessions.length === 1 ? '' : 's'}`);
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  }

  async function handleImportFile(file: File) {
    setImporting(true);
    try {
      const text = await file.text();
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        showFeedback('error', 'Invalid JSON — could not parse the selected file.');
        return;
      }
      if (!Array.isArray(parsed)) {
        showFeedback('error', 'JSON must be an array of session entries.');
        return;
      }
      const result = await uploadJson(parsed as SplashEntry[]);
      showFeedback('success', result.message);
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Import failed.');
    } finally {
      setImporting(false);
    }
  }

  function handleSaveChatLogSize() {
    const parsed = Number(chatLogSize);
    if (!Number.isFinite(parsed) || parsed < MIN_CHAT_LOG_SIZE || parsed > MAX_CHAT_LOG_SIZE) {
      showFeedback('error', `Chat log size must be between ${MIN_CHAT_LOG_SIZE} and ${MAX_CHAT_LOG_SIZE}.`);
      return;
    }
    setSavingChatLogSize(true);
    try {
      applyMessageLimitToAllStores(Math.floor(parsed));
      setChatLogSize(String(Math.floor(parsed)));
      showFeedback('success', 'Saved');
      logSystemEvent(`Changed chat log size to ${Math.floor(parsed)} messages`);
    } finally {
      setSavingChatLogSize(false);
    }
  }

  if (!user) return null;

  return (
    <div style={s.container}>
      <h2 style={s.heading}>Account</h2>
      <p style={s.subtext}>Your account details and webhooks.</p>

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
            <div style={s.cardTitle}>Account recovery</div>
            <EmailField
              email={email}
              emailVerifiedAt={emailVerifiedAt}
              onSave={handleSaveEmail}
              onResendVerification={handleResendVerification}
            />
            <p style={s.fieldHint}>
              Used to reset your password if you're ever locked out. Requires your current
              password to add or change.
            </p>
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

          <div style={s.card}>
            <div style={s.cardTitle}>Chat log size</div>
            <div style={s.btnRow}>
              <input
                type="number"
                min={MIN_CHAT_LOG_SIZE}
                max={MAX_CHAT_LOG_SIZE}
                value={chatLogSize}
                onChange={(e) => setChatLogSize(e.target.value)}
                disabled={savingChatLogSize}
                style={{
                  width: 100,
                  padding: '0.5rem 0.7rem',
                  background: colors.inputBg,
                  border: `1px solid ${colors.inputBorder}`,
                  borderRadius: 6,
                  color: colors.text,
                  fontSize: '0.875rem',
                }}
              />
              <button
                style={{ ...s.btnSecondary, ...(savingChatLogSize ? s.btnSecondaryDisabled : {}) }}
                type="button"
                onClick={handleSaveChatLogSize}
                disabled={savingChatLogSize}
              >
                Save
              </button>
            </div>
            <p style={s.fieldHint}>
              How many messages the chatbox keeps per feed (Game, Public, Private, Trade, and
              each Friends/Clan Chat you watch) — stored on this device only, never sent to our
              servers. Default is 100 for everyone, including when logged out.
            </p>
          </div>

          <div style={s.card}>
            <div style={s.cardTitle}>Session data</div>
            <div style={s.btnRow}>
              <button
                style={{ ...s.btnSecondary, ...(exporting ? s.btnSecondaryDisabled : {}) }}
                type="button"
                onClick={handleExport}
                disabled={exporting}
              >
                {exporting ? 'Exporting…' : 'Export sessions'}
              </button>
              <button
                style={{ ...s.btnSecondary, ...(importing ? s.btnSecondaryDisabled : {}) }}
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
              >
                {importing ? 'Importing…' : 'Import sessions'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (file) void handleImportFile(file);
                }}
              />
            </div>
            <p style={s.fieldHint}>
              Export downloads all of your archived sessions as a JSON file. Import uploads a
              previously-exported (or plugin-generated) JSON file of session entries — duplicates
              are skipped automatically.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
