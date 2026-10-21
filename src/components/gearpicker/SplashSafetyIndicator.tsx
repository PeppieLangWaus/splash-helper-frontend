import { SPLASH_FALSE_ICON, SPLASH_TRUE_ICON } from './gearpickerAssets';
import { SPLASH_SAFE_MAGIC_ATTACK_THRESHOLD } from '../../types/gear';
import PixelText from '../PixelText';
import { colors } from '../../theme';

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
        <PixelText
          text={safe ? 'Splash-safe' : 'Not splash-safe'}
          fontSize={20}
          color={safe ? colors.successText : colors.dangerText}
          bold
        />
        <PixelText
          text={`Magic Attack bonus: ${totalMagicAttack} must be ${SPLASH_SAFE_MAGIC_ATTACK_THRESHOLD} or lower`}
          fontSize={12.8}
          color={colors.textMuted}
        />
      </div>
    </div>
  );
}
