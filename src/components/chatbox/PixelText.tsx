import { layoutChatText } from './svgChatFont';

interface Props {
  text: string;
  fontSize: number;
  color: string;
  shadowColor?: string;
  className?: string;
}

/** Renders text as inline SVG built from the OSRS chat font's own glyph outlines (see
 *  svgChatFont.ts) instead of as DOM or canvas text — see svgChatFont.ts for why. */
export default function PixelText({ text, fontSize, color, shadowColor = '#000000', className }: Props) {
  const layout = layoutChatText(text);
  const scale = fontSize / layout.unitsPerEm;
  // The font's own ascent/descent metrics reserve room for accents and descenders this
  // small-caps glyph set mostly doesn't draw — sizing off those left dead space above/below the
  // text, stacking two lines (label + status) taller than the button they sit in. Sizing off the
  // ink bounds of what's actually drawn keeps each box exactly as tall as its text.
  const ink = layout.ink ?? { minY: 0, maxY: 0 };

  // Size the SVG to the font's actual ink bounds, not a generic line-height guess —
  // `fontSize * 1.3`-style estimates reserve room for descenders this bitmap font doesn't use,
  // which was overflowing past the button it sits in.
  const width = Math.max(1, Math.ceil(layout.widthUnits * scale) + 1); // +1 for the shadow's x offset
  const height = Math.max(1, Math.ceil((ink.maxY - ink.minY) * scale) + 1); // +1 for the shadow's y offset
  const baseline = ink.maxY * scale;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-label={text}
      style={{ display: 'block', shapeRendering: 'geometricPrecision' }}
    >
      {/* 1px-offset shadow first, main glyphs on top — same look as the old CSS text-shadow.
          Glyph coordinates are y-up with the baseline at 0 (SVG-font convention), so each group
          flips them into SVG's y-down space and drops the baseline at the right height. */}
      <g transform={`translate(1, ${baseline + 1}) scale(${scale}, ${-scale})`} fill={shadowColor}>
        {layout.glyphs.map((glyph, i) => (
          <path key={i} d={glyph.d} transform={`translate(${glyph.x}, 0)`} />
        ))}
      </g>
      <g transform={`translate(0, ${baseline}) scale(${scale}, ${-scale})`} fill={color}>
        {layout.glyphs.map((glyph, i) => (
          <path key={i} d={glyph.d} transform={`translate(${glyph.x}, 0)`} />
        ))}
      </g>
    </svg>
  );
}
