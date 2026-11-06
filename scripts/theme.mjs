import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// The same tokens as the portfolio (portfolio-v4/src/index.css), so the profile and
// the site read as one identity: warm paper, a peach name, a dark terracotta field.
// Two palettes so the README can serve a real light and dark asset through <picture>.
export const THEMES = {
  dark: {
    id: 'dark',
    paper: '#151413',
    ink: '#faf6ef',
    inkStrong: '#ffffff',
    muted: '#a8a29b',
    rule: '#2d2925',
    ruleStrong: '#4d4640',
    accent: '#efbfa3',
    accentDeep: '#ee8f63',
    empty: '#231f1b',
    ramp: ['#54301f', '#935436', '#ee8f63', '#efbfa3'],
  },
  light: {
    id: 'light',
    paper: '#faf6ef',
    ink: '#151413',
    inkStrong: '#000000',
    muted: '#6b655f',
    rule: '#e4dccf',
    ruleStrong: '#c4b9a8',
    accent: '#b9552a',
    accentDeep: '#7a4128',
    empty: '#f1eadf',
    ramp: ['#f6d9c7', '#efbfa3', '#ee8f63', '#b9552a'],
  },
}

export const FIELD = {
  edge: '#2b1710',
  mid: '#3d2014',
  glow: '#7a4128',
  peach: '#efbfa3',
  paper: '#faf6ef',
  bone: '#ffffff',
}

// GitHub serves README SVGs through <img>, which may not fetch anything, so Archivo
// has to travel inside each file. The subsets in assets/fonts are static instances of
// the variable font (built once from Google Fonts' Archivo[wdth,wght]) cut to ASCII
// plus a few marks, about 7 KB each.
const FONT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'fonts')
const FACES = {
  display: 'archivo-display',
  condensed: 'archivo-condensed',
  regular: 'archivo-regular',
  semibold: 'archivo-semibold',
}
const fontData = Object.fromEntries(
  Object.entries(FACES).map(([k, file]) => [
    k,
    readFileSync(join(FONT_DIR, `${file}.woff2`)).toString('base64'),
  ]),
)

const FALLBACK = "'Arial Narrow','Helvetica Neue',Arial,sans-serif"

/** @font-face rules plus a class per face, for only the faces a card uses. */
export function fonts(...faces) {
  return faces
    .map(
      (k) => `@font-face { font-family:'A-${k}'; src:url(data:font/woff2;base64,${fontData[k]}) format('woff2'); }
  .${k} { font-family:'A-${k}',${FALLBACK}; }`,
    )
    .join('\n  ')
}

export const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

export const EASE = 'cubic-bezier(.16,1,.3,1)'

// One entrance per card and nothing that loops. Reduced motion shows the end state.
export const MOTION = `
  @keyframes up { from { transform:translateY(105%); } to { transform:translateY(0); } }
  @keyframes in { from { opacity:0; } to { opacity:1; } }
  @keyframes grow { from { transform:scaleX(0); } to { transform:scaleX(1); } }
  @keyframes rise { from { transform:scaleY(0); } to { transform:scaleY(1); } }
  .in { animation:in .9s ${EASE} both; }
  @media (prefers-reduced-motion: reduce) {
    * { animation:none !important; }
  }
`

export const fmt = (n) =>
  n >= 10000 ? `${Math.round(n / 1000)}k` : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
