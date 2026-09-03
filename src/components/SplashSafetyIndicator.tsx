import { colors, fontSerif } from '../theme';
import { SPLASH_SAFE_MAGIC_ATTACK_THRESHOLD } from '../types/gear';

const s = {
  box: (safe: boolean) => ({
    padding: '0.75rem 1rem',
    borderRadius: 8,
    border: `1px solid ${safe ? colors.success : colors.danger}`,
    background: safe ? colors.successSoft : colors.dangerSoft,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.2rem',
  }),
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
 * number, not just "low."
 */
export default function SplashSafetyIndicator({ totalMagicAttack }: Props) {
  const safe = totalMagicAttack <= SPLASH_SAFE_MAGIC_ATTACK_THRESHOLD;
  return (
    <div style={s.box(safe)}>
      <span style={s.title(safe)}>{safe ? '✓ Splash-safe' : '✗ Not splash-safe'}</span>
      <span style={s.detail}>
        Total Magic Attack bonus: <strong>{totalMagicAttack}</strong> (needs to be{' '}
        {SPLASH_SAFE_MAGIC_ATTACK_THRESHOLD} or lower)
      </span>
    </div>
  );
}
