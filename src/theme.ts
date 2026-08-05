/** Shared color/typography tokens for inline `style={}` objects — mirrors the CSS
 *  custom properties in theme.css. Kept as plain JS values (not var(--x)) because a few
 *  spots need to interpolate them into rgba()/ternaries where CSS vars are inconvenient. */
export const colors = {
  bg: '#15110d',
  panel: '#241b14',
  panelAlt: '#2c2117',
  panelHover: '#33271a',

  border: '#3a2c20',
  borderStrong: '#5c4a38',

  inputBg: '#2f2419',
  inputBorder: '#1c140e',

  text: '#f2e8d5',
  textMuted: '#cbb896',
  textFaint: '#a3906f',
  textDisabled: '#7c6b52',

  accent: '#c2410c',
  accentHover: '#ea580c',
  accentSoft: 'rgba(194, 65, 12, 0.18)',
  accentText: '#fb923c',
  link: '#f0975a',

  danger: '#b91c1c',
  dangerSoft: 'rgba(220, 38, 38, 0.16)',
  dangerText: '#fca5a5',
  success: '#15803d',
  successSoft: 'rgba(22, 163, 74, 0.16)',
  successText: '#86efac',
  warningSoft: 'rgba(217, 119, 6, 0.18)',
  warningText: '#fcd34d',
} as const;

export const fontSerif = "'PT Serif', Georgia, Cambria, 'Times New Roman', Times, serif";
export const fontSans = "'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif";

export const shadow = '0 2px 8px rgba(0, 0, 0, 0.45)';
