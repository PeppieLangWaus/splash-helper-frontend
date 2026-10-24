import { layoutChatText, getFontInkBounds } from './svgChatFont';

interface Props {
  text: string;
  fontSize: number;
  color: string;
  shadowColor?: string;

  bold?: boolean;

  fixedBaseline?: boolean;
  className?: string;
}

const LINE_GAP = -1;

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

  const rawInk = (fixedBaseline || lines.length > 1 ? getFontInkBounds() : lineLayouts[0].ink) ?? { minY: 0, maxY: 0 };

  const ink = lines.length > 1 ? rawInk : { ...rawInk, minY: 0 };

  const lineHeight = Math.max(1, Math.ceil((ink.maxY - ink.minY) * scale));
  const lineStep = lineHeight + LINE_GAP;
  const maxWidthUnits = Math.max(...lineLayouts.map((l) => l.widthUnits));

  const width = Math.max(1, Math.ceil(maxWidthUnits * scale) + 1 + boldPad);
  const height = Math.max(1, lineStep * (lines.length - 1) + lineHeight + 1);
  const baseline = ink.maxY * scale;

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
      {}
      {lineLayouts.map((layout, i) => {
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
