import { useGearLoadoutPrice } from './useGearLoadoutPrice';
import PixelText from '../PixelText';
import { colors } from '../../theme';
import type { GearLoadoutSlots } from '../../types/gear';

interface Props {
  slots: GearLoadoutSlots;
  /** Extra class appended alongside the base gear-picker-ge-cost one — e.g. a modifier for
   *  placement under the Bonuses panel's header title (see GearPickerView.tsx). */
  className?: string;
}

/** The combined GE cost of a loadout's equipped items; trailing "+" means at least one has no
 *  GE price (untradeable, or no recent trade data). */
export default function GearLoadoutCost({ slots, className }: Props) {
  const price = useGearLoadoutPrice(slots);
  const equipped = Object.values(slots).some((id) => id !== undefined);

  const rootClass = ['gear-picker-ge-cost', className].filter(Boolean).join(' ');

  if (!equipped) {
    return (
      <div className={rootClass}>
        <PixelText text="Total cost:" fontSize={19.2} color={colors.accentText} bold fixedBaseline />
        <PixelText text="0 gp" fontSize={19.2} color={colors.textFaint} fixedBaseline />
      </div>
    );
  }
  if (price.loading) {
    return (
      <div className={rootClass}>
        <PixelText text="Pricing..." fontSize={19.2} color={colors.textFaint} fixedBaseline />
      </div>
    );
  }
  return (
    <div className={rootClass}>
      <PixelText text="Total cost:" fontSize={19.2} color={colors.accentText} bold fixedBaseline />
      <PixelText
        text={`${price.total.toLocaleString()} gp${price.hasUnpriced ? '+' : ''}`}
        fontSize={19.2}
        color={colors.textFaint}
        fixedBaseline
      />
    </div>
  );
}
