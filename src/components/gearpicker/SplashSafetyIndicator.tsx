import { SPLASH_FALSE_ICON, SPLASH_TRUE_ICON } from './gearpickerAssets';
import { SPLASH_SAFE_MAGIC_ATTACK_THRESHOLD } from '../../types/gear';

interface Props {
  totalMagicAttack: number;
}

/**
 * Flags whether a loadout's summed Magic Attack bonus is low enough to reliably splash — the
 * same rule already enforced in-game by the RuneLite plugin (splash-helper's
 * SplashHelperPlugin.hasBadMagicAttackBonus()): the total must be -64 or lower, a negative
 * number, not just "low." The wizard-hat icon (blue = safe, red = not) mirrors that plugin's own
 * in-game overlay.
 */
export default function SplashSafetyIndicator({ totalMagicAttack }: Props) {
  const safe = totalMagicAttack <= SPLASH_SAFE_MAGIC_ATTACK_THRESHOLD;
  return (
    <div className="splash-safety">
      <img src={safe ? SPLASH_TRUE_ICON : SPLASH_FALSE_ICON} alt="" className="splash-safety__icon" />
      <div className="splash-safety__text">
        <span className={`splash-safety__title${safe ? ' splash-safety__title--safe' : ' splash-safety__title--unsafe'}`}>
          {safe ? 'Splash-safe' : 'Not splash-safe'}
        </span>
        <span className="splash-safety__detail">
          Total Magic Attack bonus: <strong>{totalMagicAttack}</strong> (needs to be{' '}
          {SPLASH_SAFE_MAGIC_ATTACK_THRESHOLD} or lower)
        </span>
      </div>
    </div>
  );
}
