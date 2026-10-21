import fontSource from '/assets/fonts/runescape_chat_font.svg?raw';

interface Glyph {

  d: string;
  advance: number;
}

interface ChatFont {
  glyphs: Map<string, Glyph>;
  unitsPerEm: number;
  ascent: number;
  descent: number;

  fallbackAdvance: number;

  fullInk: { minY: number; maxY: number } | null;
}

let cached: ChatFont | null = null;

function getChatFont(): ChatFont {
  if (cached) return cached;

  const doc = new DOMParser().parseFromString(fontSource, 'image/svg+xml');
  const fontEl = doc.querySelector('font');
  const faceEl = doc.querySelector('font-face');

  const unitsPerEm = Number(faceEl?.getAttribute('units-per-em')) || 1000;
  const ascent = Number(faceEl?.getAttribute('ascent')) || unitsPerEm * 0.8;
  const descent = Number(faceEl?.getAttribute('descent')) || 0;
  const fallbackAdvance =
    Number(fontEl?.getAttribute('horiz-adv-x')) ||
    Number(doc.querySelector('missing-glyph')?.getAttribute('horiz-adv-x')) ||
    unitsPerEm / 2;

  const glyphs = new Map<string, Glyph>();
  doc.querySelectorAll('glyph').forEach((el) => {
    const unicode = el.getAttribute('unicode');
    if (unicode === null) return;
    glyphs.set(unicode, {
      d: el.getAttribute('d') ?? '',
      advance: Number(el.getAttribute('horiz-adv-x')) || fallbackAdvance,
    });
  });

  let fullMinY = Infinity;
  let fullMaxY = -Infinity;
  glyphs.forEach((glyph) => {
    if (!glyph.d) return;
    const bounds = traceGlyphBoundsY(glyph.d);
    if (!bounds) return;
    if (bounds.minY < fullMinY) fullMinY = bounds.minY;
    if (bounds.maxY > fullMaxY) fullMaxY = bounds.maxY;
  });
  const fullInk = fullMinY === Infinity ? null : { minY: fullMinY, maxY: fullMaxY };

  cached = { glyphs, unitsPerEm, ascent, descent, fallbackAdvance, fullInk };
  return cached;
}

export function getFontInkBounds(): { minY: number; maxY: number } | null {
  return getChatFont().fullInk;
}

function traceGlyphBoundsY(d: string): { minY: number; maxY: number } | null {
  const tokens = d.match(/[Mhvz]|-?\d+(?:\.\d+)?/g);
  if (!tokens) return null;

  let y = 0;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === 'M') {
      i++;
      y = Number(tokens[++i]);
    } else if (t === 'v') {
      y += Number(tokens[++i]);
    } else if (t === 'h' || t === 'z') {
      continue;
    } else {
      continue;
    }
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return minY === Infinity ? null : { minY, maxY };
}

export interface ChatTextLayout {

  glyphs: { d: string; x: number }[];

  widthUnits: number;
  unitsPerEm: number;

  ink: { minY: number; maxY: number } | null;
}

export function layoutChatText(text: string): ChatTextLayout {
  const font = getChatFont();
  let x = 0;
  const glyphs: { d: string; x: number }[] = [];
  let minY = Infinity;
  let maxY = -Infinity;
  for (const ch of text) {
    const glyph = font.glyphs.get(ch);
    if (glyph?.d) {
      glyphs.push({ d: glyph.d, x });
      const bounds = traceGlyphBoundsY(glyph.d);
      if (bounds) {
        if (bounds.minY < minY) minY = bounds.minY;
        if (bounds.maxY > maxY) maxY = bounds.maxY;
      }
    }
    x += glyph?.advance ?? font.fallbackAdvance;
  }
  return {
    glyphs,
    widthUnits: x,
    unitsPerEm: font.unitsPerEm,
    ink: minY === Infinity ? null : { minY, maxY },
  };
}
