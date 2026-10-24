import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import './OSRSSquareButton.css';

const NATIVE_CORNER_PX = 9;
const NATIVE_BORDER_PX = 3;
const CORNER_TO_BORDER_RATIO = NATIVE_CORNER_PX / NATIVE_BORDER_PX;

const REFERENCE_SIZE_PX = 36;

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children?: ReactNode;

  width?: string | number;
  height?: string | number;

  referenceSize?: number;

  scaleWithSize?: boolean;
}

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
