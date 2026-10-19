import { useGearLoadoutPrice } from './useGearLoadoutPrice';
import type { GearLoadoutSlots } from '../../types/gear';
import { colors } from '../../theme';

interface Props {
  slots: GearLoadoutSlots;
  /** Extra class(es) appended alongside the base gear-picker-ge-cost one — e.g. a modifier for
   *  placement under the Bonuses panel's header title (see GearPickerView.tsx). */
  className?: string;
}

/**
 * The combined GE cost of a loadout's currently-equipped items: "Total cost: 1,234,567 gp" once
 * every equipped item's price is in, "Pricing…" while any are still loading, a trailing "+" if
 * any equipped item has no GE price (untradeable, or no recent trade data), and "Total cost: 0 gp"
 * when nothing is equipped. Fetches lazily via useGearLoadoutPrice — only equipped items are ever
 * priced.
 */
export default function GearLoadoutCost({ slots, className }: Props) {
  const price = useGearLoadoutPrice(slots);
  const equipped = Object.values(slots).some((id) => id !== undefined);

  const classes = (...modifiers: string[]) => ['gear-picker-ge-cost', ...modifiers, className].filter(Boolean).join(' ');

  if (!equipped) {
    return (
    <div className={classes('gear-picker-ge-cost--empty')}>
      <strong><span style={{color: colors.accentText}}>Total cost:</span></strong> <span style={{color: colors.textFaint}}>0 gp</span>
      </div>
    );
  }
  if (price.loading) {
    return <div className={classes('gear-picker-ge-cost--loading')}>Pricing…</div>;
  }
  return (
    <div className={classes()}>
      <strong><span style={{color: colors.accentText}}>Total cost:</span></strong> <span style={{color: colors.textFaint}}>{price.total.toLocaleString()} gp{price.hasUnpriced ? '+' : ''}</span>
    </div>
  );
}
