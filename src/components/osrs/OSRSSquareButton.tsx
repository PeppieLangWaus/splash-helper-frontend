import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import './OSRSSquareButton.css';

const NATIVE_CORNER_PX = 9;
const NATIVE_BORDER_PX = 3;
const CORNER_TO_BORDER_RATIO = NATIVE_CORNER_PX / NATIVE_BORDER_PX;
/** Button size (px) the sprites render at 1:1 — larger or smaller buttons scale them in proportion. */
const REFERENCE_SIZE_PX = 36;

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children?: ReactNode;
  /** Outer size of the button, including the chrome. A number is px; omit to shrink-wrap
   *  `children` (never smaller than two corners per side). */
  width?: string | number;
  height?: string | number;
  /** Size (px) at which the sprites render at native pixel size; the corners and borders scale
   *  by `size / referenceSize`, snapped to a whole-pixel border thickness. Only numeric `width`/`height` drive scaling — a CSS string size
   *  can't be resolved here, so with none numeric the sprites stay native. */
  referenceSize?: number;
  /** When false the corners and borders always render at native size (9px / 3px), whatever the
   *  button's size. Defaults to true. */
  scaleWithSize?: boolean;
}

/**
 * A square OSRS-chrome button built from the 9-slice sprites in
 * public/assets/icons/components/buttons/square/. Size it with `width`/`height`; the corners and
 * borders scale in proportion to the size (see `referenceSize`) and the borders repeat along
 * each side without ever changing aspect ratio. The fill is a static colour, swapped on hover along with the sprite set (see OSRSSquareButton.css).
 */
export default function OSRSSquareButton({
  children,
  width,
  height,
  referenceSize = REFERENCE_SIZE_PX,
  scaleWithSize = true,
  className,
  style,
  type = 'button',
  ...buttonProps
}: Props) {
  const numericSizes = [width, height].filter((size): size is number => typeof size === 'number');
  const scale = scaleWithSize && numericSizes.length > 0 ? Math.min(...numericSizes) / referenceSize : 1;
  // Whole-pixel border thickness, with the corner derived from it, so the corner's own edge
  // lines up exactly with the border strips instead of drifting by a sub-pixel.
  const borderPx = Math.max(1, Math.round(NATIVE_BORDER_PX * scale));
  const chromeVars = {
    '--sb-corner': `${borderPx * CORNER_TO_BORDER_RATIO}px`,
    '--sb-border': `${borderPx}px`,
  } as CSSProperties;

  return (
    <button
      type={type}
      className={'osrs-square-button' + (className ? ` ${className}` : '')}
      style={{ ...chromeVars, width, height, ...style }}
      {...buttonProps}
    >
      <span className="osrs-square-button__bg" />
      <span className="osrs-square-button__border osrs-square-button__border--top" />
      <span className="osrs-square-button__border osrs-square-button__border--bottom" />
      <span className="osrs-square-button__border osrs-square-button__border--left" />
      <span className="osrs-square-button__border osrs-square-button__border--right" />
      <span className="osrs-square-button__corner osrs-square-button__corner--tl" />
      <span className="osrs-square-button__corner osrs-square-button__corner--tr" />
      <span className="osrs-square-button__corner osrs-square-button__corner--bl" />
      <span className="osrs-square-button__corner osrs-square-button__corner--br" />
      <span className="osrs-square-button__content">{children}</span>
    </button>
  );
}
