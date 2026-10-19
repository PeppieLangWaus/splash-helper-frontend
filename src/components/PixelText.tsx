import { layoutChatText, getFontInkBounds } from './svgChatFont';

interface Props {
  text: string;
  fontSize: number;
  color: string;
  shadowColor?: string;
  /** The font only has one weight drawn (see svgChatFont.ts) — "bold" is faked by stamping each
   *  glyph a second time 1px to the right, thickening every vertical stroke the same way a
   *  bitmap font's own bold cut would. */
  bold?: boolean;
  /** Use the font's own tallest ascender as the box's top, instead of this string's — so e.g. an
   *  all-digit string doesn't get a shorter box, and thus a lower baseline once centered, than one
   *  with letter ascenders in it. Pair with another PixelText in a flex row using
   *  `align-items: baseline`, which aligns SVGs by bottom edge rather than a real text baseline. */
  fixedBaseline?: boolean;
  className?: string;
}

// Breathing room between stacked lines, on top of each line's own glyph height.
const LINE_GAP = -1;

/** Renders text as inline SVG built from the OSRS chat font's own glyph outlines (see
 *  svgChatFont.ts) instead of as DOM or canvas text — see svgChatFont.ts for why. A `\n` in
 *  `text` starts a new line, e.g. `"Session\nstart time:"` renders as two stacked lines. */
export default function PixelText({
  text,
  fontSize,
  color,
  shadowColor = '#000000',
  bold = false,
  fixedBaseline = false,
  className,
}: Props) {
  const lines = text.split('\n');
  const lineLayouts = lines.map(layoutChatText);
  const scale = fontSize / lineLayouts[0].unitsPerEm;
  const boldPad = bold ? 1 : 0;

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
  const rawInk = (fixedBaseline || lines.length > 1 ? getFontInkBounds() : lineLayouts[0].ink) ?? { minY: 0, maxY: 0 };

  // Only "f"/"g"/"p"/"y" dip below the baseline — a single line pins minY to 0 (the baseline)
  // regardless, so a word with one of those doesn't get a taller box, and thus a lower centered
  // baseline, than a word without. The descender still draws past the box's bottom edge (see the
  // SVG's `overflow: visible` below) instead of being clipped. Multi-line keeps the real descender
  // room, where it would otherwise overlap the line stacked below it.
  const ink = lines.length > 1 ? rawInk : { ...rawInk, minY: 0 };

  const lineHeight = Math.max(1, Math.ceil((ink.maxY - ink.minY) * scale));
  const lineStep = lineHeight + LINE_GAP;
  const maxWidthUnits = Math.max(...lineLayouts.map((l) => l.widthUnits));

  // Size the SVG to the font's actual ink bounds, not a generic line-height guess —
  // `fontSize * 1.3`-style estimates reserve room for descenders this bitmap font doesn't use,
  // which was overflowing past the button it sits in.
  const width = Math.max(1, Math.ceil(maxWidthUnits * scale) + 1 + boldPad); // +1 for the shadow's x offset
  const height = Math.max(1, lineStep * (lines.length - 1) + lineHeight + 1); // +1 for the shadow's y offset
  const baseline = ink.maxY * scale;

  // One <g> per glyph pass — [0] for the normal weight, [0, boldPad] stamps it again 1px right.
  const passes = bold ? [0, boldPad] : [0];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-label={text}
      style={{ display: 'block', shapeRendering: 'geometricPrecision', overflow: 'visible' }}
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
            {passes.map((dx) => (
              <g key={`shadow-${dx}`} transform={`translate(${1 + xOffset + dx}, ${y + 1}) scale(${scale}, ${-scale})`} fill={shadowColor}>
                {layout.glyphs.map((glyph, gi) => (
                  <path key={gi} d={glyph.d} transform={`translate(${glyph.x}, 0)`} />
                ))}
              </g>
            ))}
            {passes.map((dx) => (
              <g key={`fill-${dx}`} transform={`translate(${xOffset + dx}, ${y}) scale(${scale}, ${-scale})`} fill={color}>
                {layout.glyphs.map((glyph, gi) => (
                  <path key={gi} d={glyph.d} transform={`translate(${glyph.x}, 0)`} />
                ))}
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
}
