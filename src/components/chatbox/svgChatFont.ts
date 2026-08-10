import fontSource from '/assets/fonts/runescape_chat_font.svg?raw';

interface Glyph {
  /** SVG path data in font units, y-up with baseline at 0 (FontForge/SVG-font convention). */
  d: string;
  advance: number;
}

interface ChatFont {
  glyphs: Map<string, Glyph>;
  unitsPerEm: number;
  ascent: number;
  descent: number;
  /** Advance width for glyphs that don't set their own horiz-adv-x. */
  fallbackAdvance: number;
}

let cached: ChatFont | null = null;

/** Parses the OSRS chat font's SVG glyph outlines (src/font/font/runescape_chat_font.svg, from
 *  the Fonts2u "Runescape Chat Font" kit) once per page load and caches the result. The glyphs
 *  are hand-drawn as pure horizontal/vertical strokes, so — unlike loading the same font as a
 *  regular @font-face and drawing DOM/canvas text with it — reading the path outlines straight
 *  out of the font file and rendering them as SVG <path>s ourselves sidesteps the browser's font
 *  rasterizer entirely, which is what was anti-aliasing/blurring these bitmap-style glyphs at
 *  chat-UI sizes no matter what font-size, font-weight, or text-shadow was set. */
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
    if (unicode === null) return; // ligature/alternate glyphs with no direct character mapping
    glyphs.set(unicode, {
      d: el.getAttribute('d') ?? '', // space and other blank glyphs carry no path data
      advance: Number(el.getAttribute('horiz-adv-x')) || fallbackAdvance,
    });
  });

  cached = { glyphs, unitsPerEm, ascent, descent, fallbackAdvance };
  return cached;
}

/** Traces a glyph's path data to find its ink bounds, in the glyph's own local coordinates
 *  (y-up, baseline at 0). Every glyph in this font is drawn with only M/h/v/z (moveto absolute,
 *  horizontal/vertical lineto relative, closepath) — no curves — so the extremes of the path are
 *  just every point the pen visits. */
function traceGlyphBoundsY(d: string): { minY: number; maxY: number } | null {
  const tokens = d.match(/[Mhvz]|-?\d+(?:\.\d+)?/g);
  if (!tokens) return null;

  let y = 0;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === 'M') {
      i++; // skip the x argument, we only need y here
      y = Number(tokens[++i]);
    } else if (t === 'v') {
      y += Number(tokens[++i]);
    } else if (t === 'h' || t === 'z') {
      continue; // doesn't move the pen vertically
    } else {
      continue;
    }
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return minY === Infinity ? null : { minY, maxY };
}

export interface ChatTextLayout {
  /** One entry per glyph with visible path data (blank glyphs like space are skipped). */
  glyphs: { d: string; x: number }[];
  /** Total advance width, in font units. */
  widthUnits: number;
  unitsPerEm: number;
  /** Ink bounds of the glyphs actually drawn, in font units (y-up, baseline at 0) — tighter
   *  than the font's own ascent/descent metrics, which reserve room for accents and descenders
   *  this small-caps font's glyph set mostly doesn't use. Null for blank text (e.g. all spaces). */
  ink: { minY: number; maxY: number } | null;
}

/** Lays out `text` left-to-right using the chat font's glyph advances. The font only covers
 *  U+0020-007E; characters outside that range are skipped but still advance by `fallbackAdvance`
 *  so layout doesn't collapse around them. */
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
