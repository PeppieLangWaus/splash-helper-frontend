import { SPLASH_FALSE_ICON, SPLASH_TRUE_ICON } from './gearpickerAssets';
import { SPLASH_SAFE_MAGIC_ATTACK_THRESHOLD } from '../../types/gear';

interface Props {
  totalMagicAttack: number;
}

/**
 * Flags whether a loadout's summed Magic Attack bonus is low enough to reliably splash — mirrors
 * the threshold RuneLite's SplashHelperPlugin.hasBadMagicAttackBonus() enforces in-game, including
 * its icon (blue = safe, red = not) matching that plugin's own overlay.
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
          Magic Attack bonus: <strong>{totalMagicAttack}</strong> must be {SPLASH_SAFE_MAGIC_ATTACK_THRESHOLD} or lower
        </span>
      </div>
    </div>
  );
}
