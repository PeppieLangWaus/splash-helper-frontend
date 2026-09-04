import { colors, fontSerif } from '../theme';
import { SPLASH_FALSE_ICON, SPLASH_TRUE_ICON } from '../utils/gearpickerAssets';
import { SPLASH_SAFE_MAGIC_ATTACK_THRESHOLD } from '../types/gear';

const s = {
  box: { display: 'flex', alignItems: 'center', gap: '0.6rem' },
  icon: { width: 28, height: 28, imageRendering: 'pixelated' as const, flexShrink: 0 },
  text: { display: 'flex', flexDirection: 'column' as const, gap: '0.1rem' },
  title: (safe: boolean) => ({
    fontFamily: fontSerif,
    fontWeight: 700,
    fontSize: '0.95rem',
    color: safe ? colors.successText : colors.dangerText,
  }),
  detail: { fontSize: '0.8rem', color: colors.textMuted },
} as const;

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
    <div style={s.box}>
      <img src={safe ? SPLASH_TRUE_ICON : SPLASH_FALSE_ICON} alt="" style={s.icon} />
      <div style={s.text}>
        <span style={s.title(safe)}>{safe ? 'Splash-safe' : 'Not splash-safe'}</span>
        <span style={s.detail}>
          Total Magic Attack bonus: <strong>{totalMagicAttack}</strong> (needs to be{' '}
          {SPLASH_SAFE_MAGIC_ATTACK_THRESHOLD} or lower)
        </span>
      </div>
    </div>
  );
}
