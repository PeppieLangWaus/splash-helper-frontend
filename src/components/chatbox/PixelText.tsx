import { layoutChatText, getFontInkBounds } from './svgChatFont';

interface Props {
  text: string;
  fontSize: number;
  color: string;
  shadowColor?: string;
  className?: string;
}

// Breathing room between stacked lines, on top of each line's own glyph height.
const LINE_GAP = -1;

/** Renders text as inline SVG built from the OSRS chat font's own glyph outlines (see
 *  svgChatFont.ts) instead of as DOM or canvas text — see svgChatFont.ts for why. A `\n` in
 *  `text` starts a new line, e.g. `"Session\nstart time:"` renders as two stacked lines. */
export default function PixelText({ text, fontSize, color, shadowColor = '#000000', className }: Props) {
  const lines = text.split('\n');
  const lineLayouts = lines.map(layoutChatText);
  const scale = fontSize / lineLayouts[0].unitsPerEm;

  // The font's own ascent/descent metrics reserve room for accents and descenders this
  // small-caps glyph set mostly doesn't draw — sizing off those left dead space above/below the
  // text, stacking two lines (label + status) taller than the button they sit in. Sizing off the
  // ink bounds of what's actually drawn keeps each box exactly as tall as its text.
  //
  // That tight-per-string sizing only holds for a single line, though: with more than one line,
  // using whichever glyphs happen to appear *in this particular string* as the row height means
  // two equally-long (2-line) labels can render at different total heights just because one of
  // them happens to contain a descender like "p" and the other doesn't — e.g. "Session / Start
  // time:" (no descenders) ending up visibly shorter than "Last / Update:" ("p" in Update). So
  // once wrapped onto multiple lines, every line instead shares the font's fixed ink bounds
  // (every glyph the font can ever draw) as its row height — still derived from the font's own
  // geometry rather than a generic estimate, just no longer dependent on this call's specific
  // words.
  const ink = (lines.length > 1 ? getFontInkBounds() : lineLayouts[0].ink) ?? { minY: 0, maxY: 0 };

  const lineHeight = Math.max(1, Math.ceil((ink.maxY - ink.minY) * scale));
  const lineStep = lineHeight + LINE_GAP;
  const maxWidthUnits = Math.max(...lineLayouts.map((l) => l.widthUnits));

  // Size the SVG to the font's actual ink bounds, not a generic line-height guess —
  // `fontSize * 1.3`-style estimates reserve room for descenders this bitmap font doesn't use,
  // which was overflowing past the button it sits in.
  const width = Math.max(1, Math.ceil(maxWidthUnits * scale) + 1); // +1 for the shadow's x offset
  const height = Math.max(1, lineStep * (lines.length - 1) + lineHeight + 1); // +1 for the shadow's y offset
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
      {lineLayouts.map((layout, i) => {
        // Center each line under the widest one, rather than left-aligning every line at x=0 —
        // a no-op for the single-line case, since then this line *is* the widest one.
        const xOffset = Math.round((maxWidthUnits - layout.widthUnits) * scale / 2);
        const y = baseline + i * lineStep;
        return (
          <g key={i}>
            <g transform={`translate(${1 + xOffset}, ${y + 1}) scale(${scale}, ${-scale})`} fill={shadowColor}>
              {layout.glyphs.map((glyph, gi) => (
                <path key={gi} d={glyph.d} transform={`translate(${glyph.x}, 0)`} />
              ))}
            </g>
            <g transform={`translate(${xOffset}, ${y}) scale(${scale}, ${-scale})`} fill={color}>
              {layout.glyphs.map((glyph, gi) => (
                <path key={gi} d={glyph.d} transform={`translate(${glyph.x}, 0)`} />
              ))}
            </g>
          </g>
        );
      })}
    </svg>
  );
}
