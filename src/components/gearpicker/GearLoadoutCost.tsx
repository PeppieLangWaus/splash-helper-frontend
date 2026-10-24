import { useGearLoadoutPrice } from './useGearLoadoutPrice';
import PixelText from '../PixelText';
import { colors } from '../../theme';
import type { GearLoadoutSlots } from '../../types/gear';

const ABBREVIATION_UNITS = [
  { suffix: 'K', size: 1e3 },
  { suffix: 'M', size: 1e6 },
  { suffix: 'B', size: 1e9 },
];

function formatGpAbbreviated(amount: number): string {
  let unitIndex = ABBREVIATION_UNITS.findLastIndex(({ size }) => amount >= size);
  if (unitIndex === -1) return String(amount);

  let rounded = Math.round((amount / ABBREVIATION_UNITS[unitIndex].size) * 10) / 10;
  if (rounded >= 1000 && unitIndex < ABBREVIATION_UNITS.length - 1) {
    unitIndex += 1;
    rounded = Math.round((amount / ABBREVIATION_UNITS[unitIndex].size) * 10) / 10;
  }
  return `${rounded}${ABBREVIATION_UNITS[unitIndex].suffix}`;
}

function formatGpFull(amount: number): string {
  return amount.toLocaleString('de-DE');
}

interface Props {
  slots: GearLoadoutSlots;

  abbreviated?: boolean;

  className?: string;
}

export default function GearLoadoutCost({ slots, abbreviated = false, className }: Props) {
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
        text={`${abbreviated ? formatGpAbbreviated(price.total) : formatGpFull(price.total)} gp`}
        fontSize={19.2}
        color={colors.textFaint}
        fixedBaseline
      />
    </div>
  );
}
