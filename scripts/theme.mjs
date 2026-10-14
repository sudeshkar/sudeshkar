import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// The same tokens as the portfolio (portfolio-v3/src/index.css), so the profile and
// the site read as one identity: a crimson field, cream paper, black ink.
// Two palettes so the README can serve a real light and dark asset through <picture>.
export const THEMES = {
  dark: {
    id: 'dark',
    paper: '#000000',
    ink: '#f2ede4',
    inkStrong: '#ffffff',
    muted: '#9b958d',
    rule: '#2a2622',
    ruleStrong: '#4a443e',
    accent: '#f2321c',
    accentDeep: '#d01029',
    empty: '#16130f',
    ramp: ['#4a0a14', '#8a0c1f', '#d01029', '#f2321c'],
  },
  light: {
    id: 'light',
    paper: '#f2ede4',
    ink: '#1c1a17',
    inkStrong: '#000000',
    muted: '#5b5650',
    rule: '#d9d1c3',
    ruleStrong: '#b5ab9b',
    accent: '#d01029',
    accentDeep: '#6e0715',
    empty: '#e6dfd2',
    ramp: ['#f1b3ba', '#e4596b', '#d01029', '#6e0715'],
  },
}

export const CRIMSON = { field: '#d01029', hot: '#f2321c', deep: '#6e0715', ink: '#3d040c', bone: '#ffffff', cream: '#f2ede4' }

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
