import PixelText from '../PixelText';
import { colors } from '../../theme';
import type { TotalBonuses } from './gearBonuses';

function formatSigned(value: number): string {
  return value < 0 ? `${value}` : `+${value}`;
}

function changeColor(change: number): string {
  if (change > 0) return colors.successText;
  if (change < 0) return colors.dangerText;
  return colors.accentText;
}

interface StatProps {
  label: string;
  value: number;
  change?: number;
}

function Stat({ label, value, change }: StatProps) {
  return (
    <span className="bonus-summary__stat">
      <PixelText text={`${label}:`} fontSize={16} color={colors.accentText} fixedBaseline />
      <PixelText text={formatSigned(value)} fontSize={16} color={colors.accentText} fixedBaseline />
      {change !== undefined && (
        <PixelText text={`(${formatSigned(change)})`} fontSize={16} color={changeColor(change)} fixedBaseline />
      )}
    </span>
  );
}

interface Props {
  totals: TotalBonuses;
  /** Totals as they would be if the hovered item were equipped; each stat then shows its change
   *  from `totals` in parentheses. */
  previewTotals?: TotalBonuses | null;
}

/**
 * Mirrors the real OSRS equipment-stats panel's own layout and grouping (Attack bonus / Defence
 * bonus, each as Stab alone then Slash+Magic / Crush+Range paired; Other bonuses below) rather
 * than an arbitrary list — this is the exact pairing the game itself uses. "Target-specific"
 * and "Weapon speed" sections from the reference screenshot are omitted: the synced dataset
 * (scripts/sync-equipment-data.ts) doesn't carry that data.
 */
export default function BonusSummaryPanel({ totals, previewTotals }: Props) {
  const statProps = (label: string, key: keyof TotalBonuses): StatProps => ({
    label,
    value: totals[key],
    change: previewTotals ? previewTotals[key] - totals[key] : undefined,
  });

  return (
    <div className="bonus-summary">
      <div>
        <div className="bonus-summary__heading"><PixelText text="Attack bonus" fontSize={20} color={colors.accentText} bold /></div>
        <div className="bonus-summary__row">
          <Stat {...statProps('Stab', 'stabAttack')} />
          <Stat {...statProps('Magic', 'magicAttack')} />
        </div>
        <div className="bonus-summary__row">
          <Stat {...statProps('Slash', 'slashAttack')} />
          <Stat {...statProps('Range', 'rangeAttack')} />
        </div>
        <div className="bonus-summary__row">
          <Stat {...statProps('Crush', 'crushAttack')} />
        </div>
      </div>

      <div>
        <div className="bonus-summary__heading"><PixelText text="Defence bonus" fontSize={20} color={colors.accentText} bold /></div>
        <div className="bonus-summary__row">
          <Stat {...statProps('Stab', 'stabDefence')} />
          <Stat {...statProps('Magic', 'magicDefence')} />
        </div>
        <div className="bonus-summary__row">
          <Stat {...statProps('Slash', 'slashDefence')} />
          <Stat {...statProps('Range', 'rangeDefence')} />
        </div>
        <div className="bonus-summary__row">
          <Stat {...statProps('Crush', 'crushDefence')} />
        </div>
      </div>

      <div>
        <div className="bonus-summary__heading"><PixelText text="Other bonuses" fontSize={20} color={colors.accentText} bold /></div>
        <div className="bonus-summary__row">
          <Stat {...statProps('Melee STR', 'strength')} />
        </div>
        <div className="bonus-summary__row">
          <Stat {...statProps('Ranged STR', 'rangedStrength')} />
        </div>
        <div className="bonus-summary__row">
          <Stat {...statProps('Magic DMG', 'magicDamage')} />
        </div>
        <div className="bonus-summary__row">
          <Stat {...statProps('Prayer', 'prayer')} />
        </div>
      </div>
    </div>
  );
}
