import type { ImgHTMLAttributes } from 'react';
import { getIcon, getSpellIcon } from './icons';

type BaseImgProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'>;

type IconComponentProps = BaseImgProps & {
  src?: string;
  spell?: string;
  name?: string;
  size?: number | string;
};

export default function Icon({ src, spell, name, size, alt = '', width, height, ...imgProps }: IconComponentProps) {
  const resolvedSrc = src
    ?? (spell ? getSpellIcon(spell) : undefined)
    ?? (name ? getIcon(name) : undefined);

  if (!resolvedSrc) {
    // Not gated to DEV: a name/spell that doesn't resolve renders nothing with no failed
    // network request to spot in the Network tab, so this warning is the only trace of it —
    // production is exactly where that's needed most.
    const id = src ?? spell ?? name ?? '(empty)';
    console.warn(`Missing icon for "${id}"`);

    return null;
  }

  const mergedStyle = {
    ...imgProps.style,
    ...(width ?? size ? { width: width ?? size } : {}),
    ...(height ?? size ? { height: height ?? size } : {}),
  };

  return <img src={resolvedSrc} alt={alt} {...imgProps} style={mergedStyle} />;
}
