import { useState } from 'react';
import Modal from '../Modal';
import reportReasons, { type ReportSeverity } from '../../data/reportReasons';
import { colors, fontSerif } from '../../theme';

const SEVERITY_COLOR: Record<ReportSeverity, { bg: string; text: string }> = {
  low: { bg: colors.warningSoft, text: colors.warningText },
  medium: { bg: colors.accentSoft, text: colors.accentText },
  high: { bg: colors.dangerSoft, text: colors.dangerText },
};

const s = {
  field: { marginBottom: '1rem' },
  label: { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: colors.textMuted, marginBottom: '0.35rem' },
  input: {
    width: '100%',
    padding: '0.5rem 0.7rem',
    background: colors.inputBg,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: 6,
    color: colors.text,
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  reasonList: {
    maxHeight: 220,
    overflowY: 'auto' as const,
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    padding: '0.35rem',
  },
  reasonRow: (active: boolean) => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    padding: '0.5rem 0.6rem',
    borderRadius: 6,
    cursor: 'pointer',
    background: active ? colors.panelHover : 'transparent',
    marginBottom: '0.2rem',
  }),
  reasonName: { fontSize: '0.85rem', fontWeight: 600, color: colors.text },
  reasonDescription: { fontSize: '0.76rem', color: colors.textFaint, marginTop: '0.1rem' },
  severityBadge: (severity: ReportSeverity) => ({
    flexShrink: 0,
    fontSize: '0.68rem',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.03em',
    padding: '0.1rem 0.45rem',
    borderRadius: 10,
    background: SEVERITY_COLOR[severity].bg,
    color: SEVERITY_COLOR[severity].text,
  }),
  errorBox: {
    padding: '0.5rem 0.7rem',
    background: colors.dangerSoft,
    border: `1px solid ${colors.danger}`,
    borderRadius: 6,
    color: colors.dangerText,
    fontSize: '0.8rem',
    marginBottom: '1rem',
  },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' },
  btnCancel: {
    padding: '0.5rem 1rem',
    background: 'transparent',
    border: `1px solid ${colors.borderStrong}`,
    borderRadius: 6,
    color: colors.textMuted,
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  btnSubmit: {
    padding: '0.5rem 1rem',
    background: colors.danger,
    border: 'none',
    borderRadius: 6,
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 700,
  },
} as const;

interface Props {
  /** Pre-fills the username field, e.g. when opened from a specific chat line. */
  defaultUsername?: string;
  onClose: () => void;
  onSubmit?: (report: { username: string; reason: string }) => void;
}

/** Opened by the chatbox's report button: asks for a username and a reason picked from
 *  `reportReasons`. */
export default function ReportModal({ defaultUsername = '', onClose, onSubmit }: Props) {
  const [username, setUsername] = useState(defaultUsername);
  const [reasonName, setReasonName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    if (!username.trim()) {
      setError('Enter the username you want to report.');
      return;
    }
    if (!reasonName) {
      setError('Pick a reason for the report.');
      return;
    }
    onSubmit?.({ username: username.trim(), reason: reasonName });
    onClose();
  }

  return (
    <Modal title="Report player" onClose={onClose}>
      <div style={{ width: 380, maxWidth: '100%' }}>
        {error && <div style={s.errorBox}>{error}</div>}

        <div style={s.field}>
          <label style={s.label} htmlFor="report-username">Username</label>
          <input
            id="report-username"
            style={s.input}
            type="text"
            placeholder="Player to report"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
          />
        </div>

        <div style={s.field}>
          <span style={s.label}>Reason</span>
          <div style={s.reasonList}>
            {reportReasons.map((reason) => (
              <div
                key={reason.name}
                style={s.reasonRow(reasonName === reason.name)}
                onClick={() => setReasonName(reason.name)}
                role="radio"
                aria-checked={reasonName === reason.name}
                tabIndex={0}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ ...s.reasonName, fontFamily: fontSerif }}>{reason.name}</div>
                  <div style={s.reasonDescription}>{reason.description}</div>
                </div>
                <span style={s.severityBadge(reason.severity)}>{reason.severity}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={s.actions}>
          <button type="button" style={s.btnCancel} onClick={onClose}>Cancel</button>
          <button type="button" style={s.btnSubmit} onClick={handleSubmit}>Submit report</button>
        </div>
      </div>
    </Modal>
  );
}
