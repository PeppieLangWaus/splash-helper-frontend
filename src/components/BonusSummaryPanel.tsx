import { colors, fontSerif } from '../theme';
import type { TotalBonuses } from '../utils/gearBonuses';

const s = {
  wrap: { display: 'flex', flexDirection: 'column' as const, gap: '0.6rem' },
  heading: { fontFamily: fontSerif, fontWeight: 700, fontSize: '0.85rem', color: colors.accentText },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '0.75rem', fontSize: '0.8rem' },
  stat: (n: number) => ({ color: n === 0 ? colors.textMuted : colors.text, whiteSpace: 'nowrap' as const }),
  statName: { color: colors.textFaint },
} as const;

function fmt(n: number, suffix = ''): string {
  return `${n > 0 ? '+' : ''}${n}${suffix}`;
}

interface Props {
  totals: TotalBonuses;
}

/**
 * Mirrors the real OSRS equipment-stats panel's own layout and grouping (Attack bonus / Defence
 * bonus, each as Stab alone then Slash+Magic / Crush+Range paired; Other bonuses below) rather
 * than an arbitrary list — this is the exact pairing the game itself uses. "Target-specific"
 * and "Weapon speed" sections from the reference screenshot are omitted: the synced dataset
 * (scripts/sync-equipment-data.ts) doesn't carry that data.
 */
export default function BonusSummaryPanel({ totals }: Props) {
  return (
    <div style={s.wrap}>
      <div>
        <div style={s.heading}>Attack bonus</div>
        <div style={s.row}>
          <span style={s.statName}>Stab:</span> <span style={s.stat(totals.stabAttack)}>{fmt(totals.stabAttack)}</span>
        </div>
        <div style={s.row}>
          <span>
            <span style={s.statName}>Slash:</span> <span style={s.stat(totals.slashAttack)}>{fmt(totals.slashAttack)}</span>
          </span>
          <span>
            <span style={s.statName}>Magic:</span> <span style={s.stat(totals.magicAttack)}>{fmt(totals.magicAttack)}</span>
          </span>
        </div>
        <div style={s.row}>
          <span>
            <span style={s.statName}>Crush:</span> <span style={s.stat(totals.crushAttack)}>{fmt(totals.crushAttack)}</span>
          </span>
          <span>
            <span style={s.statName}>Range:</span> <span style={s.stat(totals.rangeAttack)}>{fmt(totals.rangeAttack)}</span>
          </span>
        </div>
      </div>

      <div>
        <div style={s.heading}>Defence bonus</div>
        <div style={s.row}>
          <span style={s.statName}>Stab:</span> <span style={s.stat(totals.stabDefence)}>{fmt(totals.stabDefence)}</span>
        </div>
        <div style={s.row}>
          <span>
            <span style={s.statName}>Slash:</span> <span style={s.stat(totals.slashDefence)}>{fmt(totals.slashDefence)}</span>
          </span>
          <span>
            <span style={s.statName}>Magic:</span> <span style={s.stat(totals.magicDefence)}>{fmt(totals.magicDefence)}</span>
          </span>
        </div>
        <div style={s.row}>
          <span>
            <span style={s.statName}>Crush:</span> <span style={s.stat(totals.crushDefence)}>{fmt(totals.crushDefence)}</span>
          </span>
          <span>
            <span style={s.statName}>Range:</span> <span style={s.stat(totals.rangeDefence)}>{fmt(totals.rangeDefence)}</span>
          </span>
        </div>
      </div>

      <div>
        <div style={s.heading}>Other bonuses</div>
        <div style={s.row}>
          <span style={s.statName}>Melee STR:</span> <span style={s.stat(totals.strength)}>{fmt(totals.strength)}</span>
        </div>
        <div style={s.row}>
          <span style={s.statName}>Ranged STR:</span> <span style={s.stat(totals.rangedStrength)}>{fmt(totals.rangedStrength)}</span>
        </div>
        <div style={s.row}>
          <span style={s.statName}>Magic DMG:</span> <span style={s.stat(totals.magicDamage)}>{fmt(totals.magicDamage, '%')}</span>
        </div>
        <div style={s.row}>
          <span style={s.statName}>Prayer:</span> <span style={s.stat(totals.prayer)}>{fmt(totals.prayer)}</span>
        </div>
      </div>
    </div>
  );
}
