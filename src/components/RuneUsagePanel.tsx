import Icon from './Icon';
import { colors } from '../theme';
import type { RuneUsageMap } from '../types';

const s = {
  wrap: { display: 'flex', flexDirection: 'column' as const, gap: '0.3rem' },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.3rem 0.5rem',
    background: colors.panelAlt,
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
  },
  name: { flex: 1, fontSize: '0.82rem', color: colors.textMuted, textTransform: 'capitalize' as const },
  count: { fontSize: '0.82rem', fontWeight: 700, color: colors.accentText },
  empty: { fontSize: '0.8rem', color: colors.textFaint, fontStyle: 'italic' as const },
} as const;

function runeLabel(id: string) {
  return id.replace(/[_-]/g, ' ');
}

/** Icon+count grid of rune usage for a session, sorted by count descending. Icon lookups
 *  use `runes.<id>` — these aren't in the icon registry yet (real icon files are coming
 *  later), so `Icon` silently renders nothing for them in the meantime; the name/count
 *  text still carries the information. */
export default function RuneUsagePanel({ runeUsageMap }: { runeUsageMap: RuneUsageMap }) {
  const entries = Object.entries(runeUsageMap).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    return <p style={s.empty}>No runes recorded.</p>;
  }

  return (
    <div style={s.wrap}>
      {entries.map(([id, count]) => (
        <div key={id} style={s.row}>
          <Icon name={`runes.${id.toLowerCase()}`} size="1.1rem" alt="" />
          <span style={s.name}>{runeLabel(id)}</span>
          <span style={s.count}>{count.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}
