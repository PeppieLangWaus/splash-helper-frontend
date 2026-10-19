import type { TotalBonuses } from './gearBonuses';

function fmt(n: number, suffix = ''): string {
  return `${n > 0 ? '+' : ''}${n}${suffix}`;
}

function Stat({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <span>
      <span className="bonus-summary__stat-name">{label}:</span>{' '}
      <span className={`bonus-summary__stat-value${value === 0 ? ' bonus-summary__stat-value--zero' : ''}`}>
        {fmt(value, suffix)}
      </span>
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
        <div className="bonus-summary__heading">Attack bonus</div>
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
        <div className="bonus-summary__heading">Defence bonus</div>
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
        <div className="bonus-summary__heading">Other bonuses</div>
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
