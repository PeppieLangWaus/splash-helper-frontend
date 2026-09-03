import { colors, fontSerif } from '../theme';
import type { TotalBonuses } from '../utils/gearBonuses';

const s = {
  wrap: { display: 'flex', flexDirection: 'column' as const, gap: '0.6rem' },
  heading: { fontFamily: fontSerif, fontWeight: 700, fontSize: '0.85rem', color: colors.textFaint, textTransform: 'uppercase' as const, letterSpacing: '0.03em' },
  table: { display: 'grid', gridTemplateColumns: '1fr auto', rowGap: '0.15rem', columnGap: '0.75rem', fontSize: '0.82rem' },
  label: { color: colors.textMuted },
  value: (n: number) => ({ color: n > 0 ? colors.successText : n < 0 ? colors.dangerText : colors.text, fontWeight: 600, textAlign: 'right' as const }),
} as const;

const ROWS: Array<[keyof TotalBonuses, string]> = [
  ['stabAttack', 'Stab Attack'],
  ['slashAttack', 'Slash Attack'],
  ['crushAttack', 'Crush Attack'],
  ['rangeAttack', 'Range Attack'],
  ['magicAttack', 'Magic Attack'],
  ['stabDefence', 'Stab Defence'],
  ['slashDefence', 'Slash Defence'],
  ['crushDefence', 'Crush Defence'],
  ['rangeDefence', 'Range Defence'],
  ['magicDefence', 'Magic Defence'],
  ['strength', 'Strength'],
  ['rangedStrength', 'Ranged Strength'],
  ['prayer', 'Prayer'],
  ['magicDamage', 'Magic Damage %'],
];

interface Props {
  totals: TotalBonuses;
}

export default function BonusSummaryPanel({ totals }: Props) {
  return (
    <div style={s.wrap}>
      <span style={s.heading}>Combat bonuses</span>
      <div style={s.table}>
        {ROWS.map(([key, label]) => {
          const value = totals[key];
          return (
            <div key={key} style={{ display: 'contents' }}>
              <div style={s.label}>{label}</div>
              <div style={s.value(value)}>
                {value > 0 ? '+' : ''}
                {value}
                {key === 'magicDamage' ? '%' : ''}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
