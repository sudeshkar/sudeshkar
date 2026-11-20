import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// The blue of the snake monogram (#2e54fe) runs through the whole page: the
// header field, these cards and the calendar ramp, with the peach of the name as
// the accent where the field is dark. Every text colour keeps at least 4.5:1
// against its card. Two palettes so the README can serve a real light and dark
// asset through <picture>.
export const THEMES = {
  dark: {
    id: 'dark',
    paper: '#070e33',
    ink: '#e8ecff',
    inkStrong: '#ffffff',
    muted: '#9aa6d6',
    rule: '#18235e',
    ruleStrong: '#2b3a8f',
    accent: '#efbfa3',
    accentDeep: '#2e54fe',
    empty: '#0f1a4d',
    ramp: ['#1a2c8a', '#2443d6', '#5a78ff', '#a9b8ff'],
  },
  light: {
    id: 'light',
    paper: '#f4f6ff',
    ink: '#0b1240',
    inkStrong: '#050a2a',
    muted: '#4f5a85',
    rule: '#dde2f7',
    ruleStrong: '#b7c1ea',
    accent: '#2e54fe',
    accentDeep: '#1a2f9e',
    empty: '#e3e8fb',
    ramp: ['#c3cdff', '#8ea2ff', '#4d6bff', '#2440d0'],
  },
}

export const FIELD = {
  edge: '#070e33',
  mid: '#0e1d63',
  glow: '#2843c9',
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
