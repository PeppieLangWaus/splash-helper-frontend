import PixelText from '../PixelText';
import { colors } from '../../theme';
import type { TotalBonuses } from './gearBonuses';

function Stat({ label, value }: { label: string; value: number; suffix?: string }) {
  return (
    <span className="bonus-summary__stat">
      <PixelText text={`${label}:`} fontSize={16} color={colors.accentText} fixedBaseline />
      <PixelText text={`+${value}`} fontSize={16} color={colors.accentText} fixedBaseline />
    </span>
  );
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
    <div className="bonus-summary">
      <div>
        <div className="bonus-summary__heading"><PixelText text="Attack bonus" fontSize={20} color={colors.accentText} bold /></div>
        <div className="bonus-summary__row">
          <Stat label="Stab" value={totals.stabAttack} />
          <Stat label="Magic" value={totals.magicAttack} />
        </div>
        <div className="bonus-summary__row">
          <Stat label="Slash" value={totals.slashAttack} />
          <Stat label="Range" value={totals.rangeAttack} />
        </div>
        <div className="bonus-summary__row">
          <Stat label="Crush" value={totals.crushAttack} />
        </div>
      </div>

      <div>
        <div className="bonus-summary__heading"><PixelText text="Defence bonus" fontSize={20} color={colors.accentText} bold /></div>
        <div className="bonus-summary__row">
          <Stat label="Stab" value={totals.stabDefence} />
          <Stat label="Magic" value={totals.magicDefence} />
        </div>
        <div className="bonus-summary__row">
          <Stat label="Slash" value={totals.slashDefence} />
          <Stat label="Range" value={totals.rangeDefence} />
        </div>
        <div className="bonus-summary__row">
          <Stat label="Crush" value={totals.crushDefence} />
        </div>
      </div>

      <div>
        <div className="bonus-summary__heading"><PixelText text="Other bonuses" fontSize={20} color={colors.accentText} bold /></div>
        <div className="bonus-summary__row">
          <Stat label="Melee STR" value={totals.strength} />
        </div>
        <div className="bonus-summary__row">
          <Stat label="Ranged STR" value={totals.rangedStrength} />
        </div>
        <div className="bonus-summary__row">
          <Stat label="Magic DMG" value={totals.magicDamage} suffix="%" />
        </div>
        <div className="bonus-summary__row">
          <Stat label="Prayer" value={totals.prayer} />
        </div>
      </div>
    </div>
  );
}
